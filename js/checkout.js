/**
 * Car Rental System - Checkout JavaScript
 * Created: April 2025
 */

// Global variables
let cartItems = [];
let currentStep = 1;
let orderSummary = {
    subtotal: 0,
    insurance: 0,
    addons: 0,
    taxes: 0,
    discount: 0,
    total: 0
};

// Stripe variables
let stripe;
let elements;
let cardElement;
let paymentProcessing = false;

// Document ready function
document.addEventListener('DOMContentLoaded', function() {
    // Load cart items
    loadCartItems();
    
    // Initialize step navigation
    initStepNavigation();
    
    // Initialize insurance and addon selection
    initInsuranceAndAddons();
    
    // Initialize payment method selection
    initPaymentMethodSelection();
    
    // Initialize billing address toggle
    initBillingAddressToggle();
    
    // Pre-fill driver information if user is logged in
    prefillDriverInfo();
    
    // Initialize Stripe
    initStripe();
});

/**
 * Load cart items from localStorage
 */
function loadCartItems() {
    console.log('Checkout.js: Loading cart items from localStorage');
    
    // Clear cartItems array
    cartItems = [];
    
    // Get cart items from localStorage
    const storedCart = localStorage.getItem('cartItems');
    console.log('Raw stored cart data:', storedCart);
    
    if (storedCart) {
        try {
            const parsedCart = JSON.parse(storedCart);
            console.log('Parsed cart data:', parsedCart);
            
            // Make sure parsedCart is an array
            if (Array.isArray(parsedCart)) {
                // Filter out invalid items
                cartItems = parsedCart.filter(item => {
                    return item && item.car && item.car.name && item.totalPrice;
                });
                
                console.log('Valid cart items:', cartItems);
                
                // If all items were invalid, redirect to cart page
                if (cartItems.length === 0) {
                    console.warn('No valid cart items found, redirecting to cart page');
                    window.location.href = 'cart.html';
                    return;
                }
            } else {
                console.error('Stored cart is not an array');
                window.location.href = 'cart.html';
                return;
            }
            
            // Display order items
            displayOrderItems();
            
            // Calculate and display order summary
            calculateOrderSummary();
        } catch (error) {
            console.error('Error parsing cart items:', error);
            window.location.href = 'cart.html';
            return;
        }
    } else {
        console.log('No cart items found, redirecting to cart page');
        // Redirect to cart page if no items in cart
        window.location.href = 'cart.html';
        return;
    }
}

/**
 * Display order items in the order summary
 */
function displayOrderItems() {
    const orderItemsContainer = document.getElementById('order-items');
    
    if (!orderItemsContainer) {
        console.error('Order items container not found');
        return;
    }
    
    console.log('Displaying order items:', cartItems);
    
    // Clear container
    orderItemsContainer.innerHTML = '';
    
    // Check if cart is empty
    if (!cartItems || cartItems.length === 0) {
        orderItemsContainer.innerHTML = '<p class="text-center">No items in cart</p>';
        return;
    }
    
    // Create HTML for each order item
    cartItems.forEach(item => {
        try {
            if (!item || !item.car) {
                console.error('Invalid cart item:', item);
                return;
            }
            
            const car = item.car;
            const carName = car.name || 'Unknown Car';
            const carType = car.type || 'Standard';
            const carImage = car.image || 'images/car-placeholder.jpg';
            const totalPrice = parseFloat(item.totalPrice) || 0;
            
            // Format dates safely
            let pickupDateFormatted = 'N/A';
            let returnDateFormatted = 'N/A';
            
            try {
                if (item.pickupDate) {
                    pickupDateFormatted = formatDate(item.pickupDate);
                }
                if (item.returnDate) {
                    returnDateFormatted = formatDate(item.returnDate);
                }
            } catch (e) {
                console.error('Error formatting dates:', e);
            }
            
            const orderItemHTML = `
                <div class="d-flex mb-3">
                    <img src="${carImage}" alt="${carName}" class="img-thumbnail me-3" style="width: 80px; height: 60px; object-fit: cover;" onerror="this.src='images/car-placeholder.jpg'">
                    <div>
                        <h6 class="mb-0">${carName}</h6>
                        <small class="text-muted">${carType}</small>
                        <div class="text-muted">
                            <small>${pickupDateFormatted} - ${returnDateFormatted}</small>
                        </div>
                        <div class="fw-bold">$${totalPrice.toFixed(2)}</div>
                    </div>
                </div>
            `;
            
            orderItemsContainer.innerHTML += orderItemHTML;
        } catch (error) {
            console.error('Error rendering order item:', error, item);
        }
    });
}

