# JollyRx – Architecture & Masked Security Model

## 1. System Vision & Objective
JollyRx is a B2B Contract Development and Manufacturing Organization (CDMO) marketplace for the pharmaceutical industry. The platform allows buyers to source high-volume pharmaceutical manufacturing capacity while strictly preserving the confidentiality of the manufacturing plants.

## 2. Core Security Axiom: The Masked Architecture
The core competitive advantage and IP protection mechanism is the **Masked Node Architecture**:
- **Confidential Internal Vault (Zoho Creator):** Houses the full truth—real pharmaceutical manufacturer identities, physical plant addresses, regulatory drug manufacturing licenses, quality audits, and internal margins.
- **Public B2B Storefront (Zoho Commerce):** Exposes only sanitized, anonymous capability nodes (e.g., `NODE-BD-01`). B2B buyers evaluate capacity based on Molecule, Dosage Form, Regulatory Certification (WHO-GMP, Schedule M), and Minimum Order Quantity (MOQ).
- **Zero Leakage Guarantee:**
  - Real plant details are **never** synchronized to or stored in Zoho Commerce.
  - No hidden HTML fields, data attributes, or comments contain real plant details.
  - Browser DevTools inspection or API reverse-engineering reveals only masked node identifiers.

---

## 3. Component Architecture

```
+-------------------------------------------------------------------------+
|                  ZOHO COMMERCE (PUBLIC STOREFRONT)                     |
|                                                                         |
|  Catalog: Masked Nodes Only (NODE-GJ-01, NODE-MH-02, NODE-MP-03)        |
|  UI Customization:                                                      |
|   - Pricing Hidden (B2B Mode)                                           |
|   - Add to Cart Disabled                                                |
|   - "Request Quote" Action Button                                       |
|   - Embedded B2B RFQ Form Component (Aura Theme)                        |
|   - Client-Side Sanitization & Validation (Email, Name, Qty)            |
+------------------------------------+------------------------------------+
                                     |
                                     | Secure Ingestion (POST /api/rfq)
                                     v
+------------------------------------+------------------------------------+
|               SECURE INGESTION PROXY (Node.js / Express)               |
|                                                                         |
|  - Validates payload structure & data types                             |
|  - Protects Zoho Flow Webhook URL in server .env (Zero client leakage)  |
|  - Honeypot bot filtering & IP rate limiting (10 req/min)               |
|  - Standardizes flat JSON payload for Zoho Flow                         |
+------------------------------------+------------------------------------+
                                     |
                                     | Authorized Flow Ingestion
                                     v
+------------------------------------+------------------------------------+
|                    ZOHO FLOW (JollyRx RFQ Bridge)                      |
|                                                                         |
|  1. Webhook Trigger: Catches masked_node_id, buyer_name, email, qty     |
|  2. Fetch Record: Resolves Plant_Master by Masked_Node_ID               |
|  3. Create Record: Inserts RFQ_Inquiries with Plant Lookup ID           |
+------------------------------------+------------------------------------+
                                     |
                                     | Creator Write & Deluge Trigger
                                     v
+-------------------------------------------------------------------------+
|                  ZOHO CREATOR (INTERNAL PLANT VAULT)                    |
|                                                                         |
|  [Form: RFQ_Inquiries]                                                  |
|   - Contact_Person, Contact_Email, Requested_Qty, Plant_Lookup          |
|   - Status: "New"                                                       |
|                                                                         |
|  [Deluge Workflow: Populate RFQ Data on Create]                         |
|   - Auto-populates Product_Molecule & Dosage_Form from Plant_Master     |
|   - Auto-stamps Inquiry_Date (dd-MMM-yyyy)                              |
|                                                                         |
|  [Form: Plant_Master] (Strictly Internal & Confidential)                |
|   - Real_Plant_Name (e.g. Apex Biotech Ltd)                             |
|   - Factory_Address (e.g. Plot 42, GIDC, Vapi, Gujarat)                 |
|   - License_No (e.g. G/25/1842-A)                                       |
|   - Masked_Node_ID (NODE-GJ-01, NODE-MH-02, NODE-MP-03)                 |
|   - Molecule, Dosage_Form, Certification, MOQ                           |
+-------------------------------------------------------------------------+
```

---

## 4. Ingestion Security Options

To fulfill the security requirement (*"Never expose API secrets or private Creator credentials in frontend JavaScript"*):

### Approach A: Zoho Creator Public Form / Public Stateless Embed
- Zoho Creator allows configuring the `RFQ_Inquiries` form with public write access (or a customized stateless submission page).
- **Pros:** Native to Zoho, requires zero external server hosting.
- **Security:** Public users can only write (submit) RFQ records. They have no read permissions on `Plant_Master` or other inquiries.

### Approach B: Serverless Secure API Gateway / Node.js Proxy
- A lightweight backend proxy (Node.js/Express or serverless function) acts as an intermediary.
- The proxy stores Zoho OAuth `client_id`, `client_secret`, and `refresh_token` in secure server environment variables.
- The storefront JS sends a simple JSON `POST /api/rfq` to the proxy.
- The proxy validates the payload and calls the Zoho Creator REST API v2 (`https://creator.zoho.com/api/v2/{owner}/{app}/form/RFQ_Inquiries`).
- **Pros:** Complete encapsulation of Zoho internals; robust CORS control.

We will provide full support and clean code for both approaches so the implementation can be deployed seamlessly regardless of Zoho subscription tier restrictions.
