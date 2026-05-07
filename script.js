/**
 * ==========================================================================
 * RICE UP 'N FRY! - MAIN APPLICATION LOGIC
 * Engineered for ABM 2401 Entrepreneurship Project
 * * TABLE OF CONTENTS:
 * 01. Configuration & DOM Elements
 * 02. Loading Screen & Scroll Lock
 * 03. Audio Engine (UI Sounds)
 * 04. Scroll & Parallax Effects
 * 05. Product Details Modal
 * 06. Checkout & Form Submission
 * 07. Order Tracking Logic
 * 08. Visual Effects (Glitch Observer)
 * ==========================================================================
 */

/* ==========================================================================
   01. CONFIGURATION & DOM ELEMENTS
   ========================================================================== */
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyT8CPyoRJMVztMa1UxtTldnhbHoN2Inn2ucjMhQbDXmn6f91SyGpU-ZgciCP430DJ-CA/exec'; 

// DOM Elements
const loader = document.getElementById('loading-screen');
const statusText = document.querySelector('.loader-status');
const bgText = document.getElementById('bg-text');
const header = document.getElementById('main-header');
const heroImg = document.getElementById('hero-img');
const orderForm = document.querySelector('.order-form');
const receiptOverlay = document.getElementById('receipt-overlay');
const productModal = document.getElementById('product-modal');
const modalTitle = document.getElementById('modal-title');
const modalDesc = document.getElementById('modal-desc');
const modalPrice = document.getElementById('modal-price');

/* ==========================================================================
   0X. MOBILE NAVIGATION MENU LOGIC
   ========================================================================== */
const mobileBtn = document.getElementById('mobile-menu-btn');
const navMenu = document.getElementById('nav-menu');

if (mobileBtn) {
    mobileBtn.addEventListener('click', () => {
        mobileBtn.classList.toggle('active');
        navMenu.classList.toggle('open');
        playSound('click'); // Plays your UI sound when opening the menu!
    });
}

// Automatically close the mobile menu when a link is clicked
document.querySelectorAll('.nav-link, .nav-cta').forEach(link => {
    link.addEventListener('click', () => {
        if(navMenu && navMenu.classList.contains('open')) {
            mobileBtn.classList.remove('active');
            navMenu.classList.remove('open');
        }
    });
});


/* ==========================================================================
   02. LOADING SCREEN & PRIVACY/AUDIO GATEWAY
   ========================================================================== */
// 1. Prevent touch scrolling while loading or reading privacy
function preventTouch(e) { e.preventDefault(); }
document.body.style.overflow = 'hidden'; 
window.addEventListener('touchmove', preventTouch, { passive: false });

const privacyModal = document.getElementById('privacy-modal');
const btnAccept = document.getElementById('accept-privacy');
const hasAcceptedPrivacy = localStorage.getItem('privacyAccepted');

// Hide privacy modal instantly on load so the loader can run first
if (privacyModal) privacyModal.style.display = 'none';

window.addEventListener('load', () => {
    const states = ["🌸WARMING THE FRYERS...", "🍚PREPPING THE RICE...", "🍙READY TO SERVE!"];
    
    // Cycle through loading messages
    states.forEach((state, i) => {
        setTimeout(() => { if(statusText) statusText.innerHTML = state; }, 600 * (i + 1));
    });

    // Hide loading screen after 2.5s
    setTimeout(() => {
        if (loader) {
            loader.classList.add('loader-hidden');
            setTimeout(() => loader.style.display = 'none', 800);
        }

        // SEQUENCE CHECK: Show Privacy Modal OR Unlock Website
        if (!hasAcceptedPrivacy) {
            // Show privacy modal and fade it in
            if (privacyModal) {
                privacyModal.style.display = 'flex';
                setTimeout(() => privacyModal.style.opacity = '1', 50); 
            }
            // Note: Scroll remains locked!
        } else {
            // If they already accepted it on a previous visit, unlock the site immediately
            document.body.style.overflow = 'auto'; 
            document.body.style.overflowX = 'hidden'; 
            window.removeEventListener('touchmove', preventTouch);
        }
    }, 2500); // Wait for the 2.5s loader to finish
});