/**
 * Calculate and display order summary
 */
function calculateOrderSummary() {
    console.log('Calculating order summary for cart items:', cartItems);
    
    // Calculate subtotal
    if (Array.isArray(cartItems) && cartItems.length > 0) {
        orderSummary.subtotal = cartItems.reduce((total, item) => {
            // Make sure totalPrice is a number
            const itemPrice = item && item.totalPrice ? parseFloat(item.totalPrice) : 0;
            return total + itemPrice;
        }, 0);
    } else {
        orderSummary.subtotal = 0;
    }
    
    console.log('Calculated subtotal:', orderSummary.subtotal);
    
    // Get insurance cost based on selected option
    const insuranceOptions = document.getElementsByName('insurance');
    let selectedInsurance = 'basic'; // Default to basic
    
    for (const option of insuranceOptions) {
        if (option.checked) {
            selectedInsurance = option.value;
            break;
        }
    }
    
    // Calculate insurance cost
    let totalDays = 0;
    if (Array.isArray(cartItems) && cartItems.length > 0) {
        totalDays = cartItems.reduce((total, item) => {
            const days = item && item.days ? parseInt(item.days) : 0;
            return total + days;
        }, 0);
    }
    
    console.log('Total rental days:', totalDays);
    
    switch (selectedInsurance) {
        case 'premium':
            orderSummary.insurance = 25 * totalDays;
            break;
        case 'basic':
            orderSummary.insurance = 15 * totalDays;
            break;
        case 'none':
            orderSummary.insurance = 0;
            break;
    }
    
    // Calculate addons cost
    orderSummary.addons = 0;
    
    if (document.getElementById('gps-addon') && document.getElementById('gps-addon').checked) {
        orderSummary.addons += 5 * totalDays;
    }
    
    if (document.getElementById('child-seat-addon') && document.getElementById('child-seat-addon').checked) {
        orderSummary.addons += 7 * totalDays;
    }
    
    if (document.getElementById('additional-driver-addon') && document.getElementById('additional-driver-addon').checked) {
        orderSummary.addons += 10 * totalDays;
    }
    
    if (document.getElementById('roadside-assistance-addon') && document.getElementById('roadside-assistance-addon').checked) {
        orderSummary.addons += 8 * totalDays;
    }
    
    // Calculate taxes (10% of subtotal)
    orderSummary.taxes = (orderSummary.subtotal + orderSummary.insurance + orderSummary.addons) * 0.1;
    
    // Get discount from sessionStorage
    try {
        orderSummary.discount = parseFloat(sessionStorage.getItem('cartDiscount') || 0);
        if (isNaN(orderSummary.discount)) orderSummary.discount = 0;
    } catch (e) {
        console.error('Error parsing discount:', e);
        orderSummary.discount = 0;
    }
    
    // Calculate total
    orderSummary.total = orderSummary.subtotal + orderSummary.insurance + orderSummary.addons + orderSummary.taxes - orderSummary.discount;
    
    console.log('Order summary calculated:', orderSummary);
    
    // Update order summary display
    updateOrderSummaryDisplay();
}

/**
 * Update order summary display
 */
function updateOrderSummaryDisplay() {
    document.getElementById('checkout-subtotal').textContent = `$${orderSummary.subtotal.toFixed(2)}`;
    document.getElementById('checkout-insurance').textContent = `$${orderSummary.insurance.toFixed(2)}`;
    document.getElementById('checkout-addons').textContent = `$${orderSummary.addons.toFixed(2)}`;
    document.getElementById('checkout-taxes').textContent = `$${orderSummary.taxes.toFixed(2)}`;
    document.getElementById('checkout-discount').textContent = `-$${orderSummary.discount.toFixed(2)}`;
    document.getElementById('checkout-total').textContent = `$${orderSummary.total.toFixed(2)}`;
}

/**
 * Initialize step navigation
 */
