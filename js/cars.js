/**
 * Car Rental System - Cars JavaScript
 * Created: April 2025
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
    const carsContainer = document.getElementById('cars-container');
    
    if (carsContainer) {
        // Show loading spinner
        carsContainer.innerHTML = `
            <div class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
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
                    image: carImages[1].url,
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
                    image: carImages[5].url,
                    features: ['Automatic', '5 Seats', 'Air Conditioning', 'Bluetooth', 'GPS'],
                    available: true
                },
                {
                    id: 7,
                    name: 'BMW 3 Series',
                    type: 'Luxury',
                    category: 'Sedan',
                    price: 110,
                    location: 'los-angeles',
                    image: carImages[6].url,
                    features: ['Automatic', '5 Seats', 'Air Conditioning', 'Bluetooth', 'GPS', 'Leather Seats'],
                    available: true
                },
                {
                    id: 8,
                    name: 'Hyundai Elantra',
                    type: 'Economy',
                    category: 'Sedan',
                    price: 48,
                    location: 'miami',
                    image: carImages[7].url,
                    features: ['Automatic', '5 Seats', 'Air Conditioning', 'Bluetooth'],
                    available: false
                },
                {
                    id: 9,
                    name: 'Jeep Grand Cherokee',
                    type: 'SUV',
                    category: 'SUV',
                    price: 85,
                    location: 'chicago',
                    image: carImages[8].url,
                    features: ['Automatic', '5 Seats', 'Air Conditioning', 'Bluetooth', 'GPS', '4x4'],
                    available: true
                },
                {
                    id: 10,
                    name: 'Chevrolet Malibu',
                    type: 'Midsize',
                    category: 'Sedan',
                    price: 56,
                    location: 'san-francisco',
                    image: carImages[9].url,
                    features: ['Automatic', '5 Seats', 'Air Conditioning', 'Bluetooth'],
                    available: true
                },
                {
                    id: 11,
                    name: 'Audi A4',
                    type: 'Luxury',
                    category: 'Sedan',
                    price: 115,
                    location: 'new-york',
                    image: carImages[0].url,
                    features: ['Automatic', '5 Seats', 'Air Conditioning', 'Bluetooth', 'GPS', 'Leather Seats'],
                    available: true
                },
                {
                    id: 12,
                    name: 'Honda CR-V',
                    type: 'SUV',
                    category: 'SUV',
                    price: 70,
                    location: 'los-angeles',
                    image: carImages[1].url,
                    features: ['Automatic', '5 Seats', 'Air Conditioning', 'Bluetooth', 'GPS'],
                    available: true
                }
            ];
            
            // Apply initial filters
            filteredCars = allCars.filter(car => {
                // Filter by location
                if (location && car.location !== location) {
                    return false;
                }
                
                // Filter by car type
                if (carType && car.type.toLowerCase() !== carType.toLowerCase()) {
                    return false;
                }
                
                return true;
            });
            
            // Apply initial sort (price: low to high)
            sortCars('price-asc');
            
            // Update filter dropdowns to match session storage values
            const filterLocation = document.getElementById('filter-location');
            const filterCarType = document.getElementById('filter-car-type');
            
            if (filterLocation && location) {
                filterLocation.value = location;
            }
            
            if (filterCarType && carType) {
                filterCarType.value = carType;
            }
        }, 1000); // Simulate 1 second loading time
    }
}

/**
 * Handle filter form submission
 * @param {Event} e - Form submit event
 */
function handleFilterSubmit(e) {
    e.preventDefault();
    
    // Get filter values
    const location = document.getElementById('filter-location').value;
    const carType = document.getElementById('filter-car-type').value;
    const priceRange = document.getElementById('price-range').value;
    
    // Get feature checkboxes
    const featureAC = document.getElementById('feature-ac').checked;
    const featureAuto = document.getElementById('feature-auto').checked;
    const featureGPS = document.getElementById('feature-gps').checked;
    const featureBluetooth = document.getElementById('feature-bluetooth').checked;
    
    // Filter cars
    filteredCars = allCars.filter(car => {
        // Filter by location
        if (location && car.location !== location) {
            return false;
        }
        
        // Filter by car type
        if (carType && car.type.toLowerCase() !== carType.toLowerCase()) {
            return false;
        }
        
        // Filter by price
        if (car.price > parseInt(priceRange)) {
            return false;
        }
        
        // Filter by features
        if (featureAC && !car.features.includes('Air Conditioning')) {
            return false;
        }
        
        if (featureAuto && !car.features.includes('Automatic')) {
            return false;
        }
        
        if (featureGPS && !car.features.includes('GPS')) {
            return false;
        }
        
        if (featureBluetooth && !car.features.includes('Bluetooth')) {
            return false;
        }
        
        return true;
    });
    
    // Reset to first page
    currentPage = 1;
    
    // Apply current sort
    const sortDropdown = document.getElementById('sort-by');
    if (sortDropdown) {
        sortCars(sortDropdown.value);
    } else {
        // Default sort
        sortCars('price-asc');
    }
}

/**
 * Sort cars by the given criteria
 * @param {string} sortBy - Sort criteria
 */