// Privacy Accept Button Logic
if (btnAccept) {
    btnAccept.addEventListener('click', () => {
        playSound('click'); // Play sound to officially unlock audio engine
        
        // Fade out and hide modal
        if (privacyModal) {
            privacyModal.style.opacity = '0';
            setTimeout(() => privacyModal.style.display = 'none', 500);
        }
        
        localStorage.setItem('privacyAccepted', 'true');
        
        // Unlock the website scroll
        document.body.style.overflow = 'auto';
        document.body.style.overflowX = 'hidden';
        window.removeEventListener('touchmove', preventTouch);
    });
}


/* ==========================================================================
   03. AUDIO ENGINE (UI SOUNDS)
   ========================================================================== */
const sfx = {
    hover: new Audio('sounds/hover.wav'),
    click: new Audio('sounds/click.wav'),
    success: new Audio('sounds/success.wav')
};

// Play sound with low latency
function playSound(type) {
    sfx[type].currentTime = 0; 
    sfx[type].volume = 0.2;    
    sfx[type].play().catch(() => {
        // Browsers require user interaction before playing audio
        console.log("Audio blocked: Await user interaction.");
    });
}

// Attach hover sounds
document.querySelectorAll('.nav-link, .nav-cta, .menu-card, .btn-main, .dot, .checkbox-text, #fo-ol').forEach(el => {
    el.addEventListener('mouseenter', () => playSound('hover'));
});

// Attach click sounds
document.querySelectorAll('.nav-link, .nav-cta, .menu-card, .btn-main, .input-group').forEach(el => {
    el.addEventListener('click', () => playSound('click'));
});


/* ==========================================================================
   04. SCROLL & PARALLAX EFFECTS
   ========================================================================== */
window.addEventListener('scroll', () => {
    const value = window.scrollY;
    const isMobile = window.innerWidth <= 768;

    // A. Reading Progress Bar Calculation
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progressBar = document.getElementById('scroll-progress');
    if (progressBar && docHeight > 0) {
        progressBar.style.width = `${(value / docHeight) * 100}%`;
    }

    // B. Hero Background Parallax Effect
if (bgText) {
        // Measure the exact height of the user's screen
        const screenHeight = window.innerHeight;
        
        if (value < screenHeight) {
            // Slower scale: Expands smoothly as you scroll down
            const scale = 1 + (value / (screenHeight / 3)); 
            
            // Slower fade: Reaches exactly 0 opacity just as you hit the Menu section
            const opacity = Math.max(0, 0.2 - (0.2 * (value / screenHeight))); 
            
            bgText.style.transform = `translate(-50%, -50%) scale(${scale})`;
            bgText.style.opacity = opacity;
            bgText.style.visibility = "visible";
        } else {
            // Keeps it hidden when you are looking at the rest of the site to save performance
            bgText.style.visibility = "hidden";
        }
    }

    // C. Sticky Header Shrink Effect
// C. Sticky Header Shrink Effect
    if (value > 400) {
        header.classList.add('active');
        // Deleted the JS padding overrides so CSS can do its job!
    } else {
        header.classList.remove('active');
        // Deleted the JS padding overrides so CSS can do its job!
    }
});

// Interactive Hero Image Mouse Follow (Desktop Only)
document.addEventListener('mousemove', (e) => {
    // Only apply on desktop (wider than 768px)
    if (window.innerWidth > 768 && heroImg) {
        // Calculate the mouse displacement from the center of the screen
        // Higher divisor (40/30) = subtler, professional movement
        const x = (window.innerWidth / 2 - e.pageX) / 40;
        const y = (window.innerHeight / 2 - e.pageY) / 30;
        
        // Apply transform. (Note: RotateX creates perspective depth)
        // Ensure you don't override the float animation by including the translate!
        heroImg.style.transform = `translate(${x}px, calc(-10px + ${y}px)) rotateY(${x/1.5}deg) rotateX(${y}deg)`;
    }
});


