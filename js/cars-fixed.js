/**
 * Car Rental System - Cars JavaScript
 * Created: April 2025
 * Fixed: April 2025 - Direct image references for better loading
 */

// Global variables
let allCars = [];
let filteredCars = [];
let currentPage = 1;
const carsPerPage = 6;

// Document ready function
document.addEventListener('DOMContentLoaded', function() {
    // Load cars data
    loadCarsData();
    
    // Initialize filter form
    const filterForm = document.getElementById('filter-form');
    if (filterForm) {
        filterForm.addEventListener('submit', handleFilterSubmit);
        
        // Reset filters
        filterForm.addEventListener('reset', function() {
            setTimeout(() => {
                handleFilterSubmit(new Event('submit'));
            }, 10);
        });
    }
    
    // Initialize date range form
    const dateRangeForm = document.getElementById('date-range-form');
    if (dateRangeForm) {
        // Set default dates from session storage or set new ones
        const pickupDateInput = document.getElementById('cars-pickup-date');
        const returnDateInput = document.getElementById('cars-return-date');
        
        if (pickupDateInput && returnDateInput) {
            // Get dates from session storage
            const storedPickupDate = sessionStorage.getItem('searchPickupDate');
            const storedReturnDate = sessionStorage.getItem('searchReturnDate');
            
            if (storedPickupDate && storedReturnDate) {
                pickupDateInput.value = storedPickupDate;
                returnDateInput.value = storedReturnDate;
            } else {
                // Set default dates (today + 1 day for pickup, today + 3 days for return)
                const today = new Date();
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);
                
                const returnDay = new Date(today);
                returnDay.setDate(returnDay.getDate() + 3);
                
                pickupDateInput.value = tomorrow.toISOString().split('T')[0];
                returnDateInput.value = returnDay.toISOString().split('T')[0];
                
                // Store in session storage
                sessionStorage.setItem('searchPickupDate', pickupDateInput.value);
                sessionStorage.setItem('searchReturnDate', returnDateInput.value);
            }
        }
        
        // Handle date range form submission
        dateRangeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Update session storage
            sessionStorage.setItem('searchPickupDate', pickupDateInput.value);
            sessionStorage.setItem('searchReturnDate', returnDateInput.value);
            
            // Reload cars with new date range
            loadCarsData();
        });
    }
    
    // Initialize sort dropdown
    const sortDropdown = document.getElementById('sort-by');
    if (sortDropdown) {
        sortDropdown.addEventListener('change', function() {
            sortCars(this.value);
        });
    }
    
    // Initialize price range slider
    const priceRangeSlider = document.getElementById('price-range');
    if (priceRangeSlider) {
        const priceMinDisplay = document.getElementById('price-min-display');
        const priceMaxDisplay = document.getElementById('price-max-display');
        
        priceRangeSlider.addEventListener('input', function() {
            priceMaxDisplay.textContent = `$${this.value}`;
        });
    }
    
    // Add to cart button in car detail modal
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function() {
            const carId = this.getAttribute('data-car-id');
            const car = allCars.find(car => car.id === parseInt(carId));
            
            if (car) {
                const pickupDate = sessionStorage.getItem('searchPickupDate');
                const returnDate = sessionStorage.getItem('searchReturnDate');
                
                addToCart(car, pickupDate, returnDate);
                
                // Close modal
                const carDetailModal = bootstrap.Modal.getInstance(document.getElementById('carDetailModal'));
                carDetailModal.hide();
            }
        });
    }
});

/**
 * Load cars data
 */