function initStepNavigation() {
    // To payment button
    const toPaymentBtn = document.getElementById('to-payment-btn');
    if (toPaymentBtn) {
        toPaymentBtn.addEventListener('click', function() {
            // Validate rental details form
            if (!validateRentalDetailsForm()) {
                return;
            }
            
            // Hide rental details step, show payment step
            document.getElementById('rental-details-step').classList.add('d-none');
            document.getElementById('payment-step').classList.remove('d-none');
            
            // Update steps UI
            updateStepsUI(2);
            
            // Update current step
            currentStep = 2;
        });
    }
    
    // Back to rental details button
    const backToRentalBtn = document.getElementById('back-to-rental-btn');
    if (backToRentalBtn) {
        backToRentalBtn.addEventListener('click', function() {
            // Hide payment step, show rental details step
            document.getElementById('payment-step').classList.add('d-none');
            document.getElementById('rental-details-step').classList.remove('d-none');
            
            // Update steps UI
            updateStepsUI(1);
            
            // Update current step
            currentStep = 1;
        });
    }
    
    // Place order button
    const placeOrderBtn = document.getElementById('place-order-btn');
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', function() {
            // Prevent multiple submissions
            if (paymentProcessing) {
                return;
            }
            
            // Validate payment form
            if (!validatePaymentForm()) {
                return;
            }
            
            // Show loading state
            this.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Processing...';
            this.disabled = true;
            paymentProcessing = true;
            
            // Check which payment method is selected
            const creditCardRadio = document.getElementById('credit-card');
            const paypalRadio = document.getElementById('paypal');
            const googlePayRadio = document.getElementById('google-pay');
            const phonePeRadio = document.getElementById('phone-pe');
            
            if (creditCardRadio && creditCardRadio.checked) {
                // Process credit card payment with Stripe
                processStripePayment(this);
            } else if (paypalRadio && paypalRadio.checked) {
                // Process PayPal payment
                processPayPalPayment(this);
            } else if (googlePayRadio && googlePayRadio.checked) {
                // Process Google Pay payment
                processGooglePayPayment(this);
            } else if (phonePeRadio && phonePeRadio.checked) {
                // Process PhonePe payment
                processPhonePePayment(this);
            } else {
                // Fallback to default payment method
                showPaymentError('Please select a payment method');
                this.innerHTML = 'Place Order';
                this.disabled = false;
                paymentProcessing = false;
            }
        });
    }
}

/**
 * Update steps UI
 * @param {number} activeStep - Active step number
 */