/* ==========================================================================
   05. PRODUCT DETAILS MODAL
   ========================================================================== */
// Open Modal Logic
document.querySelectorAll('.menu-card').forEach(card => {
    card.addEventListener('click', () => {
        const title = card.querySelector('h3').innerText;
        const price = card.querySelector('.price')?.innerText || "₱--";
        const desc = card.getAttribute('data-description') || "Description pending.";
        const imgSrc = card.querySelector('.bento-img')?.src || "";

        // Populate Modal Data
        if(modalTitle) modalTitle.innerText = title;
        if(modalPrice) modalPrice.innerText = price;
        if(modalDesc) modalDesc.innerText = desc;
        
        // Handle Modal Image
        const modalImg = document.getElementById('modal-img');
        if(modalImg) {
            modalImg.src = imgSrc;
            modalImg.style.display = imgSrc ? 'block' : 'none'; 
        }

        productModal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Lock scroll while modal is open
    });
});

// Close Modal Logic
function closeModal() {
    productModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    document.body.style.overflowX = 'hidden';
}

document.querySelector('.close-modal')?.addEventListener('click', closeModal);

// Order Button Inside Modal
document.getElementById('modal-order-btn')?.addEventListener('click', () => {
    closeModal();
    document.getElementById('order').scrollIntoView({ behavior: 'smooth' });

    // THE FIX: Smart Auto-Select for the new dynamic menu!
    const title = modalTitle.innerText.toUpperCase();
    const categorySelect = document.getElementById('order-category');

if (categorySelect) {
        if (title.includes("TRIO-GIRI")) {
            categorySelect.value = "trio";
        } else if (title.includes("DUO-GIRI")) {
            categorySelect.value = "duo";
        } else if (title.includes("ICED TEA") || title.includes("BLUE LEMONADE")) {
            // Just scroll down; let them pick their main meal first
        } else {
            // It must be a single onigiri!
            categorySelect.value = "single";
            const flavorSelect = document.getElementById('single-flavor');
            if (flavorSelect) {
                for(let opt of flavorSelect.options) {
                    if(title.includes(opt.value.toUpperCase())) {
                        flavorSelect.value = opt.value;
                        break;
                    }
                }
            }
        }
        // Force the form to physically morph and update the receipt!
        if(typeof updateFormUI === 'function') updateFormUI();
    }
});


/* ==========================================================================
   06. CHECKOUT & FORM SUBMISSION (MASTER ENGINE)
   ========================================================================== */

// 1. DYNAMIC FORM UI SWITCHER
function updateFormUI() {
    const category = document.getElementById('order-category').value;
    
    document.getElementById('single-selection').style.display = 'none';
    document.getElementById('duo-selection').style.display = 'none';
    document.getElementById('trio-selection').style.display = 'none';

    if (category === 'single') document.getElementById('single-selection').style.display = 'block';
    if (category === 'duo') {
        document.getElementById('duo-selection').style.display = 'block';
        updateDuoFlavors(); // Auto-populate the dropdowns instantly!
    }
    if (category === 'trio') document.getElementById('trio-selection').style.display = 'block';
    
    calculateTotal();
}

