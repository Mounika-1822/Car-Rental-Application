/**
 * Car Rental System - Cart JavaScript
 * Created: April 2025
 * Updated: April 2025 - Fixed cart functionality
 */

// Global variables
let cartItems = [];
let recommendedCars = [];

// Document ready function
document.addEventListener('DOMContentLoaded', function() {
    console.log('Cart.js loaded');
    
    // Load cart items
    loadCartItems();
    
    // Initialize promo code form
    const promoForm = document.getElementById('promo-form');
    if (promoForm) {
        promoForm.addEventListener('submit', handlePromoCode);
    } else {
        console.warn('Promo form not found in the DOM');
    }
    
    // Load recommended cars
    loadRecommendedCars();
    
    // Initialize checkout button
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function(e) {
            if (cartItems.length === 0) {
                e.preventDefault();
                alert('Your cart is empty. Please add items before proceeding to checkout.');
            }
        });
    }

    // Initialize confirm-remove-btn event listener
    const confirmRemoveBtn = document.getElementById('confirm-remove-btn');
    if (confirmRemoveBtn) {
        confirmRemoveBtn.addEventListener('click', function() {
            const itemId = parseInt(this.getAttribute('data-item-id'));
            if (!isNaN(itemId)) {
                removeFromCart(itemId);
                // Hide modal
                const removeItemModal = bootstrap.Modal.getInstance(document.getElementById('removeItemModal'));
                if (removeItemModal) {
                    removeItemModal.hide();
                }
            }
        });
    }
});

/**
 * Load cart items from localStorage
 */
function loadCartItems() {
    console.log('Loading cart items from localStorage');
    
    // Clear cartItems array
    cartItems = [];
    
    try {
        const storedCart = localStorage.getItem('cartItems');
        console.log('Raw stored cart data:', storedCart);
        
        if (storedCart) {
            try {
                const parsedCart = JSON.parse(storedCart);
                console.log('Parsed cart data:', parsedCart);
                
                if (Array.isArray(parsedCart)) {
                    // Set the global cartItems variable
                    cartItems = parsedCart;
                    console.log('Cart items loaded successfully:', cartItems.length, 'items');
                    
                    // Display cart items if there are any
                    if (cartItems.length > 0) {
                        displayCartItems();
                    } else {
                        showEmptyCartMessage();
                    }
                } else {
                    console.error('Stored cart is not an array:', parsedCart);
                    cartItems = [];
                    localStorage.setItem('cartItems', JSON.stringify([]));
                    showEmptyCartMessage();
                }
            } catch (parseError) {
                console.error('Error parsing cart items:', parseError);
                cartItems = [];
                localStorage.setItem('cartItems', JSON.stringify([]));
                showEmptyCartMessage();
            }
        } else {
            console.log('No cart items found in localStorage');
            cartItems = [];
            showEmptyCartMessage();
        }
    } catch (error) {
        console.error('Error accessing localStorage:', error);
        cartItems = [];
        showEmptyCartMessage();
    }
}

/**
 * Display cart items
 */
