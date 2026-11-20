/**
 * JollyRx – B2B Pharma CDMO
 * Secure Server-Side RFQ Ingestion Proxy
 * 
 * - Masks the Zoho Flow Webhook URL behind an environment variable.
 * - Protects against bot spam with honeypot & IP rate-limiting.
 * - Enforces server-side validation for pharmaceutical B2B inquiries.
 * - Formats payloads into exact snake_case schema required by Zoho Flow.
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config(); // Fallback to root .env
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const ZOHO_FLOW_WEBHOOK_URL = process.env.ZOHO_FLOW_WEBHOOK_URL;

// Middleware
app.use(cors({
  origin: '*', // Allows requests from Zoho Commerce storefront domain
  methods: ['POST', 'GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple in-memory rate limiting (max 10 requests per minute per IP)
const ipRateLimit = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10;

function rateLimiter(req, res, next) {
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const record = ipRateLimit.get(clientIp) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW };

  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + RATE_LIMIT_WINDOW;
  } else {
    record.count++;
  }

  ipRateLimit.set(clientIp, record);

  if (record.count > MAX_REQUESTS) {
    return res.status(429).json({
      success: false,
      error: 'Rate limit exceeded. Please wait before submitting another inquiry.'
    });
  }

  next();
}

// Base Route
app.get('/', (req, res) => {
  res.json({
    service: 'JollyRx B2B Pharma RFQ Ingestion Proxy',
    status: 'online',
    configured: Boolean(ZOHO_FLOW_WEBHOOK_URL),
    endpoints: {
      health: 'GET /api/health',
      rfq: 'POST /api/rfq'
    }
  });
});

app.get('/api', (req, res) => {
  res.json({
    service: 'JollyRx B2B Pharma RFQ Ingestion Proxy',
    status: 'online',
    configured: Boolean(ZOHO_FLOW_WEBHOOK_URL),
    endpoints: {
      health: 'GET /api/health',
      rfq: 'POST /api/rfq'
    }
  });
});

// Health Check Endpoint (Safe for diagnostics - never exposes secrets)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'JollyRx RFQ Ingestion Proxy',
    configured: Boolean(ZOHO_FLOW_WEBHOOK_URL)
  });
});

// Primary RFQ Ingestion Route
app.post('/api/rfq', rateLimiter, async (req, res) => {
  try {
    const body = req.body || {};

    // 1. Bot Honeypot Check
    if (body.company_fax || body.hp_check) {
      // Silently discard bot submission
      return res.status(200).json({
        success: true,
        message: 'Inquiry received.'
      });
    }

    // 2. Extract Fields (Supporting both snake_case and PascalCase input)
    const buyerName = (body.buyer_name || body.Buyer_Name || '').trim();
    const buyerEmail = (body.buyer_email || body.Buyer_Email || '').trim().toLowerCase();
    const rawQty = body.target_quantity !== undefined ? body.target_quantity : body.Target_Quantity;
    const targetQty = parseInt(rawQty, 10);
    const maskedNodeId = (body.masked_node_id || body.Masked_Node_ID || '').trim();

    // 3. Strict Server-Side Validation
    if (!buyerName || buyerName.length < 2 || buyerName.length > 100) {
      return res.status(400).json({
        success: false,
        error: 'Buyer Name is required (2 to 100 characters).'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!buyerEmail || !emailRegex.test(buyerEmail)) {
      return res.status(400).json({
        success: false,
        error: 'A valid commercial business email is required.'
      });
    }

    if (isNaN(targetQty) || targetQty <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Target Quantity must be a positive integer greater than zero.'
      });
    }

    const allowedNodes = ['NODE-GJ-01', 'NODE-MH-02', 'NODE-MP-03'];
    if (!maskedNodeId || !allowedNodes.includes(maskedNodeId)) {
      return res.status(400).json({
        success: false,
        error: `Invalid Masked Node ID. Must be one of: ${allowedNodes.join(', ')}`
      });
    }

    // 4. Verify Webhook Configuration
    if (!ZOHO_FLOW_WEBHOOK_URL) {
      console.error('[Configuration Error] ZOHO_FLOW_WEBHOOK_URL is not set.');
      return res.status(503).json({
        success: false,
        error: 'Ingestion service is temporarily unconfigured. Please contact operations.'
      });
    }

    // 5. Construct Sanitized Payload for Zoho Flow
    const flowPayload = {
      masked_node_id: maskedNodeId,
      buyer_name: buyerName,
      buyer_email: buyerEmail,
      target_quantity: targetQty
    };

    // 6. Forward Request Securely to Zoho Flow
    const response = await fetch(ZOHO_FLOW_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(flowPayload)
    });

    if (!response.ok) {
      console.error(`[Zoho Flow Webhook Response] HTTP ${response.status}`);
      return res.status(502).json({
        success: false,
        error: 'Gateway temporarily unable to route inquiry. Please try again shortly.'
      });
    }

    // Return safe confirmation without disclosing internal credentials
    return res.status(200).json({
      success: true,
      message: 'RFQ inquiry successfully registered with JollyRx Vault.',
      masked_node_id: maskedNodeId,
      target_quantity: targetQty
    });

  } catch (err) {
    console.error('[Proxy Error]', err.message);
    return res.status(500).json({
      success: false,
      error: 'An unexpected internal error occurred. Please try again later.'
    });
  }
});

// Export app for serverless platforms (e.g., Vercel)
module.exports = app;

// Start standalone server only when executed directly (local development)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[JollyRx Proxy] Operational on port ${PORT}`);
  });
}
