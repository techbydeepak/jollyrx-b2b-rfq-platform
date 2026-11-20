# JollyRx – B2B Pharmaceutical CDMO Platform

A secure B2B Contract Development and Manufacturing Organization (CDMO) digital platform prototype. It allows pharmaceutical procurement officers and brand owners to discover contract manufacturing capacity while keeping the confidential identities and physical addresses of manufacturing plants completely protected.

---

## 1. Project Overview

In pharmaceutical contract manufacturing, partner facilities frequently possess spare production capacity across essential drug formulations (tablets, capsules, syrups). However, publishing sensitive factory names, addresses, and drug license numbers on an open storefront invites unwanted competition and regulatory exposure.

JollyRx solves this by implementing a **Masked Architecture**:
- **Zoho Creator (Confidential Plant Vault):** Secure internal database storing legal entity names, factory addresses, and drug licenses.
- **Zoho Commerce (Public Storefront):** Publicly lists only anonymized capability tokens (`NODE-GJ-01`, `NODE-MH-02`, `NODE-MP-03`) with molecule specifications, certifications (WHO-GMP, Schedule M), and minimum order quantities.
- **Zoho Flow (Integration Highway):** Relays quote inquiries from the storefront into Zoho Creator and links the inquiry to the corresponding plant record.
- **Node.js / Express Ingestion Proxy:** Hides all Zoho Flow webhook URLs and zapikeys on the server side, provides rate limiting, and protects against automated bot spam.

---

## 2. Main Features

- **Masked Product Catalog:** Displays three masked pharmaceutical nodes (`NODE-GJ-01`, `NODE-MH-02`, `NODE-MP-03`) with dosage forms, certifications, and minimum batch sizes.
- **B2B Storefront Customization:** Suppresses consumer retail pricing and cart buttons on the Aura theme, replacing them with commercial "Request Quote" buttons.
- **Responsive RFQ Embed Form:** Embedded directly on the "Submit RFQ" page; captures Buyer Name, Business Email, Target Quantity, and Masked Node ID.
- **Contextual Pre-fill:** Clicking "Request Quote" on a product card navigates to `/submit-rfq?node=NODE-XX-YY` and automatically pre-selects that node in the dropdown.
- **Anti-Bot & Abuse Protection:** Includes a hidden honeypot trap (`company_fax`) that silently discards spam, and in-memory rate limiting (10 requests/minute per IP).
- **Relational Integrity in Zoho Creator:** When an RFQ is received, Zoho Flow searches `Plant_Master` by node ID and links the inquiry directly to the master record. A Deluge workflow automatically populates molecule, dosage form, and current date.

---

## 3. Technologies Used

- **Zoho Commerce:** Hosted B2B storefront (Aura theme) with custom CSS and JavaScript.
- **Zoho Creator:** Private internal database (`Plant_Master` and `RFQ_Inquiries` forms, Deluge workflows).
- **Zoho Flow:** Server-to-server integration bridge (`Webhook → Fetch Record → Create Record`).
- **Node.js & Express:** Backend ingestion proxy ensuring zero secret leakage to the browser.
- **Vercel:** Cloud hosting platform for the backend serverless proxy.

---

## 4. Simple Project Architecture

```
+-------------------------------------------------------------+
|               Zoho Commerce (Public Storefront)             |
|  - Custom Aura theme (pricing & cart hidden)                |
|  - Masked Products: NODE-GJ-01, NODE-MH-02, NODE-MP-03      |
|  - Embedded RFQ Form: Buyer Name, Email, Qty, Node ID       |
+------------------------------+------------------------------+
                               |
                               | POST /api/rfq (CORS-enabled)
                               v
+-------------------------------------------------------------+
|             Backend Proxy (Node.js / Express / Vercel)      |
|  - Hides Zoho Flow Webhook URL & credentials in .env        |
|  - Client and server-side validation                        |
|  - Honeypot bot protection & IP rate limiting               |
+------------------------------+------------------------------+
                               |
                               | HTTPS POST (Flat JSON)
                               v
+-------------------------------------------------------------+
|                  Zoho Flow (JollyRx RFQ Bridge)             |
|  1. Webhook Trigger: Catches masked_node_id, buyer details  |
|  2. Fetch Record: Searches Plant_Master by Masked_Node_ID   |
|  3. Create Record: Inserts RFQ with linked Plant Record ID  |
+------------------------------+------------------------------+
                               |
                               | Creator Record Insert
                               v
+-------------------------------------------------------------+
|              Zoho Creator (Confidential Plant Vault)        |
|  - Plant_Master: Confidential manufacturer details          |
|  - RFQ_Inquiries: Incoming quote inquiries                  |
|  - Deluge Workflow: Auto-populates Molecule, Form & Date    |
+-------------------------------------------------------------+
```