function displayCartItems() {
    console.log('Starting displayCartItems function');
    
    // Get DOM elements
    const cartItemsContainer = document.getElementById('cart-items');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const cartContent = document.getElementById('cart-content');
    
    // Log cart items for debugging
    console.log('Cart items to display:', cartItems);
    
    // Check if required elements exist
    if (!cartItemsContainer) {
        console.error('Cart items container not found');
        return;
    }
    
    // Check if cart is empty
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
        console.log('Cart is empty or not an array, showing empty cart message');
        if (emptyCartMessage) emptyCartMessage.classList.remove('d-none');
        if (cartContent) cartContent.classList.add('d-none');
        return;
    }
    
    // We have items in the cart, show cart content and hide empty message
    if (emptyCartMessage) emptyCartMessage.classList.add('d-none');
    if (cartContent) cartContent.classList.remove('d-none');
    
    console.log('Cart has', cartItems.length, 'items, displaying them');
    
    // Clear cart items container
    cartItemsContainer.innerHTML = '';
    
    // Process each cart item
    cartItems.forEach((item, index) => {
        // Skip invalid items
        if (!item || !item.car) {
            console.error('Invalid cart item at index', index, item);
            return;
        }
        
        try {
            // Extract car data with fallbacks
            const car = item.car;
            const carName = car.name || 'Unknown Car';
            const carType = car.type || 'Standard';
            const carImage = car.image || 'images/car-placeholder.jpg';
            const features = Array.isArray(car.features) ? car.features : [];
            const location = car.location || 'unknown';
            
            // Calculate prices
            const days = parseInt(item.days) || 1;
            const carPrice = parseFloat(car.price) || 0;
            const totalPrice = parseFloat(item.totalPrice) || (carPrice * days);
            
            // Format dates
            let pickupDate = 'N/A';
            let returnDate = 'N/A';
            
            try {
                if (item.pickupDate) pickupDate = formatDate(item.pickupDate);
                if (item.returnDate) returnDate = formatDate(item.returnDate);
            } catch (e) {
                console.error('Error formatting dates:', e);
            }
            
            // Create HTML for this cart item
            const cartItemHTML = document.createElement('tr');
            cartItemHTML.innerHTML = `
                <td>
                    <div class="d-flex align-items-center">
                        <img src="${carImage}" alt="${carName}" class="img-thumbnail me-3" style="width: 80px; height: 60px; object-fit: cover;" onerror="this.src='images/car-placeholder.jpg'">
                        <div>
                            <h6 class="mb-0">${carName}</h6>
                            <small class="text-muted">${carType}</small>
                        </div>
                    </div>
                </td>
                <td>
                    <div><i class="fas fa-car me-2"></i>${features.slice(0, 2).join(', ') || 'Standard features'}</div>
                    <div><i class="fas fa-map-marker-alt me-2"></i>${capitalizeFirstLetter(location.replace('-', ' '))}</div>
                </td>
                <td>
                    <div><i class="fas fa-calendar-alt me-2"></i>${pickupDate}</div>
                    <div><i class="fas fa-calendar-alt me-2"></i>${returnDate}</div>
                    <div><i class="fas fa-clock me-2"></i>${days} day${days > 1 ? 's' : ''}</div>
                </td>
                <td>
                    <div class="fw-bold">$${totalPrice.toFixed(2)}</div>
                    <small class="text-muted">$${carPrice.toFixed(2)} x ${days} days</small>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-danger" onclick="confirmRemoveItem(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            // Add this item to the container
            cartItemsContainer.appendChild(cartItemHTML);
            console.log('Added cart item:', carName);
            
        } catch (error) {
            console.error('Error rendering cart item:', error, item);
        }
    });
    
    console.log('Cart items displayed successfully');
    
    // Update order summary
    updateOrderSummary();
}

/**
 * Show empty cart message
 */
function showEmptyCartMessage() {
    console.log('Showing empty cart message');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const cartContent = document.getElementById('cart-content');
    
    if (!emptyCartMessage) {
        console.error('Empty cart message element not found');
    }
    
    if (!cartContent) {
        console.error('Cart content element not found');
    }
    
    if (emptyCartMessage && cartContent) {
        // Make sure the empty cart message is visible
        emptyCartMessage.classList.remove('d-none');
        // Hide the cart content
        cartContent.classList.add('d-none');
        console.log('Empty cart message shown, cart content hidden');
    }
}

/**
 * Update order summary
 */
function updateOrderSummary() {
    console.log('Updating order summary');
    
    // Get the DOM elements
    const subtotalElement = document.getElementById('subtotal');
    const taxesElement = document.getElementById('taxes');
    const discountElement = document.getElementById('discount');
    const totalElement = document.getElementById('total');
    
    if (!subtotalElement || !taxesElement || !discountElement || !totalElement) {
        console.error('Order summary elements not found');
        return;
    }
    
    // Calculate subtotal
    let subtotal = 0;
    
    // Process each cart item
    cartItems.forEach((item, index) => {
        try {
            if (item && item.totalPrice) {
                // Try to use the stored totalPrice first
                const itemPrice = parseFloat(item.totalPrice);
                if (!isNaN(itemPrice)) {
                    subtotal += itemPrice;
                    console.log(`Item ${index} price: $${itemPrice.toFixed(2)}`);
                } else {
                    // If totalPrice is invalid, calculate from car price and days
                    if (item.car && item.car.price && item.days) {
                        const carPrice = parseFloat(item.car.price);
                        const days = parseInt(item.days);
                        if (!isNaN(carPrice) && !isNaN(days)) {
                            const calculatedPrice = carPrice * days;
                            subtotal += calculatedPrice;
                            console.log(`Item ${index} calculated price: $${calculatedPrice.toFixed(2)}`);
                        }
                    } else {
                        console.error('Cannot calculate price for item', index, '- missing data');
                    }
                }
            } else {
                console.error('Invalid item or missing totalPrice at index', index);
            }
        } catch (error) {
            console.error('Error processing item for subtotal:', error, item);
        }
    });
    
    console.log('Calculated subtotal:', subtotal);
    
    // Calculate taxes (10% of subtotal)
    const taxes = subtotal * 0.1;
    
    // Get discount from sessionStorage
    let discount = 0;
    try {
        discount = parseFloat(sessionStorage.getItem('cartDiscount') || 0);
        if (isNaN(discount)) discount = 0;
    } catch (e) {
        console.error('Error parsing discount:', e);
        discount = 0;
    }
    
    // Calculate total
    const total = subtotal + taxes - discount;
    
    // Update elements if they exist
    subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    taxesElement.textContent = `$${taxes.toFixed(2)}`;
    discountElement.textContent = `-$${discount.toFixed(2)}`;
    totalElement.textContent = `$${total.toFixed(2)}`;
    
    // Store the values in sessionStorage for checkout
    sessionStorage.setItem('cartSubtotal', subtotal);
    sessionStorage.setItem('cartTaxes', taxes);
    sessionStorage.setItem('cartDiscount', discount);
    sessionStorage.setItem('cartTotal', total);
    
    console.log('Order summary updated:', { subtotal, taxes, discount, total });
    
    // Update the cart count in the navbar
    updateCartCount();
}

/**
 * Handle promo code form submission
 * @param {Event} e - Form submit event
 */
function handlePromoCode(e) {
    e.preventDefault();
    
    // Get promo code
    const promoCodeInput = document.getElementById('promo-code');
    if (!promoCodeInput) {
        console.error('Promo code input not found');
        return;
    }
    
    const promoCode = promoCodeInput.value.trim().toUpperCase();
    
    // Check if promo code is valid
    if (promoCode === 'DISCOUNT20') {
        // Calculate discount (20% of subtotal)
        const subtotal = cartItems.reduce((total, item) => {
            const itemPrice = parseFloat(item.totalPrice) || 0;
            return total + itemPrice;
        }, 0);
        
        const discount = subtotal * 0.2;
        
        // Save discount to sessionStorage
        sessionStorage.setItem('cartDiscount', discount);
        
        // Update order summary
        updateOrderSummary();
        
        // Show success message
        showToast('Promo Code Applied', 'You got 20% off your order!', 'success');
    } else {
        // Show error message
        showToast('Invalid Promo Code', 'The promo code you entered is invalid.', 'danger');
    }
}

/**
 * Confirm remove item from cart
 * @param {number} id - Cart item ID to remove
 */
function confirmRemoveItem(id) {
    console.log('Confirming removal of item with ID:', id);
    
    // Find item by ID
    const item = cartItems.find(item => item.id === id);
    
    if (item) {
        // Set item ID on confirm button
        const confirmRemoveBtn = document.getElementById('confirm-remove-btn');
        if (confirmRemoveBtn) {
            confirmRemoveBtn.setAttribute('data-item-id', id);
            
            // Show modal
            const removeItemModal = document.getElementById('removeItemModal');
            if (removeItemModal) {
                const bsModal = new bootstrap.Modal(removeItemModal);
                bsModal.show();
            } else {
                console.error('Remove item modal not found');
                // If modal not found, remove directly
                removeFromCart(id);
            }
        } else {
            console.error('Confirm remove button not found');
            // If button not found, remove directly
            removeFromCart(id);
        }
    } else {
        console.error('Item with ID', id, 'not found in cart');
    }
}

/**
 * Remove item from cart
 * @param {number} id - Cart item ID to remove
 */
function removeFromCart(id) {
    console.log('Removing item with ID:', id);
    
    // Find index of item with the given ID
    const index = cartItems.findIndex(item => item.id === id);
    
    if (index !== -1) {
        // Get item name for toast message
        const itemName = cartItems[index].car ? cartItems[index].car.name : 'Item';
        
        // Remove item from array
        cartItems.splice(index, 1);
        
        // Save to localStorage
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
        
        // Update cart count in navbar
        updateCartCount();
        
        // Update cart display
        if (cartItems.length === 0) {
            showEmptyCartMessage();
        } else {
            displayCartItems();
        }
        
        // Show success message
        showToast('Item Removed', `${itemName} has been removed from your cart.`, 'success');
    } else {
        console.error('Item with ID', id, 'not found in cart');
    }
}

/**
 * Update cart count in the navbar
 */
function updateCartCount() {
    console.log('Updating cart count');
    
    // Get the latest cart items from localStorage
    let count = 0;
    try {
        const storedCart = localStorage.getItem('cartItems');
        if (storedCart) {
            const parsedCart = JSON.parse(storedCart);
            if (Array.isArray(parsedCart)) {
                count = parsedCart.length;
                console.log('Cart count from localStorage:', count);
            }
        }
    } catch (error) {
        console.error('Error getting cart count:', error);
    }
    
    // Update all cart count elements in the navbar
    const cartCountElements = document.querySelectorAll('#cart-count');
    cartCountElements.forEach(element => {
        element.textContent = count;
        console.log('Updated cart count element to:', count);
    });
}

/**
 * Load recommended cars
 */
function loadRecommendedCars() {
    const recommendedCarsContainer = document.getElementById('recommended-cars');
    
    if (recommendedCarsContainer) {
        // Simulate API call to get recommended cars
        setTimeout(() => {
            // Sample recommended cars data
            recommendedCars = [
                {
                    id: 5,
                    name: 'Nissan Altima',
                    type: 'Midsize',
                    price: 58,
                    image: 'images/car5.jpg',
                    features: ['Automatic', '5 Seats', 'Air Conditioning', 'Bluetooth'],
                    available: true
                },
                {
                    id: 6,
                    name: 'Toyota RAV4',
                    type: 'SUV',
                    price: 75,
                    image: 'images/car6.jpg',
                    features: ['Automatic', '5 Seats', 'Air Conditioning', 'Bluetooth', 'GPS'],
                    available: true
                },
                {
                    id: 7,
                    name: 'BMW 3 Series',
                    type: 'Luxury',
                    price: 110,
                    image: 'images/car7.jpg',
                    features: ['Automatic', '5 Seats', 'Air Conditioning', 'Bluetooth', 'GPS', 'Leather Seats'],
                    available: true
                }
            ];
            
            // Create HTML for each recommended car
            let recommendedCarsHTML = '';
            
            recommendedCars.forEach(car => {
                recommendedCarsHTML += `
                    <div class="col-md-4 mb-4">
                        <div class="card car-card h-100">
                            <img src="${car.image}" class="card-img-top" alt="${car.name}" onerror="this.src='images/car-placeholder.jpg'">
                            <div class="card-body">
                                <h5 class="card-title">${car.name}</h5>
                                <p class="card-text text-muted">${car.type}</p>
                                <div class="car-features">
                                    ${car.features.slice(0, 3).map(feature => `<span><i class="fas fa-check-circle text-success me-1"></i>${feature}</span>`).join('')}
                                </div>
                                <div class="d-flex justify-content-between align-items-center mt-3">
                                    <div class="car-price">$${car.price}/day</div>
                                </div>
                            </div>
                            <div class="card-footer bg-white border-top-0">
                                <div class="d-grid">
                                    <button class="btn btn-outline-primary" onclick="addRecommendedToCart(${car.id})">
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            // Update container
            recommendedCarsContainer.innerHTML = recommendedCarsHTML;
        }, 1000); // Simulate 1 second loading time
    }
}

