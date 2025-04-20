/**
 * DriveEasy - Premium Car Rental Service
 * Main JavaScript
 * Created: April 2025
 * Updated: April 2025
 */

// Global variables and state management
class AppState {
    constructor() {
        this.carsData = [];
        this.cartItems = [];
        this.user = null;
        this.isLoading = false;
        this.initialized = false;
    }

    // Initialize the application state
    init() {
        if (this.initialized) return;
        this.loadUserData();
        this.loadCartItems();
        this.initialized = true;
    }

    // Load user data from localStorage
    loadUserData() {
        try {
            const userData = localStorage.getItem('userData');
            if (userData) {
                this.user = JSON.parse(userData);
                this.updateUserUI();
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            this.user = null;
        }
    }

    // Update UI based on user login status
    updateUserUI() {
        const loginMenuItem = document.getElementById('login-menu-item');
        const userMenuItem = document.getElementById('user-menu-item');
        const usernameDisplay = document.getElementById('username-display');

        if (this.user) {
            // User is logged in
            if (loginMenuItem) loginMenuItem.classList.add('d-none');
            if (userMenuItem) {
                userMenuItem.classList.remove('d-none');
                if (usernameDisplay) {
                    usernameDisplay.textContent = this.user.firstName || 'User';
                }
            }
        } else {
            // User is not logged in
            if (loginMenuItem) loginMenuItem.classList.remove('d-none');
            if (userMenuItem) userMenuItem.classList.add('d-none');
        }
    }

    // Load cart items from localStorage
    loadCartItems() {
        try {
            const storedCart = localStorage.getItem('cartItems');
            if (storedCart) {
                const parsedCart = JSON.parse(storedCart);
                if (Array.isArray(parsedCart)) {
                    // Validate cart items
                    this.cartItems = parsedCart.filter(item => {
                        return item && item.car && item.car.id && item.car.name;
                    });
                    
                    // If items were filtered out, update localStorage
                    if (this.cartItems.length !== parsedCart.length) {
                        localStorage.setItem('cartItems', JSON.stringify(this.cartItems));
                    }
                } else {
                    this.cartItems = [];
                    localStorage.setItem('cartItems', JSON.stringify([]));
                }
            } else {
                this.cartItems = [];
            }
        } catch (error) {
            console.error('Error loading cart items:', error);
            this.cartItems = [];
            localStorage.setItem('cartItems', JSON.stringify([]));
        }
        
        this.updateCartCount();
    }

    // Update cart count in the UI
    updateCartCount() {
        const cartCountElements = document.querySelectorAll('#cart-count');
        const count = this.cartItems.length;
        
        cartCountElements.forEach(element => {
            element.textContent = count;
        });
    }
}

// Initialize app state
const appState = new AppState();

// Document ready function
document.addEventListener('DOMContentLoaded', function() {
    // Initialize app state
    appState.init();
    
    // Initialize Bootstrap components
    initBootstrapComponents();
    
    // Set minimum date for date inputs to today
    setMinimumDates();
    
    // Initialize event listeners
    initEventListeners();
    
    // Load page-specific content
    loadPageContent();
});

/**
 * Initialize Bootstrap components
 */
function initBootstrapComponents() {
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Initialize popovers
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
}

/**
 * Set minimum dates for date inputs
 */
function setMinimumDates() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayStr = today.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    const pickupDateInputs = document.querySelectorAll('#pickup-date');
    const returnDateInputs = document.querySelectorAll('#return-date');
    
    pickupDateInputs.forEach(input => {
        input.setAttribute('min', todayStr);
        input.addEventListener('change', function() {
            // When pickup date changes, ensure return date is at least the next day
            const selectedDate = new Date(this.value);
            const nextDay = new Date(selectedDate);
            nextDay.setDate(nextDay.getDate() + 1);
            
            const nextDayStr = nextDay.toISOString().split('T')[0];
            const returnDateInput = this.closest('form').querySelector('#return-date');
            if (returnDateInput) {
                returnDateInput.setAttribute('min', nextDayStr);
                
                // If return date is now invalid, update it
                if (returnDateInput.value && new Date(returnDateInput.value) <= selectedDate) {
                    returnDateInput.value = nextDayStr;
                }
            }
        });
    });
    