// 1.5 THE RICE-BASE ENGINE (Dynamically builds options based on rules)
function updateDuoFlavors() {
    const duoType = document.getElementById('duo-type').value;
    const f1 = document.getElementById('duo-flavor-1');
    const f2 = document.getElementById('duo-flavor-2');
    const l1 = document.getElementById('duo-label-1');
    const l2 = document.getElementById('duo-label-2');

    if(!f1 || !f2) return;

    // The Restricted Category Database
    const flavors = {
        kimchi: ['TONKATCHI', 'TUNACHI', 'TOFUCHI'],
        fried: ['TAPA-FRY', 'KATSU-FRY'],
        adobo: ['TAPA GOHAN', 'GANIBO FRY']
    };

    // Clear current dropdown options
    f1.innerHTML = ''; f2.innerHTML = '';

    if(duoType === 'KIMCHI + FRIED RICE') {
        l1.innerText = 'KIMCHI FLAVOR'; l2.innerText = 'FRIED RICE FLAVOR';
        flavors.kimchi.forEach(f => f1.add(new Option(f, f)));
        flavors.fried.forEach(f => f2.add(new Option(f, f)));
    } else if(duoType === 'ADOBO + FRIED RICE') {
        l1.innerText = 'ADOBO FLAVOR'; l2.innerText = 'FRIED RICE FLAVOR';
        flavors.adobo.forEach(f => f1.add(new Option(f, f)));
        flavors.fried.forEach(f => f2.add(new Option(f, f)));
    } else if(duoType === 'KIMCHI + ADOBO RICE') {
        l1.innerText = 'KIMCHI FLAVOR'; l2.innerText = 'ADOBO FLAVOR';
        flavors.kimchi.forEach(f => f1.add(new Option(f, f)));
        flavors.adobo.forEach(f => f2.add(new Option(f, f)));
    }
    calculateTotal();
}

// 2. RECEIPT CALCULATOR
function calculateTotal() {
    const category = document.getElementById('order-category').value;
    let foodPrice = 0;
    let itemName = "Awaiting Selection...";

    if (category === 'single') {
        const select = document.getElementById('single-flavor');
        foodPrice = parseFloat(select.options[select.selectedIndex]?.getAttribute('data-price')) || 0;
        itemName = select.options[select.selectedIndex]?.text.split(' (')[0].trim() || "Awaiting Selection..."; 
    } else if (category === 'duo') {
        const select = document.getElementById('duo-type');
        foodPrice = parseFloat(select.options[select.selectedIndex]?.getAttribute('data-price')) || 0;
        itemName = `Duo-Giri (${select.value})`; 
    } else if (category === 'trio') {
        foodPrice = 159; 
        itemName = "Trio-Giri";
    }

    const sauceSelect = document.getElementById('addon-sauce');
    const saucePrice = parseFloat(sauceSelect.options[sauceSelect.selectedIndex]?.getAttribute('data-price')) || 0;
    const sauceName = sauceSelect.options[sauceSelect.selectedIndex]?.text.split(' (')[0].replace('Add ', '').trim() || "";
    
    const onigiriQty = parseInt(document.getElementById('onigiri-qty').value) || 1;
    const sauceQty = parseInt(document.getElementById('sauce-qty').value) || 0;

    // Math (Drink Removed)
    let total = 0;
    if (category) total = (foodPrice * onigiriQty) + (saucePrice * sauceQty);

    const lineItem = document.getElementById('line-item');
    const lineSauce = document.getElementById('line-sauce');
    const display = document.getElementById('live-total');
    const liveReceiptTime = document.getElementById('live-receipt-time');
    const orderDate = document.getElementById('order-date').value;
    const orderTime = document.getElementById('order-time').value;

    if (category && lineItem) {
        lineItem.querySelector('.line-name').innerText = `${onigiriQty}x ${itemName}`;
        lineItem.querySelector('.line-price').innerText = `₱${(foodPrice * onigiriQty).toFixed(2)}`;
    }

    if (lineSauce) {
        if (saucePrice > 0 && sauceQty > 0 && category) {
            lineSauce.style.display = 'flex';
            lineSauce.querySelector('.line-name').innerText = `${sauceQty}x ${sauceName} (Extra)`;
            lineSauce.querySelector('.line-price').innerText = `₱${(saucePrice * sauceQty).toFixed(2)}`;
        } else {
            lineSauce.style.display = 'none';
        }
    }

    if (liveReceiptTime) {
        liveReceiptTime.innerText = `${orderDate || "---"} @ ${orderTime || "--:--"}`;
    }

    if (display) display.innerText = `₱${total.toFixed(2)}`;
}

