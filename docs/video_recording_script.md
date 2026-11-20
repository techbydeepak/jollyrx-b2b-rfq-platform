# JollyRx – 3-Minute Video Walkthrough Script

**Platform:** JollyRx B2B Pharma CDMO & Masked Architecture  
**Duration:** Exactly 3:00 Minutes (180 Seconds)  
**Tone:** Professional, clear, engineering-led presentation.

---

### Timing & Scene Breakdown

| Timestamp | Screen / Visual Focus | Narration & Talking Points |
| :---: | :--- | :--- |
| **0:00 - 0:25**<br>(25s) | **Zoho Creator: `Plant_Master` Records**<br>Display internal report showing the 3 plant records (`NODE-GJ-01`, `NODE-MH-02`, `NODE-MP-03`). | *"Welcome to the demonstration of JollyRx, a B2B pharmaceutical contract manufacturing platform built on a zero-leakage masked architecture. Here in Zoho Creator—our confidential Plant Vault—we maintain our 3 manufacturing plants: Paracetamol tablets in Gujarat, Metformin in Maharashtra, and Amoxicillin capsules in Madhya Pradesh."* |
| **0:25 - 0:45**<br>(20s) | **Private vs. Public Field Separation**<br>Highlight the Form Builder canvas of `Plant_Master`. | *"Notice the architectural security boundary: Internal administrators can see the Real Plant Name, physical factory address, and regulatory drug license. However, external buyers will only ever encounter the anonymized capability tokens: Masked Node ID, molecule, dosage form, GMP certification, and MOQ."* |
| **0:45 - 1:10**<br>(25s) | **Zoho Commerce Storefront & Catalog**<br>Show live Aura theme storefront on desktop and mobile view. | *"Switching to our public storefront on Zoho Commerce, we have custom-tailored the Aura theme for commercial B2B procurement. Products are listed strictly under their masked node IDs. In compliance with B2B pharmaceutical trade standards, consumer retail pricing and 'Add to Cart' buttons are completely disabled."* |
| **1:10 - 1:30**<br>(20s) | **The B2B RFQ Form ("Submit RFQ" Page)**<br>Show the custom embedded RFQ form with pre-filled dropdowns. | *"When a buyer wants to contract manufacturing capacity, they click 'Request Quote' to access our B2B RFQ interface. The form collects Buyer Name, Business Email, Target Quantity, and the Masked Node ID, backed by strict client-side validation and anti-bot honeypot protection."* |
| **1:30 - 2:00**<br>(30s) | **Zoho Flow: `Webhook → Fetch → Create`**<br>Open the Flow diagram and execution history in `flow.zoho.in`. | *"Behind the scenes, our integration highway is powered by Zoho Flow. The incoming webhook securely receives the sanitized inquiry. Step 2 executes a 'Fetch Record' on Plant Master using the Masked Node ID to retrieve the internal Creator Record ID and molecule specifications. Step 3 creates the inquiry record in RFQ Inquiries with proper relational mapping."* |
| **2:00 - 2:25**<br>(25s) | **Code & Security Architecture**<br>Briefly show VS Code (`server/server.js`, `submit_rfq_page_embed.html`, `.env`). | *"To guarantee production security, our storefront never exposes Zoho Flow API keys or webhook secrets to the public browser. Submissions are routed through our Node.js Express proxy with rate limiting, or securely handled server-to-server. Environment variables are kept isolated from version control."* |
| **2:25 - 2:50**<br>(25s) | **End-to-End Submission & Live Verification**<br>Submit an RFQ on the page and switch to Zoho Creator `RFQ_Inquiries` to show the record. | *"Let's submit a live quote for NODE-GJ-01 with a target quantity of 5,000 units. The submission is confirmed instantly. Switching over to Zoho Creator's RFQ Inquiries report, we see the record populated with Contact Person, Contact Email, Requested Quantity, and the relational Plant Lookup linked seamlessly."* |
| **2:50 - 3:00**<br>(10s) | **Conclusion & Wrap-Up**<br>Show the architectural summary diagram. | *"This concludes the JollyRx prototype demonstration—combining Zoho Creator, Commerce, Flow, and secure APIs into an enterprise-ready masked CDMO platform. Thank you."* |