function updateStepsUI(activeStep) {
    // Get step elements
    const steps = document.querySelectorAll('.checkout-steps .step');
    const connectors = document.querySelectorAll('.checkout-steps .step-connector');
    
    // Update steps
    steps.forEach((step, index) => {
        if (index + 1 <= activeStep) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
    
    // Update connectors
    connectors.forEach((connector, index) => {
        if (index + 1 < activeStep) {
            connector.classList.add('active');
        } else {
            connector.classList.remove('active');
        }
    });
}

/**
 * Initialize insurance and addon selection
 */
function initInsuranceAndAddons() {
    // Insurance options
    const insuranceOptions = document.getElementsByName('insurance');
    for (const option of insuranceOptions) {
        option.addEventListener('change', calculateOrderSummary);
    }
    
    // Addon options
    const addonOptions = [
        document.getElementById('gps-addon'),
        document.getElementById('child-seat-addon'),
        document.getElementById('additional-driver-addon'),
        document.getElementById('roadside-assistance-addon')
    ];
    
    for (const option of addonOptions) {
        if (option) {
            option.addEventListener('change', calculateOrderSummary);
        }
    }
}

/**
 * Initialize payment method selection
 */
function initPaymentMethodSelection() {
    const creditCardRadio = document.getElementById('credit-card');
    const paypalRadio = document.getElementById('paypal');
    const googlePayRadio = document.getElementById('google-pay');
    const phonePeRadio = document.getElementById('phone-pe');
    
    const creditCardForm = document.getElementById('credit-card-form');
    const paypalForm = document.getElementById('paypal-form');
    const googlePayForm = document.getElementById('google-pay-form');
    const phonePeForm = document.getElementById('phone-pe-form');
    
    // Hide all payment forms initially except credit card
    const hideAllPaymentForms = () => {
        creditCardForm?.classList.add('d-none');
        paypalForm?.classList.add('d-none');
        googlePayForm?.classList.add('d-none');
        phonePeForm?.classList.add('d-none');
    };
    
    // Credit Card option
    if (creditCardRadio && creditCardForm) {
        creditCardRadio.addEventListener('change', function() {
            if (this.checked) {
                hideAllPaymentForms();
                creditCardForm.classList.remove('d-none');
            }
        });
    }
    
    // PayPal option
    if (paypalRadio && paypalForm) {
        paypalRadio.addEventListener('change', function() {
            if (this.checked) {
                hideAllPaymentForms();
                paypalForm.classList.remove('d-none');
            }
        });
    }
    
    // Google Pay option
    if (googlePayRadio && googlePayForm) {
        googlePayRadio.addEventListener('change', function() {
            if (this.checked) {
                hideAllPaymentForms();
                googlePayForm.classList.remove('d-none');
            }
        });
    }
    
    // PhonePe option
    if (phonePeRadio && phonePeForm) {
        phonePeRadio.addEventListener('change', function() {
            if (this.checked) {
                hideAllPaymentForms();
                phonePeForm.classList.remove('d-none');
            }
        });
    }
}

/**
 * Initialize billing address toggle
 */
function initBillingAddressToggle() {
    const sameAsProfileCheckbox = document.getElementById('same-as-profile');
    const billingAddressFields = document.getElementById('billing-address-fields');
    
    if (sameAsProfileCheckbox && billingAddressFields) {
        sameAsProfileCheckbox.addEventListener('change', function() {
            if (this.checked) {
                billingAddressFields.classList.add('d-none');
            } else {
                billingAddressFields.classList.remove('d-none');
            }
        });
    }
}

/**
 * Pre-fill driver information if user is logged in
 */
function prefillDriverInfo() {
    // Get user data from localStorage
    const userData = localStorage.getItem('currentUser');
    
    if (userData) {
        const user = JSON.parse(userData);
        
        // Pre-fill driver information
        document.getElementById('driver-first-name').value = user.firstName || '';
        document.getElementById('driver-last-name').value = user.lastName || '';
        document.getElementById('driver-email').value = user.email || '';
        
        // Pre-fill card holder name
        document.getElementById('card-holder').value = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
}

/**
 * Validate rental details form
 * @returns {boolean} Whether the form is valid
 */
function validateRentalDetailsForm() {
    // Get form elements
    const driverFirstName = document.getElementById('driver-first-name');
    const driverLastName = document.getElementById('driver-last-name');
    const driverEmail = document.getElementById('driver-email');
    const driverPhone = document.getElementById('driver-phone');
    const driverLicense = document.getElementById('driver-license');
    const driverLicenseState = document.getElementById('driver-license-state');
    const driverLicenseExpiry = document.getElementById('driver-license-expiry');
    
    // Check if required fields are filled
    let isValid = true;
    
    if (!driverFirstName.value.trim()) {
        isValid = false;
        showInvalidFeedback(driverFirstName, 'First name is required');
    }
    
    if (!driverLastName.value.trim()) {
        isValid = false;
        showInvalidFeedback(driverLastName, 'Last name is required');
    }
    
    if (!driverEmail.value.trim()) {
        isValid = false;
        showInvalidFeedback(driverEmail, 'Email is required');
    } else if (!isValidEmail(driverEmail.value.trim())) {
        isValid = false;
        showInvalidFeedback(driverEmail, 'Please enter a valid email address');
    }
    
    if (!driverPhone.value.trim()) {
        isValid = false;
        showInvalidFeedback(driverPhone, 'Phone number is required');
    }
    
    if (!driverLicense.value.trim()) {
        isValid = false;
        showInvalidFeedback(driverLicense, 'Driver\'s license number is required');
    }
    
    if (!driverLicenseState.value.trim()) {
        isValid = false;
        showInvalidFeedback(driverLicenseState, 'License state is required');
    }
    
    if (!driverLicenseExpiry.value) {
        isValid = false;
        showInvalidFeedback(driverLicenseExpiry, 'License expiry date is required');
    } else {
        // Check if license is expired
        const expiryDate = new Date(driverLicenseExpiry.value);
        const today = new Date();
        
        if (expiryDate < today) {
            isValid = false;
            showInvalidFeedback(driverLicenseExpiry, 'License is expired');
        }
    }
    
    return isValid;
}

/**
 * Validate payment form
 * @returns {boolean} Whether the form is valid
 */
function validatePaymentForm() {
    // Check which payment method is selected
    const creditCardRadio = document.getElementById('credit-card');
    const googlePayRadio = document.getElementById('google-pay');
    const phonePeRadio = document.getElementById('phone-pe');
    
    // Validate credit card form
    if (creditCardRadio && creditCardRadio.checked) {
        // Validate credit card form using Stripe Elements
        const cardHolder = document.getElementById('card-holder');
        
        let isValid = true;
        
        if (!cardHolder || !cardHolder.value.trim()) {
            isValid = false;
            showInvalidFeedback(cardHolder, 'Card holder name is required');
        }
        
        // For Stripe Elements, we'll rely on their validation
        // but we need to check if the card element has errors
        const cardErrors = document.getElementById('card-errors');
        if (cardErrors && cardErrors.textContent) {
            isValid = false;
        }
        
        return isValid;
    }
    
    // Validate Google Pay form
    if (googlePayRadio && googlePayRadio.checked) {
        const phoneNumber = document.getElementById('gpay-phone');
        
        if (!phoneNumber || !phoneNumber.value.trim()) {
            showInvalidFeedback(phoneNumber, 'Phone number is required');
            return false;
        }
        
        // Basic phone number validation
        const phonePattern = /^\+?[0-9\s]{10,15}$/;
        if (!phonePattern.test(phoneNumber.value.trim())) {
            showInvalidFeedback(phoneNumber, 'Please enter a valid phone number');
            return false;
        }
        
        return true;
    }
    
    // Validate PhonePe form
    if (phonePeRadio && phonePeRadio.checked) {
        const phoneNumber = document.getElementById('phonepe-number');
        
        if (!phoneNumber || !phoneNumber.value.trim()) {
            showInvalidFeedback(phoneNumber, 'Phone number is required');
            return false;
        }
        
        // Basic phone number validation
        const phonePattern = /^\+?[0-9\s]{10,15}$/;
        if (!phonePattern.test(phoneNumber.value.trim())) {
            showInvalidFeedback(phoneNumber, 'Please enter a valid phone number');
            return false;
        }
        
        return true;
    }
    
    // If PayPal is selected, no validation needed
    return true;
}

/**
 * Show invalid feedback for a form element
 * @param {HTMLElement} element - Form element
 * @param {string} message - Error message
 */
function showInvalidFeedback(element, message) {
    // Add invalid class
    element.classList.add('is-invalid');
    
    // Create or update feedback element
    let feedback = element.nextElementSibling;
    if (!feedback || !feedback.classList.contains('invalid-feedback')) {
        feedback = document.createElement('div');
        feedback.className = 'invalid-feedback';
        element.parentNode.insertBefore(feedback, element.nextSibling);
    }
    
    feedback.textContent = message;
    
    // Remove invalid class after user starts typing
    element.addEventListener('input', function() {
        this.classList.remove('is-invalid');
    }, { once: true });
}

/**
 * Check if email is valid
 * @param {string} email - Email to validate
 * @returns {boolean} Whether the email is valid
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Check if credit card number is valid
 * @param {string} cardNumber - Credit card number to validate
 * @returns {boolean} Whether the credit card number is valid
 */
function isValidCreditCard(cardNumber) {
    // Remove spaces and dashes
    cardNumber = cardNumber.replace(/[\s-]/g, '');
    
    // Check if number is between 13 and 19 digits
    if (!/^\d{13,19}$/.test(cardNumber)) {
        return false;
    }
    
    // Luhn algorithm
    let sum = 0;
    let doubleUp = false;
    
    for (let i = cardNumber.length - 1; i >= 0; i--) {
        let digit = parseInt(cardNumber.charAt(i));
        
        if (doubleUp) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }
        
        sum += digit;
        doubleUp = !doubleUp;
    }
    
    return sum % 10 === 0;
}

/**
 * Check if expiry date is valid
 * @param {string} expiryDate - Expiry date to validate (MM/YY)
 * @returns {boolean} Whether the expiry date is valid
 */
function isValidExpiryDate(expiryDate) {
    // Check format
    if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
        return false;
    }
    
    // Split into month and year
    const [month, year] = expiryDate.split('/');
    
    // Check month is between 1 and 12
    if (parseInt(month) < 1 || parseInt(month) > 12) {
        return false;
    }
    
    // Get current date
    const now = new Date();
    const currentYear = now.getFullYear() % 100; // Get last 2 digits of year
    const currentMonth = now.getMonth() + 1; // January is 0
    
    // Check if card is expired
    if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
        return false;
    }
    
    return true;
}