// 3. AUTO-SAUCE QUANTITY LOGIC
const sauceSelect = document.getElementById('addon-sauce');
const sauceQtyInput = document.getElementById('sauce-qty');

if (sauceSelect && sauceQtyInput) {
    sauceSelect.addEventListener('change', () => {
        if (sauceSelect.value !== "No Sauce" && parseInt(sauceQtyInput.value) === 0) {
            sauceQtyInput.value = 1;
            calculateTotal();
        } else if (sauceSelect.value === "No Sauce") {
            sauceQtyInput.value = 0;
            calculateTotal();
        }
    });
}


// 4. MASTER FORM EVENT LISTENERS
if (orderForm) {
    orderForm.addEventListener('input', calculateTotal);
    
    // The single, correct submit listener
    orderForm.addEventListener('submit', (e) => {
        e.preventDefault();
        finalizeOrder();
    });

    // THE FIX: Visual warning if the user misses a required field!
    const btnSubmit = orderForm.querySelector('button[type="submit"]');
    if (btnSubmit) {
        btnSubmit.addEventListener('click', () => {
            // Check if the form has empty required fields before submitting
            if (!orderForm.checkValidity()) {
                const originalText = btnSubmit.innerHTML;
                
                // Flashes a warning directly on the button
                btnSubmit.innerHTML = "⚠️ MISSING INFO!";
                btnSubmit.style.backgroundColor = "#ff4d00"; // Changes to an alert color
                
                // Resets the button after 2 seconds
                setTimeout(() => {
                    btnSubmit.innerHTML = originalText;
                    btnSubmit.style.backgroundColor = "";
                }, 2000);
            }
        });
    }
}

// 5. FINALIZE ORDER & SEND TO SHEETS
async function finalizeOrder() {
    const btnSubmit = orderForm.querySelector('button[type="submit"]');
    const originalText = btnSubmit.innerHTML;
    
    btnSubmit.innerHTML = "PROCESSING ORDER...";
    btnSubmit.disabled = true;

    // A. Figure out exactly what food & free sauces they ordered
    const category = document.getElementById('order-category').value;
    let finalFoodItem = "";

    if (category === 'single') {
        const f1 = document.getElementById('single-flavor').value;
        const s1 = document.getElementById('single-sauce-1').value;
        finalFoodItem = `${f1} (Free Sauce: ${s1})`;
    } else if (category === 'duo') {
        const type = document.getElementById('duo-type').value;
        const f1 = document.getElementById('duo-flavor-1').value;
        const f2 = document.getElementById('duo-flavor-2').value;
        const s1 = document.getElementById('duo-sauce-1').value;
        const s2 = document.getElementById('duo-sauce-2').value;
        finalFoodItem = `Duo [${type}]: ${f1} & ${f2} (Free Sauces: ${s1}, ${s2})`;
    } else if (category === 'trio') {
        const f1 = document.getElementById('trio-flavor-1').value;
        const f2 = document.getElementById('trio-flavor-2').value;
        const f3 = document.getElementById('trio-flavor-3').value;
        const s1 = document.getElementById('trio-sauce-1').value;
        const s2 = document.getElementById('trio-sauce-2').value;
        const s3 = document.getElementById('trio-sauce-3').value;
        finalFoodItem = `Trio: ${f1}, ${f2}, & ${f3} (Free Sauces: ${s1}, ${s2}, ${s3})`;
    }

    // B. Grab the EXTRA Add-ons
    const sauce = document.getElementById('addon-sauce').value;
    const sauceQty = document.getElementById('sauce-qty').value;
    const onigiriQty = document.getElementById('onigiri-qty').value; 
    const orderDate = document.getElementById('order-date').value;
    const liveTotal = document.getElementById('live-total').innerText;
    
    // C. Combine it all into one master string
    let masterOrderString = `${onigiriQty}x ${finalFoodItem}`;
    
    if (sauce !== "No Sauce" && sauceQty > 0) {
        masterOrderString += ` | +${sauceQty}x Extra ${sauce}`;
    }

// D. Collect Data
    const orderData = {
        orderID: `RUF-${Date.now().toString().slice(-6)}`,
        name: orderForm.querySelector('input[type="text"]').value,
        email: orderForm.querySelector('input[type="email"]').value,
        model: masterOrderString, 
        qty: onigiriQty, 
        date: orderDate, // THE FIX: Packages the date to send to Google!
        time: document.getElementById('order-time').value,
        payment: document.getElementById('payment-method').value,
        total: liveTotal
    };

// E. Send Data to Google Sheets
    fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', 
        cache: 'no-cache',
        body: JSON.stringify(orderData)
    });

