# JollyRx – API Specification & Data Dictionary

## 1. Data Dictionary

### Form 1: `Plant_Master` (Zoho Creator)
Primary internal repository for manufacturing plants and their capability nodes.

| Field Name | Deluge Link Name | Type | Confidential? | Constraints & Format | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Real Plant Name** | `Real_Plant_Name` | Single Line Text | **YES** | Mandatory, Max 100 chars | Real legal entity name of the manufacturing facility |
| **Factory Address** | `Factory_Address` | Multi Line Text | **YES** | Mandatory, Max 255 chars | Physical manufacturing site location |
| **License No** | `License_No` | Single Line Text | **YES** | Mandatory, Unique | Drug manufacturing license (FDCA / Regulatory) |
| **Masked Node ID** | `Masked_Node_ID` | Single Line Text | NO (Public) | Mandatory, Unique, Format: `NODE-[CC]-[NN]` | Masked token used publicly across storefront |
| **Molecule** | `Molecule` | Single Line Text | NO (Public) | Mandatory, Max 100 chars | Active Pharmaceutical Ingredient (API) / Generic name |
| **Dosage Form** | `Dosage_Form` | Dropdown | NO (Public) | Options: `Tablets`, `Capsules`, `Syrup`, `Injectables` | Pharmaceutical physical presentation |
| **Certification** | `Certification` | Dropdown | NO (Public) | Options: `WHO-GMP`, `Schedule M`, `EU-GMP`, `US-FDA` | Regulatory compliance standard |
| **Minimum Order Quantity** | `MOQ` | Number | NO (Public) | Mandatory, Integer >= 1 | Minimum batch production run required |

---

### Form 2: `RFQ_Inquiries` (Zoho Creator)
Inquiries submitted by prospective B2B clients from the public storefront.

| Field Name | Deluge Link Name | Type | Constraints & Format | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Contact Person** | `Contact_Person` | Single Line Text | Mandatory, 2 - 100 chars | Full name of B2B buyer / company rep |
| **Contact Email** | `Contact_Email` | Email | Mandatory, RFC 5322 format | Business email for quote delivery |
| **Requested Qty** | `Requested_Qty` | Number | Mandatory, Max Digits: 10, Integer >= 1 | Desired batch volume |
| **Plant Lookup** | `Plant_Lookup` | Lookup (`Plant_Master`) | Record ID link | Relation to parent manufacturing node |
| **Product Molecule** | `Product_Molecule` | Single Line Text | Auto-populated by Deluge | Inherited from Plant_Master |
| **Dosage Form** | `Dosage_Form` | Single Line Text | Auto-populated by Deluge | Inherited from Plant_Master |
| **Inquiry Date** | `Inquiry_Date` | Date | Auto-populated by Deluge (`dd-MMM-yyyy`) | Timestamp of inquiry |
| **Status** | `Status` | Dropdown | Options: `New`, `Under Review`, `Quoted`, `Rejected` | Pipeline status (Default: `New`) |

---

## 2. RFQ Ingestion Proxy Schema (POST /api/rfq)

### Request (JSON)
```json
{
  "buyer_name": "Dr. Sarah Jenkins",
  "buyer_email": "s.jenkins@acmepharma.co.uk",
  "target_quantity": 15000,
  "masked_node_id": "NODE-GJ-01"
}
```

### Validation Constraints:
- `buyer_name`: Non-empty string, trimmed, 2 to 100 characters.
- `buyer_email`: Valid email format containing standard RFC 5322 `@` and domain.
- `target_quantity`: Positive integer, must be greater than 0.
- `masked_node_id`: String matching one of the whitelisted nodes (`NODE-GJ-01`, `NODE-MH-02`, `NODE-MP-03`).
- `company_fax` (optional honeypot): Must be empty; if filled, silent discard is triggered.

### Response (Success - HTTP 200 OK)
```json
{
  "success": true,
  "message": "RFQ inquiry successfully registered with JollyRx Vault.",
  "masked_node_id": "NODE-GJ-01",
  "target_quantity": 15000
}
```

### Response (Validation Error - HTTP 400 Bad Request)
```json
{
  "success": false,
  "error": "A valid commercial business email is required."
}
```
