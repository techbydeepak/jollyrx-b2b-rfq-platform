/**
 * JollyRx – B2B Pharma CDMO
 * Storefront Enhancement Script (Zoho Commerce - Aura Theme)
 * 
 * Injected in Zoho Commerce: Settings > Advanced > Custom Code (Footer)
 * 1. Automatically inserts B2B "Request Quote" buttons on all masked product cards.
 * 2. Deep-links each product to /submit-rfq?node=NODE-XX-YY.
 * 3. Hides retail cart counters and retail price tags dynamically.
 */

(function () {
  'use strict';

  function enhanceB2BStorefront() {
    // 1. Map of Known Masked Products
    var nodeMapping = {
      'paracetamol': 'NODE-GJ-01',
      'metformin': 'NODE-MH-02',
      'amoxicillin': 'NODE-MP-03'
    };

    // Helper to determine node ID from product text or URL
    function detectNodeId(text) {
      if (!text) return null;
      var upper = text.toUpperCase();
      if (upper.indexOf('NODE-GJ-01') !== -1) return 'NODE-GJ-01';
      if (upper.indexOf('NODE-MH-02') !== -1) return 'NODE-MH-02';
      if (upper.indexOf('NODE-MP-03') !== -1) return 'NODE-MP-03';

      var lower = text.toLowerCase();
      for (var key in nodeMapping) {
        if (lower.indexOf(key) !== -1) {
          return nodeMapping[key];
        }
      }
      return null;
    }

    // 2. Enhance Product Grid Cards
    var productCards = document.querySelectorAll('.theme-product-box, .product-item, .product-detail-wrap');
    productCards.forEach(function (card) {
      if (card.dataset.jollyrxEnhanced) return;

      var textContent = card.innerText || '';
      var nodeId = detectNodeId(textContent) || detectNodeId(window.location.pathname);

      if (nodeId) {
        card.dataset.jollyrxEnhanced = 'true';

        // Check if button already exists
        if (!card.querySelector('.jollyrx-btn-rfq')) {
          var rfqBtn = document.createElement('a');
          rfqBtn.className = 'jollyrx-btn-rfq';
          rfqBtn.href = '/submit-rfq?node=' + encodeURIComponent(nodeId);
          rfqBtn.innerHTML = '<strong>Request Quote</strong> (' + nodeId + ')';
          card.appendChild(rfqBtn);
        }
      }
    });

    // 3. Enhance Product Detail Page (PDP)
    var pdpActionArea = document.querySelector('.product-quantity-and-addtocart, .theme-pdp-btn-wrap');
    if (pdpActionArea && !pdpActionArea.dataset.jollyrxEnhanced) {
      pdpActionArea.dataset.jollyrxEnhanced = 'true';
      var pageTitle = document.title || '';
      var nodeId = detectNodeId(pageTitle) || detectNodeId(window.location.pathname) || 'NODE-GJ-01';

      var pdpRfqBtn = document.createElement('a');
      pdpRfqBtn.className = 'jollyrx-btn-rfq';
      pdpRfqBtn.style.padding = '14px 24px';
      pdpRfqBtn.style.fontSize = '16px';
      pdpRfqBtn.href = '/submit-rfq?node=' + encodeURIComponent(nodeId);
      pdpRfqBtn.innerHTML = 'Submit RFQ for Manufacturing Node ' + nodeId;
      pdpActionArea.parentNode.insertBefore(pdpRfqBtn, pdpActionArea);
    }
  }

  // Run on DOM Ready and on AJAX page transitions
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhanceB2BStorefront);
  } else {
    enhanceB2BStorefront();
  }

  // Re-run periodically to cover dynamic theme loaders
  setInterval(enhanceB2BStorefront, 1500);
})();