// F. Trigger Success Receipt
    setTimeout(() => {
        document.getElementById('receipt-id').innerText = orderData.orderID;
        
        // THE FIX: Injects the exact, detailed order string into the receipt!
        document.getElementById('receipt-model').innerText = masterOrderString; 
        document.getElementById('receipt-time').innerText = `${orderData.date} @ ${orderData.time}`;

        const receiptFooter = document.querySelector('.receipt-footer');
        
        if (orderData.payment === 'GCASH') {
            receiptFooter.innerHTML = `<p style="font-weight: 900; color: #ff4d00; margin-bottom: 10px;">ONLINE PAYMENT</p><p style="font-size: 0.75rem;">Check email for GCash details.</p>`;
        } else {
            receiptFooter.innerHTML = `<p style="font-weight: 900; margin-bottom: 10px;">CASH ON PICKUP</p><p style="font-size: 0.75rem;">See you at the Lower Grounds!</p>`;
        }

        if (receiptOverlay) {
            receiptOverlay.classList.remove('loader-hidden');
            receiptOverlay.style.display = 'flex';
        }
        
        btnSubmit.innerHTML = originalText;
        btnSubmit.disabled = false;
        playSound('success'); 
    }, 1500);
}

// 6. CLOSE RECEIPT OVERLAY
function closeReceipt() {
    const overlay = document.getElementById('receipt-overlay');
    if (overlay) {
        overlay.classList.add('loader-hidden');
        setTimeout(() => {
            overlay.style.display = 'none';
            window.location.reload(); // Refreshes the page to clear the form
        }, 500);
    }
}

/* ==========================================================================
   07. ORDER TRACKING LOGIC
   ========================================================================== */
async function trackOrder() {
    const idInput = document.getElementById('track-id').value.trim().toUpperCase();
    const resultDiv = document.getElementById('track-result');
    const statusText = document.getElementById('status-text');
    const statusNote = document.getElementById('status-note');
    const btn = document.querySelector('#tracker .btn-main');

    if (!idInput) return alert("Please enter a valid Order ID.");

    btn.innerText = "CHECKING STATUS...";
    resultDiv.style.display = 'block';
    statusText.innerText = "SEARCHING...";

    try {
        // ADDED: &t=${Date.now()} forces the browser to bypass its cache and get fresh data
        const response = await fetch(`${SCRIPT_URL}?orderID=${idInput}&t=${Date.now()}`);
        const data = await response.json();

        if (data.status) {
            statusText.innerText = data.status;
            statusText.style.color = "var(--highlight)";
            
            // Map notes to your new dropdown statuses
            const notes = {
                "Order Received": "Order logged. Check your email for confirmation.",
                "Order Received (Online Payment)": "Check your email for GCash/Maya instructions. Reply with your screenshot!",
                "Preparing": "Your onigiri is currently being hand-pressed. Hang tight!",
                "Ready": "Your food is ready! Head to the Lower Grounds for pickup. (PAID ONLINE)",
                "Ready (To Pay)": "Your food is ready! Please prepare exact payment at the meetup spot.",
                "COMPLETED": "Transaction finalized. Enjoy your meal!",
                "CANCELLED": "Order canceled. Contact us for more info."
            };
            
            // Adding a trim() ensures hidden spaces in Sheets don't break the match
            const cleanStatus = data.status.trim();
            statusNote.innerText = notes[cleanStatus] || "Status detected: " + cleanStatus;
        } else {
            statusText.innerText = "ORDER NOT FOUND";
            statusNote.innerText = "Double-check your ID or wait a moment for our sheet to sync.";
        }
    } catch (error) {
        statusText.innerText = "ORDER LOGGED";
        statusNote.innerText = "Check your email for real-time status updates.";
    }
    btn.innerText = "CHECK STATUS";
}