/**
 * Check if CVV is valid
 * @param {string} cvv - CVV to validate
 * @returns {boolean} Whether the CVV is valid
 */
function isValidCVV(cvv) {
    // CVV should be 3 or 4 digits
    return /^\d{3,4}$/.test(cvv);
}

/**
 * Generate a random booking reference
 * @returns {string} Random booking reference
 */
function generateBookingReference() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let reference = '';
    
    // Generate 8 character reference
    for (let i = 0; i < 8; i++) {
        reference += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return reference;
}

/**
 * Format date to display in a more readable format
 * @param {string} dateString - Date string in format YYYY-MM-DD
 * @returns {string} Formatted date string
 */
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

/**
 * Initialize Stripe Elements
 */
function initStripe() {
    // Initialize Stripe with your publishable key
    // Replace with your actual Stripe publishable key in production
    stripe = Stripe('pk_test_51NXwqDSIKZm8XT0Ry2MUwGIvhLWXVeN1ZgHGCvnzTvZjgW5qyD0Aqv4NeTrack2Mj8oBUXvI9UlLNiHJJZbUCTzT00tYCJOvH9');
    
    // Create an instance of Elements
    elements = stripe.elements();
    
    // Create and mount the Card Element
    const style = {
        base: {
            color: '#495057',
            fontFamily: 'Arial, sans-serif',
            fontSmoothing: 'antialiased',
            fontSize: '16px',
            '::placeholder': {
                color: '#6c757d'
            }
        },
        invalid: {
            color: '#dc3545',
            iconColor: '#dc3545'
        }
    };
    
    cardElement = elements.create('card', { style: style });
    cardElement.mount('#card-element');
    
    // Handle real-time validation errors from the card Element
    cardElement.on('change', function(event) {
        const displayError = document.getElementById('card-errors');
        if (event.error) {
            displayError.textContent = event.error.message;
            displayError.classList.add('d-block');
        } else {
            displayError.textContent = '';
            displayError.classList.remove('d-block');
        }
    });
}