---

## 5. Project Folder Structure

```
JollyRx-B2B-Platform/
├── .env.example                  # Template for local environment variables
├── .gitignore                    # Prevents secrets, node_modules and logs from being committed
├── package.json                  # Root npm configuration for dependencies and start scripts
├── vercel.json                   # Vercel serverless routing configuration
├── AI_USAGE.md                   # Transparent disclosure of AI assistance
├── README.md                     # Project overview and execution guide
├── api/
│   └── index.js                  # Vercel serverless function entrypoint
├── server/
│   ├── server.js                 # Express proxy (validation, honeypot, Zoho Flow forwarder)
│   ├── package.json              # Server dependencies (express, cors, dotenv)
│   └── .env.example              # Server environment template
├── zoho-commerce/
│   ├── css/
│   │   └── b2b_rfq_styles.css    # Scoped CSS hiding retail prices and styling node cards
│   └── js/
│       ├── storefront_enhancements.js # Injects "Request Quote" buttons with ?node= link
│       └── submit_rfq_page_embed.html # Standalone RFQ form component for Submit RFQ page
├── zoho-creator/
│   ├── deluge/
│   │   ├── plant_master.ds       # Form definition for confidential Plant_Master
│   │   ├── rfq_inquiries.ds      # Form definition for RFQ_Inquiries
│   │   └── rfq_workflow.deluge   # Workflow script for status and auto-population
│   └── schema/
│       └── plant_master.json     # JSON schema representation of the plant database
├── docs/
│   ├── api_specification.md      # API endpoint documentation & data dictionary
│   ├── architecture.md           # Detailed security and masked architecture write-up
│   └── video_recording_script.md # Script for the 3-minute evaluation video
└── tests/
    ├── api_test.http             # Automated HTTP test suite (11 test cases)
    └── sample_rfq_payload.json   # Canonical sample JSON payload
```

---

## 6. Local Setup Instructions

### Prerequisites
- Node.js (version 18 or newer recommended)
- npm (version 9 or newer)

### Installation
1. Clone or download the repository:
   ```bash
   git clone https://github.com/techbydeepak/jollyrx-b2b-rfq-platform.git
   cd jollyrx-b2b-rfq-platform
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

---

## 7. Environment Variable Setup

1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and fill in your values:
   ```ini
   PORT=3000
   ZOHO_FLOW_WEBHOOK_URL="https://flow.zoho.in/YOUR_ORG/flow/webhook/incoming?zapikey=YOUR_KEY&isdebug=false"
   ```
   *(Note: `.env` is listed in `.gitignore` and must never be committed to source control).*

3. Start the local server:
   ```bash
   npm start
   ```
   The proxy will start on `http://localhost:3000`.

---

## 8. API Endpoints

### `GET /api/health`
Health check endpoint returning service status. Does not disclose secrets.
- **Response (200 OK):**
  ```json
  {
    "status": "online",
    "service": "JollyRx RFQ Ingestion Proxy",
    "configured": true
  }
  ```