    returnDateInputs.forEach(input => {
        input.setAttribute('min', tomorrowStr);
    });
}

/**
 * Initialize event listeners
 */
function initEventListeners() {
    // Search form submission
    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', handleSearchFormSubmit);
    }
    
    // Newsletter form submission
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterSubmit);
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

/**
 * Handle search form submission
 * @param {Event} e - Form submit event
 */
function handleSearchFormSubmit(e) {
    e.preventDefault();
    
    // Show loading indicator
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Searching...';
    submitButton.disabled = true;
    
    // Get form values
    const location = document.getElementById('location').value;
    const pickupDate = document.getElementById('pickup-date').value;
    const returnDate = document.getElementById('return-date').value;
    const carType = document.getElementById('car-type').value;
    
    // Validate inputs
    if (!location || !pickupDate || !returnDate) {
        showToast('Error', 'Please fill in all required fields', 'danger');
        submitButton.innerHTML = originalButtonText;
        submitButton.disabled = false;
        return;
    }
    
    // Store search parameters in sessionStorage
    sessionStorage.setItem('searchLocation', location);
    sessionStorage.setItem('searchPickupDate', pickupDate);
    sessionStorage.setItem('searchReturnDate', returnDate);
    sessionStorage.setItem('searchCarType', carType);
    
    // Calculate rental duration for display
    const pickup = new Date(pickupDate);
    const returnD = new Date(returnDate);
    const diffTime = Math.abs(returnD - pickup);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    sessionStorage.setItem('rentalDuration', diffDays);
    
    // Redirect to cars page after a short delay to show loading
    setTimeout(() => {
        window.location.href = 'cars.html';
    }, 800);
}

/**
 * Handle newsletter form submission
 * @param {Event} e - Form submit event
 */
function handleNewsletterSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const emailInput = form.querySelector('input[type="email"]');
    const submitButton = form.querySelector('button[type="submit"]');
    
    // Validate email
    if (!emailInput.value || !isValidEmail(emailInput.value)) {
        showToast('Error', 'Please enter a valid email address', 'danger');
        return;
    }
    
    // Show loading state
    const originalButtonText = submitButton.innerHTML;
    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Subscribing...';
    submitButton.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        // Reset form
        form.reset();
        submitButton.innerHTML = originalButtonText;
        submitButton.disabled = false;
        
        // Show success message
        showToast('Success', 'Thank you for subscribing to our newsletter!', 'success');
    }, 1000);
}

/**
 * Handle user logout
 * @param {Event} e - Click event
 */
function handleLogout(e) {
    e.preventDefault();
    
    // Remove user data from localStorage
    localStorage.removeItem('userData');
    
    // Show toast notification
    showToast('Success', 'You have been successfully logged out', 'success');
    
    // Update UI after a short delay
    setTimeout(() => {
        appState.user = null;
        appState.updateUserUI();
    }, 500);
}

/**
 * Load page-specific content
 */
function loadPageContent() {
    // Get the current page from the URL
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Load content based on the current page
    switch (currentPage) {
        case 'index.html':
        case '':
            // Load featured cars on homepage
            if (document.getElementById('featured-cars')) {
                loadFeaturedCars();
            }
            break;
            
        case 'cars.html':
            // Load cars list with filters
            loadCarsWithFilters();
            break;
            
        case 'cart.html':
            // Load cart items
            if (document.getElementById('cart-items')) {
                displayCartItems();
            }
            break;
            
        case 'checkout.html':
            // Initialize checkout process
            initializeCheckout();
            break;
    }
}

/**
 * Add item to cart
 * @param {Object} car - Car object to add to cart
 * @param {string} pickupDate - Pickup date
 * @param {string} returnDate - Return date
 * @returns {boolean} - Whether the operation was successful
 */