function loadCarsData() {
    const carsContainer = document.getElementById('car-list');
    
    if (carsContainer) {
        // Show loading spinner
        carsContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="panda-loading">
                    <img src="https://images.pexels.com/photos/3608263/pexels-photo-3608263.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1" class="rounded-circle mb-3" alt="Panda" width="80" height="80">
                    <h4 class="mb-3">Loading Your Panda-stic Vehicles!</h4>
                    <p class="text-muted">Our pandas are working hard to find the perfect ride for you...</p>
                    <div class="spinner-border text-primary mt-2" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        `;
        
        // Get filter values from session storage
        const location = sessionStorage.getItem('searchLocation') || '';
        const carType = sessionStorage.getItem('searchCarType') || '';
        
        // Simulate API call to get cars data
        setTimeout(() => {
            // Sample cars data with direct image paths
            allCars = [
                {
                    id: 1,
                    name: 'Toyota Camry',
                    type: 'Midsize',
                    category: 'Sedan',
                    price: 60,
                    location: 'new-york',
                    image: 'images/product-1.jpg',
                    features: ['Automatic', '5 Seats', 'Air Conditioning', 'Bluetooth'],
                    available: true
                },
                {
                    id: 2,
                    name: 'Honda Civic',
                    type: 'Compact',
                    category: 'Sedan',
                    price: 55,
                    location: 'los-angeles',
                    image: 'images/product-2.jpg',
                    features: ['Automatic', '5 Seats', 'Air Conditioning', 'Bluetooth'],
                    available: true
                },
                {
                    id: 3,
                    name: 'Ford Mustang',
                    type: 'Luxury',
                    category: 'Sports',
                    price: 120,
                    location: 'miami',
                    image: 'images/product-3.jpg',
                    features: ['Automatic', '4 Seats', 'Air Conditioning', 'Bluetooth', 'GPS'],
                    available: true
                },
                {
                    id: 4,
                    name: 'Chevrolet Suburban',
                    type: 'SUV',
                    category: 'SUV',
                    price: 95,
                    location: 'chicago',
                    image: 'images/product-4.jpg',
                    features: ['Automatic', '7 Seats', 'Air Conditioning', 'Bluetooth', 'GPS'],
                    available: true
                },
                {
                    id: 5,
                    name: 'Nissan Altima',
                    type: 'Midsize',
                    category: 'Sedan',
                    price: 58,
                    location: 'san-francisco',
                    image: 'images/product-5.jpg',
                    features: ['Automatic', '5 Seats', 'Air Conditioning', 'Bluetooth'],
                    available: true
                },
                {
                    id: 6,
                    name: 'Toyota RAV4',
                    type: 'SUV',
                    category: 'SUV',
                    price: 75,
                    location: 'new-york',
                    image: 'images/product-6.jpg',
                    features: ['Automatic', '5 Seats', 'Air Conditioning', 'Bluetooth', 'GPS'],
                    available: true
                },
                {
                    id: 7,
                    name: 'Jeep Wrangler',
                    type: 'SUV',
                    category: 'Off-road',
                    price: 85,
                    location: 'denver',
                    image: 'images/product-7.jpg',
                    features: ['Manual', '4 Seats', 'Air Conditioning', '4x4', 'Bluetooth'],
                    available: true
                },
                {
                    id: 8,
                    name: 'BMW 3 Series',
                    type: 'Luxury',
                    category: 'Sedan',
                    price: 110,
                    location: 'boston',
                    image: 'images/product-8.jpg',
                    features: ['Automatic', '5 Seats', 'Air Conditioning', 'Leather Seats', 'GPS', 'Bluetooth'],
                    available: true
                },
                {
                    id: 9,
                    name: 'Hyundai Elantra',
                    type: 'Compact',
                    category: 'Sedan',
                    price: 50,
                    location: 'seattle',
                    image: 'images/product-9.jpg',
                    features: ['Automatic', '5 Seats', 'Air Conditioning', 'Bluetooth'],
                    available: true
                },
                {
                    id: 10,
                    name: 'Audi Q5',
                    type: 'Luxury',
                    category: 'SUV',
                    price: 130,
                    location: 'washington-dc',
                    image: 'images/product-10.jpg',
                    features: ['Automatic', '5 Seats', 'Air Conditioning', 'Leather Seats', 'GPS', 'Bluetooth'],
                    available: true
                },
                {
                    id: 11,
                    name: 'Kia Forte',
                    type: 'Compact',
                    category: 'Sedan',
                    price: 48,
                    location: 'chicago',
                    image: 'images/product-1.jpg',
                    features: ['Automatic', '5 Seats', 'Air Conditioning', 'Bluetooth'],
                    available: true
                },
                {
                    id: 12,
                    name: 'Chevrolet Malibu',
                    type: 'Midsize',
                    category: 'Sedan',
                    price: 62,
                    location: 'dallas',
                    image: 'images/product-2.jpg',
                    features: ['Automatic', '5 Seats', 'Air Conditioning', 'Bluetooth'],
                    available: true
                }
            ];
            
            // Apply filters
            filterCars(location, carType);
            
            // Display cars
            displayCars();
        }, 500);
    }
}

/**
 * Filter cars based on criteria
 * @param {string} location - Location filter
 * @param {string} carType - Car type filter
 */
function filterCars(location, carType) {
    // Reset filtered cars
    filteredCars = [...allCars];
    
    // Apply location filter
    if (location) {
        filteredCars = filteredCars.filter(car => car.location === location);
    }
    
    // Apply car type filter
    if (carType) {
        filteredCars = filteredCars.filter(car => car.type.toLowerCase() === carType.toLowerCase());
    }
    
    // Apply price filter
    const priceRange = document.getElementById('price-range');
    if (priceRange) {
        const maxPrice = parseInt(priceRange.value);
        filteredCars = filteredCars.filter(car => car.price <= maxPrice);
    }
    
    // Apply availability filter
    const availabilityFilter = document.getElementById('availability-filter');
    if (availabilityFilter && availabilityFilter.checked) {
        filteredCars = filteredCars.filter(car => car.available);
    }
    
    // Reset current page
    currentPage = 1;
}

/**
 * Handle filter form submission
 * @param {Event} e - Form submit event
 */
function handleFilterSubmit(e) {
    // Prevent default form submission
    if (e) {
        e.preventDefault();
    }
    
    // Get filter values
    const locationFilter = document.getElementById('location-filter');
    const carTypeFilter = document.getElementById('car-type-filter');
    
    const location = locationFilter ? locationFilter.value : '';
    const carType = carTypeFilter ? carTypeFilter.value : '';
    
    // Store filter values in session storage
    sessionStorage.setItem('searchLocation', location);
    sessionStorage.setItem('searchCarType', carType);
    
    // Apply filters
    filterCars(location, carType);
    
    // Display filtered cars
    displayCars();
}

/**
 * Sort cars by the given criteria
 * @param {string} sortBy - Sort criteria
 */
function sortCars(sortBy) {
    if (sortBy === 'price-low') {
        filteredCars.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
        filteredCars.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name-asc') {
        filteredCars.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'name-desc') {
        filteredCars.sort((a, b) => b.name.localeCompare(a.name));
    }
    
    // Reset current page
    currentPage = 1;
    
    // Display sorted cars
    displayCars();
}

/**
 * Display cars in the container
 */
function displayCars() {
    const carsContainer = document.getElementById('car-list');
    
    if (!carsContainer) return;
    
    // Clear container
    carsContainer.innerHTML = '';
    
    // Calculate pagination
    const totalPages = Math.ceil(filteredCars.length / carsPerPage);
    const startIndex = (currentPage - 1) * carsPerPage;
    const endIndex = Math.min(startIndex + carsPerPage, filteredCars.length);
    
    // If no cars found
    if (filteredCars.length === 0) {
        carsContainer.innerHTML = `
            <div class="col-12">
                <div class="alert alert-panda p-4">
                    <div class="d-flex align-items-center">
                        <img src="https://images.pexels.com/photos/1321524/pexels-photo-1321524.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1" class="rounded-circle me-3" alt="Sad Panda" width="60" height="60">
                        <div>
                            <h4 class="alert-heading">No Panda Rides Found!</h4>
                            <p class="mb-0">Our pandas couldn't find any vehicles matching your criteria. Please try different filters.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Hide pagination
        const paginationContainer = document.getElementById('pagination');
        if (paginationContainer) {
            paginationContainer.innerHTML = '';
        }
        
        return;
    }
    
    // Display cars for current page
    for (let i = startIndex; i < endIndex; i++) {
        const car = filteredCars[i];
        
        // Convert regular car names to panda-themed names
        const pandaName = car.name.includes('Panda') ? car.name : `Panda ${car.name}`;
        const pandaType = car.type.includes('Panda') ? car.type : `Panda ${car.type}`;
        
        // Convert regular features to panda-themed features
        const pandaFeatures = car.features.map(feature => {
            if (feature.includes('Air Conditioning')) return 'Bamboo Climate Control';
            if (feature.includes('Bluetooth')) return 'Panda Connect';
            if (feature.includes('GPS')) return 'Bamboo Forest Navigator';
            if (feature.includes('Seats')) return feature.replace('Seats', 'Bamboo Seats');
            return feature;
        });
        
        const carCard = document.createElement('div');
        carCard.className = 'col-md-6 col-lg-4 mb-4';
        carCard.innerHTML = `
            <div class="card h-100 shadow-sm car-card panda-card">
                <div class="position-absolute top-0 end-0 m-2">
                    <span class="badge bg-panda p-2"><i class="fas fa-paw me-1"></i> Panda Approved</span>
 */
function updatePagination(totalPages) {
    const paginationContainer = document.getElementById('pagination');
    
    if (paginationContainer) {
        // Clear container
        paginationContainer.innerHTML = '';
        
        // Check if pagination is needed
        if (totalPages <= 1) {
            return;
        }
        
        // Create pagination HTML
        let paginationHTML = `
            <nav aria-label="Page navigation">
                <ul class="pagination justify-content-center">
                    <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                        <a class="page-link" href="#" onclick="changePage(${currentPage - 1}); return false;" aria-label="Previous">
                            <span aria-hidden="true">&laquo;</span>
                        </a>
                    </li>
        `;
        
        // Add page numbers
        for (let i = 1; i <= totalPages; i++) {
            paginationHTML += `
                <li class="page-item ${i === currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="changePage(${i}); return false;">${i}</a>
                </li>
            `;
        }
        
        paginationHTML += `
                    <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                        <a class="page-link" href="#" onclick="changePage(${currentPage + 1}); return false;" aria-label="Next">
                            <span aria-hidden="true">&raquo;</span>
                        </a>
                    </li>
                </ul>
            </nav>
        `;
        
        paginationContainer.innerHTML = paginationHTML;
    }
}

/**
 * Change current page
 * @param {number} page - Page number to change to
 */
function changePage(page) {
    // Update current page
    currentPage = page;
    
    // Display cars for new page
    displayCars();
    
    // Scroll to top of cars container
    document.getElementById('cars-container').scrollIntoView({ behavior: 'smooth' });
}

/**
 * View car details
 * @param {number} carId - Car ID to view details
 */
function viewCarDetails(carId) {
    // Find car by ID
    const car = allCars.find(car => car.id === carId);
    
    if (car) {
        // Get pickup and return dates
        const pickupDate = document.getElementById('cars-pickup-date').value;
        const returnDate = document.getElementById('cars-return-date').value;
        
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
                    <img src="${car.image}" class="img-fluid car-detail-image" alt="${car.name}" style="max-height: 300px; object-fit: contain;" onerror="this.src='images/product-1.jpg'" loading="lazy">
                </div>
                <div class="col-md-6">
                    <h3>${car.name}</h3>
                    <p class="text-muted">${car.category} - ${car.type}</p>
                    
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
                </div>
            </div>
        `;
        
        // Set modal content
        document.getElementById('car-detail-content').innerHTML = modalContent;
        
        // Set car ID on Add to Cart button
        document.getElementById('add-to-cart-btn').setAttribute('data-car-id', carId);
        
        // Show modal
        const carDetailModal = new bootstrap.Modal(document.getElementById('carDetailModal'));
        carDetailModal.show();
    }
}

