// js/main.js - Complete Functionality

// BankSathi Configuration
const BANKSATHI_CONFIG = {
    adviserCode: '110037218',
    contactNumber: '9773747761',
    baseUrl: 'https://banksathi.com'
};

// Redirect to BankSathi with tracking
function redirectToBankSathi(product, subProduct = null) {
    let url = `${BANKSATHI_CONFIG.baseUrl}/${product}`;
    
    if (subProduct) {
        url += `/${subProduct}`;
    }
    
    url += `?ref=${BANKSATHI_CONFIG.adviserCode}`;
    
    // Track the click
    trackConversion(product, subProduct);
    
    // Open in new tab
    window.open(url, '_blank');
    
    return false;
}

// Track conversions
function trackConversion(product, subProduct) {
    // Google Analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'generate_lead', {
            'event_category': 'loan',
            'event_label': product,
            'value': 1
        });
    }
    
    // Facebook Pixel
    if (typeof fbq !== 'undefined') {
        fbq('track', 'Lead', {
            content_name: product,
            content_category: subProduct || 'loan'
        });
    }
    
    // Local storage for own analytics
    const conversions = JSON.parse(localStorage.getItem('banksathi_conversions') || '[]');
    conversions.push({
        product: product,
        subProduct: subProduct,
        time: new Date().toISOString(),
        url: window.location.href
    });
    localStorage.setItem('banksathi_conversions', JSON.stringify(conversions));
    
    console.log(`Tracked: ${product} - ${subProduct || 'main'}`);
}

// EMI Calculator
function calculateEMI() {
    const amount = parseFloat(document.getElementById('loanAmount')?.value) || 0;
    const rate = parseFloat(document.getElementById('interestRate')?.value) || 0;
    const tenure = parseFloat(document.getElementById('loanTenure')?.value) || 0;
    
    if (amount > 0 && rate > 0 && tenure > 0) {
        const monthlyRate = rate / (12 * 100);
        const months = tenure * 12;
        const emi = amount * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
        const totalPayment = emi * months;
        const totalInterest = totalPayment - amount;
        
        document.getElementById('emiAmount').innerHTML = `₹${Math.round(emi).toLocaleString()}`;
        document.getElementById('totalInterest').innerHTML = `₹${Math.round(totalInterest).toLocaleString()}`;
        document.getElementById('totalPayment').innerHTML = `₹${Math.round(totalPayment).toLocaleString()}`;
    }
}

// Eligibility Calculator
function checkEligibility() {
    const income = parseFloat(document.getElementById('monthlyIncome')?.value) || 0;
    const existingEMI = parseFloat(document.getElementById('existingEMI')?.value) || 0;
    
    if (income > 0) {
        const maxEMI = income * 0.5 - existingEMI;
        const maxLoan = maxEMI * 12 * 5; // 5 years tenure assumption
        
        document.getElementById('eligibleAmount').innerHTML = `₹${Math.round(maxLoan).toLocaleString()}`;
        document.getElementById('maxEMI').innerHTML = `₹${Math.round(maxEMI).toLocaleString()}`;
    }
}

// Form submission
function submitLeadForm(event) {
    event.preventDefault();
    
    const formData = {
        name: document.getElementById('fullName')?.value,
        phone: document.getElementById('mobileNumber')?.value,
        email: document.getElementById('email')?.value,
        loanType: document.getElementById('loanType')?.value,
        amount: document.getElementById('loanAmount')?.value,
        city: document.getElementById('city')?.value,
        source: window.location.href,
        adviserCode: BANKSATHI_CONFIG.adviserCode
    };
    
    console.log('Lead submitted:', formData);
    
    // Store locally
    const leads = JSON.parse(localStorage.getItem('banksathi_leads') || '[]');
    leads.push({ ...formData, time: new Date().toISOString() });
    localStorage.setItem('banksathi_leads', JSON.stringify(leads));
    
    // Track in GA
    if (typeof gtag !== 'undefined') {
        gtag('event', 'submit_lead', {
            'event_category': 'form',
            'event_label': formData.loanType
        });
    }
    
    alert('Thank you! A BankSathi expert will call you within 1 hour.');
    
    // Redirect to BankSathi
    redirectToBankSathi(formData.loanType);
    
    return false;
}

// Search functionality
function searchProducts() {
    const query = document.getElementById('searchInput')?.value.toLowerCase();
    if (!query) return;
    
    // Track search
    if (typeof gtag !== 'undefined') {
        gtag('event', 'search', {
            'search_term': query
        });
    }
    
    // Redirect to BankSathi search
    window.open(`${BANKSATHI_CONFIG.baseUrl}/search?q=${encodeURIComponent(query)}&ref=${BANKSATHI_CONFIG.adviserCode}`, '_blank');
}

// FAQ Accordion
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            item.classList.toggle('active');
        });
    });
}

// Mobile menu toggle
function initMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('show');
        });
    }
}

// Load city-specific content
function loadCityContent() {
    const cityElements = document.querySelectorAll('[data-city]');
    cityElements.forEach(el => {
        const city = el.getAttribute('data-city');
        el.innerHTML = el.innerHTML.replace(/\[CITY\]/g, city);
    });
}

// Analytics dashboard (console only)
function showAnalytics() {
    const conversions = JSON.parse(localStorage.getItem('banksathi_conversions') || '[]');
    const leads = JSON.parse(localStorage.getItem('banksathi_leads') || '[]');
    
    console.log('=== BankSathi Analytics ===');
    console.log(`Total Conversions: ${conversions.length}`);
    console.log(`Total Leads: ${leads.length}`);
    console.log('\nTop Products:');
    
    const productCount = {};
    conversions.forEach(c => {
        productCount[c.product] = (productCount[c.product] || 0) + 1;
    });
    
    Object.entries(productCount).sort((a,b) => b[1] - a[1]).slice(0,5).forEach(([p,c]) => {
        console.log(`  ${p}: ${c} clicks`);
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initFAQ();
    initMobileMenu();
    loadCityContent();
    
    // Initialize calculators if present
    if (document.getElementById('loanAmount')) {
        calculateEMI();
    }
    
    console.log('BankSathi Platform Loaded!');
    console.log(`Adviser Code: ${BANKSATHI_CONFIG.adviserCode}`);
    console.log('Call showAnalytics() to see stats');
});

// Export for global use
window.redirectToBankSathi = redirectToBankSathi;
window.calculateEMI = calculateEMI;
window.checkEligibility = checkEligibility;
window.submitLeadForm = submitLeadForm;
window.searchProducts = searchProducts;
window.showAnalytics = showAnalytics;
