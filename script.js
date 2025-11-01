/* --- Global Config --- */
let CONFIG = {};
let PRICE = 1500; // Default price
let PRICE_OLD = ""; // Default old price
let CURRENCY = 'LE'; // Default currency

/* --- DOM Elements --- */
const priceText = document.getElementById('priceText');
const galleryGrid = document.getElementById('galleryGrid');
const imageModal = document.getElementById('imageModalBackdrop');
const modalImg = document.getElementById('imageModalImg');
const modalCaption = document.getElementById('imageModalCaption');

/**
 * 1. Load and Apply Text from config.json
 */
async function loadConfig() {
  try {
    const response = await fetch('config.json');
    if (!response.ok) throw new Error('Network response was not ok');
    CONFIG = await response.json();
    
    // Set global price and currency from config
    PRICE = Number(CONFIG.productPrice) || 1500;
    PRICE_OLD = CONFIG.productPriceOld || ""; // Load old price
    CURRENCY = CONFIG.productCurrency || 'LE';

    // Apply text content
    document.querySelectorAll('[data-key]').forEach(el => {
      const key = el.getAttribute('data-key');
      if (CONFIG[key]) {
        el.textContent = CONFIG[key];
      }
    });

    // Apply placeholders
    document.querySelectorAll('[data-key-placeholder]').forEach(el => {
      const key = el.getAttribute('data-key-placeholder');
      if (CONFIG[key]) {
        el.placeholder = CONFIG[key];
      }
    });
    
    // Apply image sources (like the logo)
    document.querySelectorAll('[data-img-src]').forEach(el => {
      const key = el.getAttribute('data-img-src');
      if (CONFIG[key]) {
        el.src = CONFIG[key];
      }
    });

    // NEW: Apply video sources (for background)
    document.querySelectorAll('[data-video-src]').forEach(el => {
      const key = el.getAttribute('data-video-src');
      if (CONFIG[key]) {
        el.src = CONFIG[key];
        el.load(); // Tell the video element to load the new source
      }
    });

    // Initial price update
    updatePriceDisplays();
    
    // Populate the gallery
    populateGallery();
    
  } catch (error) {
    console.error('Failed to load config.json:', error);
    // Fallback to defaults if config fails
    updatePriceDisplays();
  }
}

/**
 * Update all price displays on the page
 */
function updatePriceDisplays() {
  // Create price strings
  const newPriceString = `${PRICE.toFixed(0)} ${CURRENCY}`;
  const oldPriceString = PRICE_OLD ? `${Number(PRICE_OLD).toFixed(0)} ${CURRENCY}` : "";

  // Update Hero Card Price
  if (priceText) {
    priceText.querySelector('.price-new').textContent = newPriceString;
    priceText.querySelector('.price-old').textContent = oldPriceString;
  }
}

/**
 * 3. Populate Gallery
 * Dynamically creates gallery items from config.json
 * Now supports "image" and "video" types.
 */
function populateGallery() {
  if (!CONFIG.galleryImages || !galleryGrid) {
    const gallerySection = document.getElementById('gallery');
    if (gallerySection) gallerySection.style.display = 'none';
    return;
  }

  galleryGrid.innerHTML = ''; // Clear existing items

  CONFIG.galleryImages.forEach(item => {
    const itemEl = document.createElement('div');
    
    // Check if it's a video
    if (item.type === 'video') {
      itemEl.className = 'gallery-item video-item';
      itemEl.innerHTML = `
        <iframe 
          src="${item.src}" 
          title="${item.alt}" 
          frameborder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen>
        </iframe>`;
    } 
    // Otherwise, treat it as an image
    else {
      itemEl.className = 'gallery-item';
      itemEl.innerHTML = `<img 
        src="${item.src}" 
        alt="${item.alt}"
        onerror="this.src='https://placehold.co/600x400/333/ccc?text=Image+Error'; this.onerror=null;"
      >`;
      
      // Add click listener ONLY for images
      itemEl.addEventListener('click', (e) => {
        e.stopPropagation(); // Stop click from bubbling to backdrop
        openImageModal(item.src, item.alt);
      });
    }
    
    galleryGrid.appendChild(itemEl);
  });
}

/**
 * 4. Image Modal (Lightbox) Functions
 */
function openImageModal(src, alt) {
  if (!imageModal || !modalImg || !modalCaption) return;
  
  modalImg.src = src;
  modalImg.alt = alt;
  modalCaption.textContent = alt;
  imageModal.setAttribute('aria-hidden', 'false');
}

function closeImageModal() {
  if (!imageModal) return;
  imageModal.setAttribute('aria-hidden', 'true');
  modalImg.src = ""; // Clear src to stop loading/playing
}

// Add event listener to modal backdrop (but not content) to close it
if (imageModal) {
  imageModal.addEventListener('click', (e) => {
    // Only close if user clicked the backdrop itself
    if (e.target === imageModal) {
      closeImageModal();
    }
  });
}

/* smooth scroll helper */
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* --- Initialize Page --- */
document.addEventListener('DOMContentLoaded', () => {
  loadConfig(); // Load text from config.json first
});