/**
 * Quick add to cart without showing details modal
 * @param {number} carId - Car ID to add to cart
 */
function quickAddToCart(carId) {
    // Find car by ID
    const car = allCars.find(car => car.id === carId);
    
    if (car) {
        // Get pickup and return dates
        const pickupDate = document.getElementById('cars-pickup-date').value;
        const returnDate = document.getElementById('cars-return-date').value;
        
        // Add to cart
        addToCart(car, pickupDate, returnDate);
    }
}

/**
 * Add car to cart
 * @param {object} car - Car object to add to cart
 * @param {string} pickupDate - Pickup date
 * @param {string} returnDate - Return date
 */
function addToCart(car, pickupDate, returnDate) {
    // Calculate number of days
    const pickup = new Date(pickupDate);
    const returnD = new Date(returnDate);
    const diffTime = Math.abs(returnD - pickup);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Calculate total price
    const totalPrice = car.price * diffDays;
    
    // Create cart item
    const cartItem = {
        car: car,
        pickupDate: pickupDate,
        returnDate: returnDate,
        days: diffDays,
        totalPrice: totalPrice
    };
    
    // Get existing cart items
    let cartItems = [];
    const storedCart = localStorage.getItem('cartItems');
    
    if (storedCart) {
        try {
            cartItems = JSON.parse(storedCart);
            
            // Make sure cartItems is an array
            if (!Array.isArray(cartItems)) {
                cartItems = [];
            }
        } catch (error) {
            console.error('Error parsing cart items:', error);
            cartItems = [];
        }
    }
    
    // Check if car already in cart
    const existingItemIndex = cartItems.findIndex(item => item.car && item.car.id === car.id);
    
    if (existingItemIndex !== -1) {
        // Update existing item
        cartItems[existingItemIndex] = cartItem;
    } else {
        // Add new item
        cartItems.push(cartItem);
    }
    
    // Save to localStorage
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    
    // Update cart count
    updateCartCount();
    
    // Show success message
    showToast(`${car.name} added to cart`, 'success');
}