function sortCars(sortBy) {
    switch (sortBy) {
        case 'price-asc':
            filteredCars.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            filteredCars.sort((a, b) => b.price - a.price);
            break;
        case 'name-asc':
            filteredCars.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            filteredCars.sort((a, b) => b.name.localeCompare(a.name));
            break;
    }
    
    // Display sorted and filtered cars
    displayCars();
}

/**
 * Display cars in the container
 */
function displayCars() {
    const carsContainer = document.getElementById('cars-container');
    
    if (carsContainer) {
        // Calculate pagination
        const totalPages = Math.ceil(filteredCars.length / carsPerPage);
        const startIndex = (currentPage - 1) * carsPerPage;
        const endIndex = Math.min(startIndex + carsPerPage, filteredCars.length);
        const currentCars = filteredCars.slice(startIndex, endIndex);
        
        // Clear container
        carsContainer.innerHTML = '';
        
        // Check if no cars found
        if (currentCars.length === 0) {
            carsContainer.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-car fa-3x text-muted mb-3"></i>
                    <h3>No cars found</h3>
                    <p class="lead">Try adjusting your filters to find more cars.</p>
                    <button class="btn btn-outline-primary" onclick="document.getElementById('filter-form').reset()">Reset Filters</button>
                </div>
            `;
            
            // Clear pagination
            document.getElementById('pagination').innerHTML = '';
            
            return;
        }
        
        // Create HTML for each car
        currentCars.forEach(car => {
            const carHTML = `
                <div class="card shadow-sm mb-4">
                    <div class="row g-0">
                        <div class="col-md-4">
                            <img src="${car.image}" class="img-fluid rounded-start h-100 w-100" style="object-fit: cover; max-height: 200px;" alt="${car.name}" onerror="this.src='images/product-1.jpg'" loading="lazy">
                        </div>
                        <div class="col-md-8">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-start">
                                    <div>
                                        <h5 class="card-title">${car.name}</h5>
                                        <p class="card-text text-muted">${car.category} - ${car.type}</p>
                                    </div>
                                    <div class="car-availability ${car.available ? 'available' : 'unavailable'}">
                                        ${car.available ? '<i class="fas fa-circle me-1"></i>Available' : '<i class="fas fa-circle me-1"></i>Unavailable'}
                                    </div>
                                </div>
                                
                                <div class="car-features my-3">
                                    ${car.features.map(feature => `<span><i class="fas fa-check-circle text-success me-1"></i>${feature}</span>`).join('')}
                                </div>
                                
                                <div class="row align-items-center mt-3">
                                    <div class="col-md-6">
                                        <div class="car-price mb-2 mb-md-0">$${car.price}/day</div>
                                    </div>
                                    <div class="col-md-6 text-md-end">
                                        <button class="btn btn-outline-primary me-2" onclick="viewCarDetails(${car.id})">
                                            <i class="fas fa-info-circle me-1"></i>Details
                                        </button>
                                        <button class="btn btn-primary" onclick="quickAddToCart(${car.id})" ${!car.available ? 'disabled' : ''}>
                                            <i class="fas fa-cart-plus me-1"></i>Book Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            carsContainer.innerHTML += carHTML;
        });
        
        // Update pagination
        updatePagination(totalPages);
    }
}

/**
 * Update pagination controls
 * @param {number} totalPages - Total number of pages
 */
function updatePagination(totalPages) {
    const paginationContainer = document.getElementById('pagination');
    
    if (paginationContainer) {
        // Clear container
        paginationContainer.innerHTML = '';
        
        // Don't show pagination if only one page
        if (totalPages <= 1) {
            return;
        }
        
        // Create previous button
        const prevDisabled = currentPage === 1 ? 'disabled' : '';
        const prevHTML = `
            <li class="page-item ${prevDisabled}">
                <a class="page-link" href="#" onclick="changePage(${currentPage - 1}); return false;" tabindex="-1" aria-disabled="${prevDisabled ? 'true' : 'false'}">Previous</a>
            </li>
        `;
        
        // Create next button
        const nextDisabled = currentPage === totalPages ? 'disabled' : '';
        const nextHTML = `
            <li class="page-item ${nextDisabled}">
                <a class="page-link" href="#" onclick="changePage(${currentPage + 1}); return false;">Next</a>
            </li>
        `;
        
        // Create page buttons
        let pageButtonsHTML = '';
        
        // Determine range of pages to show
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);
        
        // Adjust startPage if endPage is at max
        if (endPage === totalPages) {
            startPage = Math.max(1, endPage - 4);
        }
        
        // Create page buttons
        for (let i = startPage; i <= endPage; i++) {
            const activeClass = i === currentPage ? 'active' : '';
            pageButtonsHTML += `
                <li class="page-item ${activeClass}">
                    <a class="page-link" href="#" onclick="changePage(${i}); return false;">${i}</a>
                </li>
            `;
        }
        
        // Combine all HTML
        paginationContainer.innerHTML = prevHTML + pageButtonsHTML + nextHTML;
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
 * Format date to display in a more readable format
 * @param {string} dateString - Date string in format YYYY-MM-DD
 * @returns {string} Formatted date string
 */
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}