/**
 * Add recommended car to cart
 * @param {number} carId - Car ID to add to cart
 */
function addRecommendedToCart(carId) {
    // Find car by ID
    const car = recommendedCars.find(car => car.id === carId);
    
    if (car) {
        // Get dates from first cart item or use default dates
        let pickupDate, returnDate;
        
        if (cartItems.length > 0 && cartItems[0].pickupDate && cartItems[0].returnDate) {
            pickupDate = cartItems[0].pickupDate;
            returnDate = cartItems[0].returnDate;
        } else {
            // Use default dates (today + 1 day for pickup, today + 3 days for return)
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            const returnDay = new Date(today);
            returnDay.setDate(returnDay.getDate() + 3);
            
            pickupDate = tomorrow.toISOString().split('T')[0];
            returnDate = returnDay.toISOString().split('T')[0];
        }
        
        // Calculate number of days
        const pickup = new Date(pickupDate);
        const returnD = new Date(returnDate);
        const diffTime = Math.abs(returnD - pickup);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1; // Ensure at least 1 day
        
        // Create cart item
        const cartItem = {
            id: Date.now(), // Unique ID for the cart item
            car: car,
            pickupDate: pickupDate,
            returnDate: returnDate,
            days: diffDays,
            totalPrice: car.price * diffDays
        };
        
        // Add to cart
        cartItems.push(cartItem);
        
        // Save to localStorage
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
        
        // Update cart count
        updateCartCount();
        
        // Update cart display
        displayCartItems();
        
        // Show success message
        showToast('Success', `${car.name} has been added to your cart.`, 'success');
    }
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
 * Capitalize first letter of each word in a string
 * @param {string} string - String to capitalize
 * @returns {string} Capitalized string
 */
function capitalizeFirstLetter(string) {
    return string.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

/**
 * Show toast notification
 * @param {string} title - Toast title
 * @param {string} message - Toast message
 * @param {string} type - Toast type (success, info, warning, danger)
 */
function showToast(title, message, type = 'info') {
    // Check if toast container exists, if not create it
    let toastContainer = document.querySelector('.toast-container');
    
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toastId = 'toast-' + Date.now();
    const toastHTML = `
        <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header bg-${type} text-white">
                <strong class="me-auto">${title}</strong>
                <small>Just now</small>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>
    `;
    
    // Add toast to container
    toastContainer.innerHTML += toastHTML;
    
    // Initialize and show toast
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, { autohide: true, delay: 5000 });
    toast.show();
    
    // Remove toast from DOM after it's hidden
    toastElement.addEventListener('hidden.bs.toast', function() {
        toastElement.remove();
    });
}