/**
 * Update cart count in navbar
 */
function updateCartCount() {
    const cartCountElement = document.getElementById('cart-count');
    
    if (cartCountElement) {
        // Get cart items
        let cartItems = [];
        const storedCart = localStorage.getItem('cartItems');
        
        if (storedCart) {
            try {
                cartItems = JSON.parse(storedCart);
                
                // Make sure cartItems is an array
                if (!Array.isArray(cartItems)) {
                    cartItems = [];
                }
            } catch (error) {
                console.error('Error parsing cart items:', error);
                cartItems = [];
            }
        }
        
        // Update count
        cartCountElement.textContent = cartItems.length;
    }
}

/**
 * Show toast message
 * @param {string} message - Message to show
 * @param {string} type - Toast type (success, error, warning, info)
 */
function showToast(message, type = 'info') {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toast-container');
    
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toastId = 'toast-' + Date.now();
    const toastHTML = `
        <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header bg-${type} text-white">
                <strong class="me-auto">${type.charAt(0).toUpperCase() + type.slice(1)}</strong>
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
    const toast = new bootstrap.Toast(toastElement, { autohide: true, delay: 3000 });
    toast.show();
    
    // Remove toast after it's hidden
    toastElement.addEventListener('hidden.bs.toast', function() {
        this.remove();
    });
}

/**
 * Format date to display in a more readable format
 * @param {string} dateString - Date string in format YYYY-MM-DD
 * @returns {string} Formatted date string
 */
function formatDate(dateString) {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Initialize cart count on page load
updateCartCount();