function addToCart(car, pickupDate, returnDate) {
    // Show loading toast
    showToast('Processing', 'Adding vehicle to your cart...', 'info');
    
    // Validate inputs
    if (!car || !car.id || !car.name || !car.price) {
        showToast('Error', 'Invalid vehicle data. Please try again.', 'danger');
        return false;
    }
    
    if (!pickupDate || !returnDate) {
        showToast('Error', 'Please select pickup and return dates.', 'danger');
        return false;
    }
    
    // Calculate rental duration
    const pickup = new Date(pickupDate);
    const returnD = new Date(returnDate);
    
    // Validate dates
    if (pickup >= returnD) {
        showToast('Error', 'Return date must be after pickup date.', 'danger');
        return false;
    }
    
    const diffTime = Math.abs(returnD - pickup);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1; // Minimum 1 day
    
    // Calculate price
    const carPrice = parseFloat(car.price) || 0;
    const totalPrice = carPrice * diffDays;
    
    // Create cart item
    const cartItem = {
        id: Date.now(), // Unique ID using timestamp
        car: car,
        pickupDate: pickupDate,
        returnDate: returnDate,
        days: diffDays,
        totalPrice: totalPrice,
        addedOn: new Date().toISOString()
    };
    
    // Add to cart
    try {
        // Get existing cart
        let currentCart = [];
        const storedCart = localStorage.getItem('cartItems');
        if (storedCart) {
            const parsed = JSON.parse(storedCart);
            if (Array.isArray(parsed)) {
                currentCart = parsed;
            }
        }
        
        // Check if the same car is already in the cart for overlapping dates
        const overlappingItem = currentCart.find(item => {
            if (item.car.id !== car.id) return false;
            
            const existingPickup = new Date(item.pickupDate);
            const existingReturn = new Date(item.returnDate);
            
            // Check for date overlap
            return (pickup <= existingReturn && returnD >= existingPickup);
        });
        
        if (overlappingItem) {
            showToast('Warning', 'This vehicle is already in your cart for overlapping dates', 'warning');
            return false;
        }
        
        // Add new item to cart
        currentCart.push(cartItem);
        
        // Save to localStorage
        localStorage.setItem('cartItems', JSON.stringify(currentCart));
        
        // Update app state
        appState.loadCartItems();
        
        // Show success message
        showToast('Success', `${car.name} added to your cart`, 'success');
        
        return true;
    } catch (error) {
        console.error('Error adding to cart:', error);
        showToast('Error', 'Failed to add vehicle to cart. Please try again.', 'danger');
        return false;
    }
}

/**
 * Remove item from cart
 * @param {number} itemId - ID of the item to remove
 * @returns {boolean} - Whether the operation was successful
 */
function removeFromCart(itemId) {
    try {
        // Get current cart
        const storedCart = localStorage.getItem('cartItems');
        if (!storedCart) return false;
        
        const currentCart = JSON.parse(storedCart);
        if (!Array.isArray(currentCart)) return false;
        
        // Find item index
        const itemIndex = currentCart.findIndex(item => item.id === itemId);
        if (itemIndex === -1) return false;
        
        // Get item details for confirmation message
        const removedItem = currentCart[itemIndex];
        
        // Remove item
        currentCart.splice(itemIndex, 1);
        
        // Save updated cart
        localStorage.setItem('cartItems', JSON.stringify(currentCart));
        
        // Update app state
        appState.loadCartItems();
        
        // Show success message
        if (removedItem && removedItem.car) {
            showToast('Success', `${removedItem.car.name} removed from your cart`, 'success');
        } else {
            showToast('Success', 'Item removed from your cart', 'success');
        }
        
        return true;
    } catch (error) {
        console.error('Error removing item from cart:', error);
        showToast('Error', 'Failed to remove item from cart', 'danger');
        return false;
    }
}

/**
 * Load featured cars for the homepage
 */