/* ==========================================================================
   08. VISUAL EFFECTS (BIDIRECTIONAL SCROLL)
   ========================================================================== */
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Adds the class when scrolling INTO view (fades in)
            entry.target.classList.add('reveal-active');
        } else {
            // THE FIX: Removes the class when scrolling OUT of view (fades out)
            // This allows it to trigger infinitely in both directions!
            entry.target.classList.remove('reveal-active'); 
        }
    });
}, { 
    threshold: 0.15 // Waits until 15% of the element is visible before triggering
});

// Initialize the observer on all sections with the trigger class
document.querySelectorAll('.reveal-trigger').forEach(el => {
    revealObserver.observe(el);
});

/* ==========================================================================
   09. DYNAMIC SPECS VIEWER (WHAT'S INSIDE)
   ========================================================================== */
// The fully expanded database with Images and 3 dynamic Dots
const flavorDatabase = {
    "Tonkatchi": {
        img: "images/onigiri/Tonkatchi.png",
        dot1: "Premium Roasted Nori", dot2: "Kimchi Fried Rice", dot3: "Crispy Tonkatsu",
        profile: "Spicy & Crispy", life: "Consume within 12 Hours", wrap: "Classic Double-Wrap", origin: "Tokyo via Manila"
    },
    "Tunachi": {
        img: "images/onigiri/Tunachi.png",
        dot1: "Premium Roasted Nori", dot2: "Kimchi Fried Rice", dot3: "Spicy Tuna Mayo Blend",
        profile: "Spicy & Creamy", life: "Consume within 8 Hours", wrap: "Crispy Nori Fold", origin: "Seoul Fusion"
    },
    "Tofuchi": {
        img: "images/onigiri/Tofuchi.png",
        dot1: "Light Seaweed", dot2: "Kimchi Fried Rice", dot3: "Crispy Tofu",
        profile: "Mild Spice & Crunch", life: "Consume within 12 Hours", wrap: "Light Seaweed Pocket", origin: "Plant-Based Twist"
    },
    "GaniboFry": {
        img: "images/onigiri/GaniboFry.png",
        dot1: "Toasted Nori", dot2: "Adobo Rice", dot3: "Sweet Longganisa",
        profile: "Sweet & Savory", life: "Consume within 12 Hours", wrap: "Toasted Nori Wrap", origin: "Lucban Inspired"
    },
    "TapaGohan": {
        img: "images/onigiri/TapaGohan.png",
        dot1: "Gold Nori", dot2: "Adobo Rice", dot3: "Premium Beef Tapa",
        profile: "Rich & Umami", life: "Consume within 12 Hours", wrap: "Premium Gold Wrap", origin: "Classic Pinoy Breakfast"
    },
    "TapaFry": {
        img: "images/onigiri/TapaFry.png",
        dot1: "Standard Nori", dot2: "Fried Rice", dot3: "Beef Tapa",
        profile: "Hearty & Savory", life: "Consume within 8 Hours", wrap: "Standard Triangle", origin: "ABM 2401 Kitchen"
    },
    "KatsuFry": {
        img: "images/onigiri/KatsuFry.png",
        dot1: "Crunchy Nori", dot2: "Fried Rice", dot3: "Crispy Tonkatsu",
        profile: "Crispy & Deep Savory", life: "Consume within 12 Hours", wrap: "Crunchy Nori Style", origin: "Osaka Comfort"
    }
};

