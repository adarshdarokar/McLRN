/**
 * High-Performance Vanilla JS Scroll Engine & Animations
 */

// --- 1. Smooth Scroll Implementation ---
// To achieve a "Lenis/Apple" like smooth scroll without libraries,
// we set body height to the container's height and lerp the container's transform.

const scrollContainer = document.getElementById('scroll-container');
let currentScrollY = 0;
let targetScrollY = 0;
let windowHeight = window.innerHeight;

// Linear interpolation function
const lerp = (start, end, factor) => start + (end - start) * factor;

function initSmoothScroll() {
    // Set body height to match the scroll container height
    document.body.style.height = `${scrollContainer.getBoundingClientRect().height}px`;
    
    // Sync target scroll with native scroll position
    window.addEventListener('scroll', () => {
        targetScrollY = window.scrollY;
    }, { passive: true });

    // Handle window resize
    window.addEventListener('resize', () => {
        windowHeight = window.innerHeight;
        setupHorizontalScroll(); // Recalculate horizontal scroll bounds
        document.body.style.height = `${scrollContainer.getBoundingClientRect().height}px`;
    }, { passive: true });
}

// --- 2. Horizontal Scroll Logic ---
const showcaseSection = document.querySelector('.showcase');
const horizontalTrack = document.querySelector('.horizontal-track');
let showcaseStart = 0;
let showcaseEnd = 0;
let trackScrollWidth = 0;

function setupHorizontalScroll() {
    if (!showcaseSection || !horizontalTrack) return;
    
    // Calculate how far the track needs to move horizontally
    trackScrollWidth = horizontalTrack.scrollWidth - window.innerWidth + (window.innerWidth * 0.2); // Add some padding at the end
    
    // Set the height of the section to allow scrolling
    // 100vh for the section itself + the horizontal scroll distance
    const sectionHeight = windowHeight + trackScrollWidth;
    showcaseSection.style.height = `${sectionHeight}px`;
    
    // Calculate where the section starts and ends in the document
    // We must do this after setting the body height
    setTimeout(() => {
        const rect = showcaseSection.getBoundingClientRect();
        showcaseStart = rect.top + currentScrollY; // Absolute document position
        showcaseEnd = showcaseStart + trackScrollWidth;
    }, 100);
}

// --- 3. Parallax Logic ---
const parallaxImages = document.querySelectorAll('.parallax-img');

function updateParallax() {
    parallaxImages.forEach(img => {
        const container = img.parentElement;
        const rect = container.getBoundingClientRect();
        
        // Check if element is in viewport
        if (rect.top < windowHeight && rect.bottom > 0) {
            // Calculate progress from 0 (entering bottom) to 1 (leaving top)
            const progress = (windowHeight - rect.top) / (windowHeight + rect.height);
            // Map progress to a translateY value (e.g., -10% to 10%)
            const yMovement = lerp(-10, 10, progress);
            img.style.transform = `translateY(${yMovement}%) scale(1.1)`;
        }
    });
}

// --- 4. Intersection Observer for Fade Animations ---
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.2
};

const fadeInObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            // Animate numbers if it's a stat item
            const numberEl = entry.target.querySelector('.stat-number');
            if (numberEl) animateNumber(numberEl);
            
            observer.unobserve(entry.target); // Only animate once
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in-up').forEach(el => {
    fadeInObserver.observe(el);
});

// --- 5. Number Animation ---
function animateNumber(element) {
    const target = parseFloat(element.getAttribute('data-target'));
    const duration = 2000; // ms
    const startTime = performance.now();
    const isDecimal = target % 1 !== 0;

    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing out cubic
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentVal = target * easeOut;

        element.textContent = isDecimal ? currentVal.toFixed(1) : Math.floor(currentVal);

        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        } else {
            element.textContent = target; // Ensure exact final value
        }
    }
    requestAnimationFrame(updateNumber);
}

// --- 6. Navbar Hide/Show on Scroll ---
const navbar = document.querySelector('.navbar');
let lastScroll = 0;

function updateNavbar() {
    if (currentScrollY > 100) {
        if (currentScrollY > lastScroll && !navbar.classList.contains('hidden')) {
            // Scrolling down
            navbar.classList.add('hidden');
        } else if (currentScrollY < lastScroll && navbar.classList.contains('hidden')) {
            // Scrolling up
            navbar.classList.remove('hidden');
        }
    }
    lastScroll = currentScrollY;
}


// --- Main Render Loop ---
function raf() {
    // 1. Lerp scroll position for smoothness (smoothing factor 0.08)
    currentScrollY = lerp(currentScrollY, targetScrollY, 0.08);

    // Stop updating if the difference is tiny to save CPU
    if (Math.abs(targetScrollY - currentScrollY) < 0.1) {
        currentScrollY = targetScrollY;
    }

    // 2. Apply smooth transform to the container
    // We use fixed positioning on the container to prevent native scroll conflicts
    scrollContainer.style.position = 'fixed';
    scrollContainer.style.top = '0';
    scrollContainer.style.left = '0';
    scrollContainer.style.width = '100%';
    scrollContainer.style.transform = `translate3d(0, ${-currentScrollY}px, 0)`; // translate3d for GPU acceleration

    // 3. Update Horizontal Scroll
    if (showcaseSection && horizontalTrack) {
        // Calculate relative position within the showcase section
        if (currentScrollY >= showcaseStart && currentScrollY <= showcaseEnd) {
            const progress = (currentScrollY - showcaseStart) / (showcaseEnd - showcaseStart);
            const xMovement = -progress * trackScrollWidth;
            horizontalTrack.style.transform = `translate3d(${xMovement}px, 0, 0)`;
        } else if (currentScrollY < showcaseStart) {
            horizontalTrack.style.transform = `translate3d(0, 0, 0)`;
        } else if (currentScrollY > showcaseEnd) {
             horizontalTrack.style.transform = `translate3d(${-trackScrollWidth}px, 0, 0)`;
        }
    }

    // 4. Update Parallax
    updateParallax();
    
    // 5. Update Navbar
    updateNavbar();

    // Loop
    requestAnimationFrame(raf);
}

// --- Initialize ---
window.addEventListener('load', () => {
    initSmoothScroll();
    setupHorizontalScroll();
    
    // Recalculate heights after a short delay to ensure images/fonts are loaded
    setTimeout(() => {
        document.body.style.height = `${scrollContainer.getBoundingClientRect().height}px`;
        setupHorizontalScroll();
    }, 500);

    // Start render loop
    requestAnimationFrame(raf);
});