function loadFeaturedCars() {
    const featuredCarsContainer = document.getElementById('featured-cars');
    if (!featuredCarsContainer) return;
    
    // Show loading state
    featuredCarsContainer.innerHTML = `
        <div class="col-12 text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `;
    
    // Simulate API call to get featured cars
    setTimeout(() => {
        // Sample featured cars data
        const featuredCars = [
            {
                id: 1,
                name: 'Tesla Model 3',
                type: 'Electric',
                price: 89.99,
                image: 'images/product-1.jpg',
                features: ['Autopilot', 'Electric', '350 mi range', 'Supercharging'],
                location: 'San Francisco',
                rating: 4.9,
                reviewCount: 128
            },
            {
                id: 2,
                name: 'BMW X5',
                type: 'SUV',
                price: 119.99,
                image: 'images/product-2.jpg',
                features: ['AWD', 'Leather seats', 'Panoramic roof', 'Navigation'],
                location: 'Los Angeles',
                rating: 4.8,
                reviewCount: 96
            },
            {
                id: 3,
                name: 'Mercedes C-Class',
                type: 'Sedan',
                price: 99.99,
                image: 'images/product-3.jpg',
                features: ['Leather seats', 'MBUX system', 'Premium sound', 'Heated seats'],
                location: 'New York',
                rating: 4.7,
                reviewCount: 112
            },
            {
                id: 4,
                name: 'Porsche 911',
                type: 'Sports',
                price: 249.99,
                image: 'images/product-4.jpg',
                features: ['Twin-turbo', 'PDK transmission', 'Sport Chrono', 'Carbon fiber'],
                location: 'Miami',
                rating: 5.0,
                reviewCount: 64
            },
            {
                id: 5,
                name: 'Audi e-tron GT',
                type: 'Electric',
                price: 159.99,
                image: 'images/product-5.jpg',
                features: ['Electric', 'Quattro AWD', 'Fast charging', 'Virtual cockpit'],
                location: 'Chicago',
                rating: 4.8,
                reviewCount: 87
            },
            {
                id: 6,
                name: 'Range Rover Sport',
                type: 'SUV',
                price: 179.99,
                image: 'images/product-6.jpg',
                features: ['Off-road capability', 'Luxury interior', 'Air suspension', 'Terrain Response'],
                location: 'Denver',
                rating: 4.7,
                reviewCount: 92
            },
            {
                id: 7,
                name: 'Toyota Supra',
                type: 'Sports',
                price: 129.99,
                image: 'images/product-7.jpg',
                features: ['Turbo inline-6', 'Rear-wheel drive', 'Sport suspension', 'Launch control'],
                location: 'Seattle',
                rating: 4.6,
                reviewCount: 78
            },
            {
                id: 8,
                name: 'Lexus ES',
                type: 'Sedan',
                price: 109.99,
                image: 'images/product-8.jpg',
                features: ['Hybrid option', 'Premium audio', 'Safety system+', 'Leather interior'],
                location: 'Boston',
                rating: 4.5,
                reviewCount: 103
            }
        ];
        
        // Store cars data in app state
        appState.carsData = featuredCars;
        
        // Clear loading state
        featuredCarsContainer.innerHTML = '';
        
        // Render featured cars
        featuredCars.forEach(car => {
            const carCard = document.createElement('div');
            carCard.className = 'col-lg-3 col-md-6 mb-4';
            carCard.innerHTML = `
                <div class="card h-100 border-0 shadow-sm hover-card">
                    <div class="position-relative">
                        <img src="${car.image}" class="card-img-top" alt="${car.name}" style="height: 200px; object-fit: cover;" onerror="this.src='images/car-placeholder.jpg'">
                        <span class="badge bg-primary position-absolute top-0 end-0 m-3">${car.type}</span>
                    </div>
                    <div class="card-body p-4">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <h5 class="card-title mb-0">${car.name}</h5>
                            <div class="text-warning">
                                <i class="fas fa-star"></i>
                                <span class="ms-1">${car.rating}</span>
                            </div>
                        </div>
                        <p class="text-muted mb-3"><i class="fas fa-map-marker-alt me-2"></i>${car.location}</p>
                        <div class="car-features mb-3">
                            <div class="d-flex flex-wrap gap-2">
                                ${car.features.slice(0, 3).map(feature => `<span class="badge bg-light text-dark">${feature}</span>`).join('')}
                            </div>
                        </div>
                        <div class="d-flex justify-content-between align-items-center">
                            <div class="price-tag">
                                <span class="fs-5 fw-bold text-primary">$${car.price}</span>
                                <span class="text-muted">/day</span>
                            </div>
                            <button class="btn btn-outline-primary btn-sm view-details-btn" data-car-id="${car.id}">
                                View Details
                            </button>
                        </div>
                    </div>
                </div>
            `;
            featuredCarsContainer.appendChild(carCard);
        });
        
        // Add event listeners to view details buttons
        document.querySelectorAll('.view-details-btn').forEach(button => {
            button.addEventListener('click', function() {
                const carId = parseInt(this.getAttribute('data-car-id'));
                viewCarDetails(carId);
            });
        });
    }, 1000); // Simulate network delay
}