const flavorBtns = document.querySelectorAll('.flavor-btn');
const dot1 = document.getElementById('dot-1'); 
const dot2 = document.getElementById('dot-2');
const dot3 = document.getElementById('dot-3'); 
const blueprintImg = document.querySelector('.blueprint-img'); // Targets the image!
const specProfile = document.getElementById('spec-profile'); 
const specWrap = document.getElementById('spec-wrap');     
const specOrigin = document.getElementById('spec-origin'); 
const specLife = document.getElementById('spec-life');
const dataPanel = document.querySelector('.data-panel');

if (flavorBtns.length > 0) {
    flavorBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // UI Updates
            flavorBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            playSound('click'); 

            // Fetch Data
            const flavor = btn.getAttribute('data-flavor');
            const data = flavorDatabase[flavor];

            if (dataPanel) {
                dataPanel.classList.add('pop-active');
                setTimeout(() => dataPanel.classList.remove('pop-active'), 300);
            }

            // Update EVERYTHING dynamically
            if (data) {
                if(blueprintImg) blueprintImg.src = data.img; // Swaps the image!
                if(dot1) dot1.setAttribute('data-info', data.dot1);
                if(dot2) dot2.setAttribute('data-info', data.dot2);
                if(dot3) dot3.setAttribute('data-info', data.dot3);
                
                if(specProfile) specProfile.innerText = data.profile; 
                if(specWrap) specWrap.innerText = data.wrap;       
                if(specOrigin) specOrigin.innerText = data.origin;
                if(specLife) specLife.innerText = data.life;
            }
        });
    });
}

/* ==========================================================================
   10. SAKURA PETAL ENGINE
   ========================================================================== */
function createSakura() {
    const container = document.getElementById('sakura-container');
    if (!container) return;

    const petalCount = 35; // Adjust this number for a heavier or lighter breeze

    for (let i = 0; i < petalCount; i++) {
        const petal = document.createElement('div');
        petal.classList.add('petal');
        
        // Randomize the physics for every single petal
        const size = Math.random() * 10 + 8; // Size between 8px and 18px
        const left = Math.random() * 100; // Start anywhere from 0% to 100% width
        const duration = Math.random() * 5 + 6; // Fall time: 6s to 11s
        const delay = Math.random() * 5; // Delay before falling
        const sway = (Math.random() * 300 - 150) + 'px'; // Sway left/right down the screen
        const spin = (Math.random() * 720 + 360) + 'deg'; // How fast it tumbles

        // Apply the random math to the CSS
        petal.style.width = `${size}px`;
        petal.style.height = `${size + 2}px`;
        petal.style.left = `${left}%`;
        petal.style.animationDuration = `${duration}s`;
        petal.style.animationDelay = `${delay}s`;
        petal.style.setProperty('--sway', sway);
        petal.style.setProperty('--spin', spin);

        container.appendChild(petal);
    }
}

// Fire the engine when the site loads
window.addEventListener('load', createSakura);

/* ==========================================================================
   11. DYNAMIC ABOUT SECTION IMAGES
   ========================================================================== */
const aboutBlocks = document.querySelectorAll('.text-block');
const aboutImg = document.getElementById('dynamic-about-img');

if (aboutBlocks.length > 0 && aboutImg) {
    const aboutObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // When the text block crosses into the middle of the screen
            if (entry.isIntersecting) {
                const newSrc = entry.target.getAttribute('data-image');
                
                // Only animate if the image is actually different
                if (aboutImg.src !== newSrc) {
                    // 1. Start the fade out
                    aboutImg.classList.add('fade-out');
                    
                    // 2. Wait for the fade to finish (0.5s), swap the image, then fade back in
                    setTimeout(() => {
                        aboutImg.src = newSrc;
                        aboutImg.classList.remove('fade-out');
                    }, 500); 
                }
            }
        });
    }, {
        // This math means the trigger only fires in the middle 20% of the screen
        rootMargin: "-25% 0px -25% 0px"
    });

    aboutBlocks.forEach(block => {
        aboutObserver.observe(block);
    });
}