/**
 * Process payment with Stripe
 * @param {HTMLElement} button - The button that was clicked
 */
function processStripePayment(button) {
    console.log('Processing Stripe payment');
    
    // Get the card holder name
    const cardHolderName = document.getElementById('card-holder').value;
    
    if (!cardHolderName) {
        showPaymentError('Please enter the card holder name');
        resetPaymentButton(button);
        return;
    }
    
    // Check if Stripe is initialized
    if (!stripe || !cardElement) {
        console.error('Stripe not initialized');
        showPaymentError('Payment system not initialized. Please refresh the page and try again.');
        resetPaymentButton(button);
        return;
    }
    
    console.log('Creating Stripe payment method...');
    
    // Create a payment method
    stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
            name: cardHolderName
        }
    }).then(function(result) {
        if (result.error) {
            console.error('Stripe payment error:', result.error);
            // Show error to your customer
            showPaymentError(result.error.message || 'Payment failed. Please check your card details.');
            resetPaymentButton(button);
        } else {
            console.log('Payment method created successfully:', result.paymentMethod.id);
            // In a real application, you would send this to your server to create a payment intent
            // For this demo, we'll simulate a successful payment
            simulateSuccessfulPayment(result.paymentMethod.id);
        }
    }).catch(function(error) {
        console.error('Unexpected error during payment processing:', error);
        showPaymentError('An unexpected error occurred. Please try again.');
        resetPaymentButton(button);
    });
}

/**
 * Show payment error message
 * @param {string} message - Error message to display
 */
function showPaymentError(message) {
    const errorElement = document.getElementById('card-errors');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('d-block');
    } else {
        alert('Payment Error: ' + message);
    }
}

/**
 * Reset payment button to initial state
 * @param {HTMLElement} button - The button to reset
 */