### `POST /api/rfq`
Ingests an RFQ submission, validates fields, checks honeypot, and forwards a clean flat JSON payload to Zoho Flow.
- **Request Body (JSON):**
  ```json
  {
    "masked_node_id": "NODE-GJ-01",
    "buyer_name": "Dr. Sarah Jenkins",
    "buyer_email": "sarah.j@acmepharma.com",
    "target_quantity": 5000
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "RFQ inquiry successfully registered with JollyRx Vault.",
    "masked_node_id": "NODE-GJ-01",
    "target_quantity": 5000
  }
  ```
- **Validation Errors (400 Bad Request):** Returns a descriptive error if buyer name, email, positive quantity, or whitelisted node ID is invalid.
- **Bot Detection:** If the optional `company_fax` honeypot field contains any value, the server returns `{ "success": true, "message": "Inquiry received." }` and discards the submission without invoking Zoho Flow.

---

## 9. Vercel Deployment

The project includes `vercel.json` and `api/index.js` configured for Vercel Serverless Functions.

1. Deploy the repository to Vercel (via Vercel CLI or by importing the GitHub repository into your Vercel Dashboard).
2. In the Vercel project settings, navigate to **Settings** $\to$ **Environment Variables**.
3. Add the variable:
   - **Key:** `ZOHO_FLOW_WEBHOOK_URL`
   - **Value:** Your private Zoho Flow webhook URL
4. Trigger a deployment.
5. In `zoho-commerce/js/submit_rfq_page_embed.html`, configure the production backend API URL:
   ```html
   <script>window.JOLLYRX_BACKEND_API = "https://your-vercel-domain.vercel.app/api/rfq";</script>
   ```

---

## 10. Zoho Creator & Zoho Flow Integration Overview

1. **Zoho Creator:**
   - **`Plant_Master`:** Contains 3 fictional plant records (`NODE-GJ-01`, `NODE-MH-02`, `NODE-MP-03`) with private legal names, addresses, and licenses alongside public specifications.
   - **`RFQ_Inquiries`:** Contains fields `Contact Person`, `Contact Email`, `Requested Qty`, `Plant Lookup`, `Product Molecule`, `Dosage Form`, `Inquiry Date`, and `Status`.
   - **Deluge Workflow:** The workflow `Populate RFQ Data on Create` runs on inquiry creation, fetching `Molecule` and `Dosage_Form` from `Plant_Master` and setting `Inquiry_Date` to the current date.

2. **Zoho Flow (`JollyRx RFQ Bridge`):**
   - **Step 1 (Webhook Trigger):** Receives flat JSON with `masked_node_id`, `buyer_name`, `buyer_email`, `target_quantity`.
   - **Step 2 (Fetch Record):** Queries `Plant_Master` where `Masked_Node_ID == webhook.masked_node_id`, returning the internal Creator Record ID.
   - **Step 3 (Create Record):** Creates a record in `RFQ_Inquiries`, linking `Plant_Lookup` to the returned Record ID and mapping contact details and requested quantity.

---

## 11. Testing Instructions

### Automated API Tests
Use the test suite in `tests/api_test.http` (executable via VS Code REST Client extension or curl/PowerShell):
1. **Health Check:** `GET /api/health` $\to$ Returns HTTP 200.
2. **Valid RFQ Submission (NODE-GJ-01, 5,000 units):** $\to$ Returns HTTP 200.
3. **Valid RFQ Submission (NODE-MP-03, 10,000 units):** $\to$ Returns HTTP 200.
4. **Missing Required Fields (Blank Name):** $\to$ Returns HTTP 400.
5. **Invalid Email Format:** $\to$ Returns HTTP 400.
6. **Zero or Negative Quantity:** $\to$ Returns HTTP 400.
7. **Unknown Node ID:** $\to$ Returns HTTP 400.
8. **Bot Honeypot Trap:** $\to$ Returns HTTP 200 silent discard.

### End-to-End Storefront Verification
1. Open the published Zoho Commerce storefront at `/submit-rfq`.
2. Fill out the form with buyer details and select a node.
3. Submit the form and verify the confirmation message.
4. In Zoho Creator, open **RFQ Management** $\to$ **All RFQ Inquiries** and confirm that the record appears with all fields populated and correctly linked to the parent plant.