/**
 * View car details
 * @param {number} carId - ID of the car to view
 */
function viewCarDetails(carId) {
    // Find car in app state
    const car = appState.carsData.find(car => car.id === carId);
    if (!car) {
        showToast('Error', 'Vehicle not found', 'danger');
        return;
    }
    
    // Create modal for car details
    const modalHTML = `
    <div class="modal fade" id="carDetailsModal" tabindex="-1" aria-labelledby="carDetailsModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="carDetailsModalLabel">${car.name}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-6">
                            <img src="${car.image}" class="img-fluid rounded" alt="${car.name}" onerror="this.src='images/car-placeholder.jpg'">
                            <div class="d-flex justify-content-between align-items-center mt-3">
                                <div class="text-warning">
                                    <i class="fas fa-star"></i>
                                    <span class="ms-1">${car.rating}</span>
                                    <span class="text-muted">(${car.reviewCount} reviews)</span>
                                </div>
                                <span class="badge bg-primary">${car.type}</span>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <h4 class="mb-3">Vehicle Details</h4>
                            <p class="text-muted"><i class="fas fa-map-marker-alt me-2"></i>${car.location}</p>
                            <p class="fs-5"><span class="fw-bold text-primary">$${car.price}</span> <span class="text-muted">/day</span></p>
                            
                            <h5 class="mt-4">Features</h5>
                            <div class="d-flex flex-wrap gap-2 mb-4">
                                ${car.features.map(feature => `<span class="badge bg-light text-dark">${feature}</span>`).join('')}
                            </div>
                            
                            <h5>Rental Period</h5>
                            <form id="rental-form">
                                <div class="row g-3">
                                    <div class="col-md-6">
                                        <label for="modal-pickup-date" class="form-label">Pickup Date</label>
                                        <input type="date" class="form-control" id="modal-pickup-date" required>
                                    </div>
                                    <div class="col-md-6">
                                        <label for="modal-return-date" class="form-label">Return Date</label>
                                        <input type="date" class="form-control" id="modal-return-date" required>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary" id="add-to-cart-btn">Add to Cart</button>
                </div>
            </div>
        </div>
    </div>
    `;
    
    // Add modal to document body
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer);
    
    // Initialize modal
    const modal = new bootstrap.Modal(document.getElementById('carDetailsModal'));
    modal.show();
    
    // Set minimum dates for date inputs
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayStr = today.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    const pickupDateInput = document.getElementById('modal-pickup-date');
    const returnDateInput = document.getElementById('modal-return-date');
    
    if (pickupDateInput && returnDateInput) {
        pickupDateInput.setAttribute('min', todayStr);
        pickupDateInput.value = todayStr;
        
        returnDateInput.setAttribute('min', tomorrowStr);
        returnDateInput.value = tomorrowStr;
        
        // Update return date min when pickup date changes
        pickupDateInput.addEventListener('change', function() {
            const selectedDate = new Date(this.value);
            const nextDay = new Date(selectedDate);
            nextDay.setDate(nextDay.getDate() + 1);
            
            const nextDayStr = nextDay.toISOString().split('T')[0];
            returnDateInput.setAttribute('min', nextDayStr);
            
            if (new Date(returnDateInput.value) <= selectedDate) {
                returnDateInput.value = nextDayStr;
            }
        });
    }
    
    // Add event listener to Add to Cart button
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function() {
            const pickupDate = document.getElementById('modal-pickup-date').value;
            const returnDate = document.getElementById('modal-return-date').value;
            
            if (!pickupDate || !returnDate) {
                showToast('Error', 'Please select pickup and return dates', 'danger');
                return;
            }
            
            // Add to cart
            if (addToCart(car, pickupDate, returnDate)) {
                // Close modal
                modal.hide();
                
                // Remove modal from DOM when hidden
                document.getElementById('carDetailsModal').addEventListener('hidden.bs.modal', function() {
                    this.remove();
                });
            }
        });
    }
    
    // Remove modal from DOM when hidden
    document.getElementById('carDetailsModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

/**
 * Check if email is valid
 * @param {string} email - Email to validate
 * @returns {boolean} - Whether the email is valid
 */
function isValidEmail(email) {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
}

/**
 * Format date to display in a more readable format
 * @param {string} dateString - Date string in format YYYY-MM-DD
 * @returns {string} - Formatted date string
 */
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

/**
 * Show toast notification
 * @param {string} title - Toast title
 * @param {string} message - Toast message
 * @param {string} type - Toast type (success, info, warning, danger)
 */
function showToast(title, message, type = 'info') {
    // Create toast container if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        toastContainer.style.zIndex = '1080';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toastId = `toast-${Date.now()}`;
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.id = toastId;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    // Create toast content
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                <strong>${title}</strong>: ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    
    // Add toast to container
    toastContainer.appendChild(toast);
    
    // Initialize and show toast
    const bsToast = new bootstrap.Toast(toast, {
        autohide: true,
        delay: 5000
    });
    bsToast.show();
    
    // Remove toast from DOM after it's hidden
    toast.addEventListener('hidden.bs.toast', function() {
        this.remove();
    });
}

/**
 * Load featured cars on homepage
 */
function loadFeaturedCars() {
    const featuredCarsContainer = document.getElementById('featured-cars');
    const loadingMessage = document.getElementById('loading-message');
    
    // Simulate API call to get featured cars
    setTimeout(() => {
        // Sample featured cars data with panda-themed names and images
        const featuredCars = [
            {
                id: 1,
                name: 'Panda Cruiser',
                type: 'Bamboo Sedan',
                price: 60,
                image: 'images/panda-panda-car-2.jpg',
                features: ['Automatic', '5 Seats', 'Bamboo Interior', 'Panda GPS'],
                available: true
            },
            {
                id: 2,
                name: 'Bamboo Explorer',
                type: 'Panda SUV',
                price: 75,
                image: 'images/panda-panda-car-3.jpg',
                features: ['Automatic', '7 Seats', 'Eucalyptus AC', 'Panda Comfort'],
                available: true
            },
            {
                id: 3,
                name: 'Panda Luxury',
                type: 'Premium Sedan',
                price: 120,
                image: 'images/product-1.jpg',
                features: ['Automatic', '4 Seats', 'Bamboo Trim', 'Panda Assist', 'GPS'],
                available: true
            },
            {
                id: 4,
                name: 'Bamboo Voyager',
                type: 'Panda Minivan',
                price: 95,
                image: 'images/product-2.jpg',
                features: ['Automatic', '8 Seats', 'Panda Entertainment', 'Bamboo Roof Rack'],
                available: true
            }
        ];
        
        // Store cars data globally
        window.carsData = featuredCars;
        
        // Hide loading message
        if (loadingMessage) {
            loadingMessage.style.display = 'none';
        }
        
        // Clear any existing content
        featuredCarsContainer.innerHTML = '';
        
        // Create HTML for each featured car
        featuredCars.forEach(car => {
            const carHTML = `
                <div class="col-md-3 mb-4">
                    <div class="card car-card h-100 panda-card">
                        <div class="position-absolute top-0 end-0 m-2">
                            <span class="badge bg-panda p-2"><i class="fas fa-paw me-1"></i> Panda Approved</span>
                        </div>
                        <img src="${car.image}" class="card-img-top p-2" alt="${car.name}" onerror="this.src='https://images.pexels.com/photos/3608263/pexels-photo-3608263.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1'">
                        <div class="card-body">
                            <h5 class="card-title">${car.name}</h5>
                            <p class="card-text text-muted">${car.type}</p>
                            <div class="car-features">
                                ${car.features.map(feature => `<span><i class="fas fa-paw text-success me-1"></i>${feature}</span>`).join('')}
                            </div>
                            <div class="d-flex justify-content-between align-items-center mt-3">
                                <div class="car-price fw-bold">$${car.price}/day</div>
                                <div class="car-availability ${car.available ? 'available' : 'unavailable'}">
                                    ${car.available ? '<i class="fas fa-circle me-1 text-success"></i>Available' : '<i class="fas fa-circle me-1 text-danger"></i>Unavailable'}
                                </div>
                            </div>
                        </div>
                        <div class="card-footer bg-white border-top-0">
                            <div class="d-grid">
                                <button class="btn btn-panda" onclick="viewCarDetails(${car.id})" ${!car.available ? 'disabled' : ''}>
                                    <i class="fas fa-paw me-2"></i>${car.available ? 'Book This Panda Ride' : 'Not Available'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            featuredCarsContainer.innerHTML += carHTML;
        });
    }, 1500); // Simulate 1.5 second loading time for dramatic effect
}

/**
 * View car details
 * @param {number} carId - Car ID to view details
 */
function viewCarDetails(carId) {
    // Find car by ID
    const car = carsData.find(car => car.id === carId);
    
    if (car) {
        // Get pickup and return dates from search form or use default dates
        let pickupDate = sessionStorage.getItem('searchPickupDate');
        let returnDate = sessionStorage.getItem('searchReturnDate');
        
        // If dates not set, use default (today + 1 day for pickup, today + 3 days for return)
        if (!pickupDate || !returnDate) {
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
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // Calculate total price
        const totalPrice = car.price * diffDays;
        
        // Create modal content
        const modalContent = `
            <div class="row">
                <div class="col-md-6 mb-3">
                    <img src="${car.image}" class="img-fluid car-detail-image" alt="${car.name}" onerror="this.src='images/car-placeholder.jpg'">
                </div>
                <div class="col-md-6">
                    <h3>${car.name}</h3>
                    <p class="text-muted">${car.type}</p>
                    
                    <div class="car-detail-features">
                        ${car.features.map(feature => `<span><i class="fas fa-check-circle text-success me-1"></i>${feature}</span>`).join('')}
                    </div>
                    
                    <div class="mb-3">
                        <h5>Rental Details</h5>
                        <div class="d-flex justify-content-between mb-2">
                            <span>Daily Rate:</span>
                            <span>$${car.price}.00</span>
                        </div>
                        <div class="d-flex justify-content-between mb-2">
                            <span>Pickup Date:</span>
                            <span>${formatDate(pickupDate)}</span>
                        </div>
                        <div class="d-flex justify-content-between mb-2">
                            <span>Return Date:</span>
                            <span>${formatDate(returnDate)}</span>
                        </div>
                        <div class="d-flex justify-content-between mb-2">
                            <span>Number of Days:</span>
                            <span>${diffDays}</span>
                        </div>
                        <hr>
                        <div class="d-flex justify-content-between fw-bold">
                            <span>Total Price:</span>
                            <span>$${totalPrice}.00</span>
                        </div>
                    </div>
                    
                    <div class="d-grid">
                        <button class="btn btn-primary" onclick="addToCart(${JSON.stringify(car).replace(/"/g, '&quot;')}, '${pickupDate}', '${returnDate}')">
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Set modal content
        document.getElementById('car-detail-content').innerHTML = modalContent;
        
        // Show modal
        const carDetailModal = new bootstrap.Modal(document.getElementById('carDetailModal'));
        carDetailModal.show();
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