function resetPaymentButton(button) {
    if (button) {
        button.innerHTML = 'Place Order<i class="fas fa-arrow-right ms-2"></i>';
        button.disabled = false;
    }
    paymentProcessing = false;
}

/**
 * Process payment with PayPal
 * @param {HTMLElement} button - The button that was clicked
 */
function processPayPalPayment(button) {
    // Show loading state
    button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';
    button.disabled = true;
    
    // Simulate PayPal redirect and payment
    setTimeout(() => simulateSuccessfulPayment('pp_' + Date.now()), 2000);
}

/**
 * Process payment with Google Pay
 * @param {HTMLElement} button - The button that was clicked
 */
function processGooglePayPayment(button) {
    // Get phone number
    const phoneNumber = document.getElementById('gpay-phone')?.value;
    
    // Validate phone number
    if (!phoneNumber || phoneNumber.trim() === '') {
        showPaymentError('Please enter your phone number');
        resetPaymentButton(button);
        return;
    }
    
    // Show loading state
    button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';
    button.disabled = true;
    
    // Simulate Google Pay payment process
    setTimeout(() => {
        console.log('Processing Google Pay payment for phone:', phoneNumber);
        simulateSuccessfulPayment('gpay_' + Date.now());
    }, 2000);
}

/**
 * Process payment with PhonePe
 * @param {HTMLElement} button - The button that was clicked
 */
function processPhonePePayment(button) {
    // Get phone number
    const phoneNumber = document.getElementById('phonepe-number')?.value;
    
    // Validate phone number
    if (!phoneNumber || phoneNumber.trim() === '') {
        showPaymentError('Please enter your PhonePe number');
        resetPaymentButton(button);
        return;
    }
    
    // Show loading state
    button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';
    button.disabled = true;
    
    // Simulate PhonePe payment process
    setTimeout(() => {
        console.log('Processing PhonePe payment for phone:', phoneNumber);
        simulateSuccessfulPayment('phonepe_' + Date.now());
    }, 2000);
}

/**
 * Simulate a successful payment and complete the booking process
 * @param {string} paymentId - The payment ID from the payment processor
 */
function simulateSuccessfulPayment(paymentId) {
    // Generate random booking reference
    const bookingReference = generateBookingReference();
    document.getElementById('booking-reference').textContent = bookingReference;
    
    // In a real application, you would save the booking to your database
    // with the payment ID and booking reference
    saveBookingToLocalStorage(bookingReference, paymentId);
    
    // Hide payment step, show confirmation step
    document.getElementById('payment-step').classList.add('d-none');
    document.getElementById('confirmation-step').classList.remove('d-none');
    
    // Update steps UI
    updateStepsUI(3);
    
    // Update current step
    currentStep = 3;
    
    // Clear cart
    localStorage.removeItem('cartItems');
    sessionStorage.removeItem('cartDiscount');
    
    // Update cart count in navbar
    const cartCountElements = document.querySelectorAll('#cart-count');
    cartCountElements.forEach(element => {
        element.textContent = '0';
    });
}

/**
 * Save booking to localStorage
 * @param {string} bookingReference - The booking reference
 * @param {string} paymentId - The payment ID from the payment processor
 */
function saveBookingToLocalStorage(bookingReference, paymentId) {
    // Get current user
    const userData = localStorage.getItem('currentUser');
    if (!userData) return;
    
    const user = JSON.parse(userData);
    
    // Get driver information
    const driverFirstName = document.getElementById('driver-first-name').value;
    const driverLastName = document.getElementById('driver-last-name').value;
    const driverEmail = document.getElementById('driver-email').value;
    const driverPhone = document.getElementById('driver-phone').value;
    
    // Create booking object
    const booking = {
        bookingReference: bookingReference,
        paymentId: paymentId,
        userId: user.id,
        status: 'upcoming',
        orderSummary: orderSummary,
        items: cartItems,
        driverInfo: {
            firstName: driverFirstName,
            lastName: driverLastName,
            email: driverEmail,
            phone: driverPhone
        },
        createdAt: new Date().toISOString()
    };
    
    // Get existing bookings or create empty array
    let bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    
    // Add new booking
    bookings.push(booking);
    
    // Save to localStorage
    localStorage.setItem('bookings', JSON.stringify(bookings));
}
