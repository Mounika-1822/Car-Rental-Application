/**
 * PandaRide Car Rental System - Panda-themed Cars JavaScript
 * Created: April 2025
 */

// Global variables
let allCars = [];
let filteredCars = [];
let currentPage = 1;
const carsPerPage = 12;

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
    const carList = document.getElementById('car-list');
    
    if (carList) {
        // Show loading spinner with panda theme
        carList.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="panda-loading">
                    <img src="images/panda-panda-logo.jpg" class="rounded-circle mb-3" alt="Panda" width="80" height="80">
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
            // Sample cars data with panda-themed names and direct image paths
            allCars = [
                {
                    id: 1,
                    name: 'Panda Cruiser',
                    type: 'Midsize',
                    category: 'Sedan',
                    price: 60,
                    location: 'new-york',
                    image: 'images/product-1.jpg',
                    features: ['Automatic', '5 Seats', 'Bamboo Climate Control', 'Panda Connect'],
                    available: true
                },
                {
                    id: 2,
                    name: 'Bamboo Explorer',
                    type: 'Compact',
                    category: 'Sedan',
                    price: 55,
                    location: 'los-angeles',
                    image: 'images/product-2.jpg',
                    features: ['Automatic', '5 Seats', 'Bamboo Climate Control', 'Panda Connect'],
                    available: true
                },
                {
                    id: 3,
                    name: 'Panda Luxury',
                    type: 'Luxury',
                    category: 'Sports',
                    price: 120,
                    location: 'miami',
                    image: 'images/product-3.jpg',
                    features: ['Automatic', '4 Seats', 'Bamboo Climate Control', 'Panda Connect', 'Bamboo Forest Navigator'],
                    available: true
                },
                {
                    id: 4,
                    name: 'Bamboo Voyager',
                    type: 'SUV',
                    category: 'SUV',
                    price: 95,
                    location: 'chicago',
                    image: 'images/product-4.jpg',
                    features: ['Automatic', '7 Bamboo Seats', 'Bamboo Climate Control', 'Panda Connect', 'Bamboo Forest Navigator'],
                    available: true
                },
                {
                    id: 5,
                    name: 'Panda Comfort',
                    type: 'Midsize',
                    category: 'Sedan',
                    price: 58,
                    location: 'san-francisco',
                    image: 'images/product-5.jpg',
                    features: ['Automatic', '5 Bamboo Seats', 'Bamboo Climate Control', 'Panda Connect'],
                    available: true
                },
                {
                    id: 6,
                    name: 'Bamboo Adventurer',
                    type: 'SUV',
                    category: 'SUV',
                    price: 75,
                    location: 'dallas',
                    image: 'images/product-6.jpg',
                    features: ['Automatic', '5 Bamboo Seats', 'Bamboo Climate Control', 'Panda Connect', 'Bamboo Forest Navigator'],
                    available: true
                },
                {
                    id: 7,
                    name: 'Panda Elegance',
                    type: 'Luxury',
                    category: 'Sedan',
                    price: 110,
                    location: 'seattle',
                    image: 'images/product-7.jpg',
                    features: ['Automatic', '5 Bamboo Seats', 'Bamboo Climate Control', 'Panda Connect', 'Bamboo Forest Navigator', 'Bamboo Sound System'],
                    available: true
                },
                {
                    id: 8,
                    name: 'Bamboo Family',
                    type: 'Minivan',
                    category: 'Van',
                    price: 85,
                    location: 'new-york',
                    image: 'images/product-8.jpg',
                    features: ['Automatic', '7 Bamboo Seats', 'Bamboo Climate Control', 'Panda Connect', 'Bamboo Forest Navigator', 'Bamboo Entertainment'],
                    available: true
                },
                {
                    id: 9,
                    name: 'Panda Economy',
                    type: 'Economy',
                    category: 'Compact',
                    price: 45,
                    location: 'new-york',
                    image: 'images/product-9.jpg',
                    features: ['Manual', '4 Seats', 'Bamboo Climate Control'],
                    available: true
                },
                {
                    id: 10,
                    name: 'Bamboo Hybrid',
                    type: 'Midsize',
                    category: 'Hybrid',
                    price: 75,
                    location: 'san-francisco',
                    image: 'images/product-10.jpg',
                    features: ['Automatic', '5 Seats', 'Eco-Friendly', 'Bamboo Climate Control', 'Panda Connect'],
                    available: true
                },
                {
                    id: 11,
                    name: 'Panda Convertible',
                    type: 'Convertible',
                    category: 'Sports',
                    price: 130,
                    location: 'miami',
                    image: 'images/product-3.jpg',
                    features: ['Automatic', '4 Bamboo Seats', 'Bamboo Climate Control', 'Panda Connect', 'Bamboo Forest Navigator', 'Bamboo Sound System'],
                    available: true
                },
                {
                    id: 11,
                    name: 'Panda Hybrid',
                    type: 'Hybrid',
                    category: 'Sedan',
                    price: 70,
                    location: 'chicago',
                    image: 'images/product-6.jpg',
                    features: ['Automatic', '5 Bamboo Seats', 'Bamboo Climate Control', 'Panda Connect', 'Eco-Bamboo Mode'],
                    available: true
                },
                {
                    id: 12,
                    name: 'Bamboo Electric',
                    type: 'Electric',
                    category: 'Sedan',
                    price: 80,
                    location: 'san-francisco',
                    image: 'images/product-7.jpg',
                    features: ['Automatic', '5 Bamboo Seats', 'Bamboo Climate Control', 'Panda Connect', 'Bamboo Forest Navigator', 'Zero Emissions'],
                    available: true
                },
                {
                    id: 13,
                    name: 'Panda Offroad',
                    type: 'SUV',
                    category: 'Offroad',
                    price: 115,
                    location: 'denver',
                    image: 'images/product-4.jpg',
                    features: ['Automatic', '5 Seats', '4x4 Drive', 'All-Terrain Tires', 'Bamboo Climate Control', 'Panda Connect', 'Adventure Pack'],
                    available: true
                },
                {
                    id: 14,
                    name: 'Bamboo Sport',
                    type: 'Luxury',
                    category: 'Sports',
                    price: 145,
                    location: 'los-angeles',
                    image: 'images/product-5.jpg',
                    features: ['Automatic', '2 Seats', 'Sport Mode', 'Premium Sound System', 'Bamboo Climate Control', 'Panda Connect', 'Performance Package'],
                    available: true
                },
                {
                    id: 15,
                    name: 'Panda Compact',
                    type: 'Economy',
                    category: 'Compact',
                    price: 40,
                    location: 'seattle',
                    image: 'images/product-1.jpg',
                    features: ['Manual', '4 Seats', 'Fuel Efficient', 'Bamboo Climate Control', 'Panda Connect Basic'],
                    available: true
                },
                {
                    id: 16,
                    name: 'Bamboo Premium SUV',
                    type: 'SUV',
                    category: 'Luxury SUV',
                    price: 135,
                    location: 'new-york',
                    image: 'images/product-2.jpg',
                    features: ['Automatic', '7 Seats', 'Panoramic Roof', 'Premium Bamboo Interior', 'Bamboo Climate Control', 'Panda Connect Premium', 'Bamboo Forest Navigator'],
                    available: true
                },
                {
                    id: 17,
                    name: 'Panda Hybrid Plus',
                    type: 'Hybrid',
                    category: 'Sedan',
                    price: 90,
                    location: 'san-francisco',
                    image: 'images/product-7.jpg',
                    features: ['Automatic', '5 Seats', 'Eco-Friendly', 'Hybrid Engine', 'Bamboo Climate Control', 'Panda Connect Plus', 'Fast Charging'],
                    available: true
                },
                {
                    id: 18,
                    name: 'Bamboo Convertible',
                    type: 'Luxury',
                    category: 'Convertible',
                    price: 130,
                    location: 'miami',
                    image: 'images/product-8.jpg',
                    features: ['Automatic', '4 Seats', 'Retractable Roof', 'Premium Sound System', 'Bamboo Climate Control', 'Panda Connect Premium'],
                    available: true
                },
                {
                    id: 19,
                    name: 'Panda Pickup',
                    type: 'Truck',
                    category: 'Pickup',
                    price: 110,
                    location: 'denver',
                    image: 'images/product-9.jpg',
                    features: ['Automatic', '5 Seats', 'Extended Cab', 'Towing Package', 'Bamboo Climate Control', 'Panda Connect', 'All-Terrain Capability'],
                    available: true
                },
                {
                    id: 20,
                    name: 'Bamboo Microcar',
                    type: 'Economy',
                    category: 'Microcar',
                    price: 35,
                    location: 'new-york',
                    image: 'images/product-10.jpg',
                    features: ['Automatic', '2 Seats', 'Ultra Compact', 'City Friendly', 'Bamboo Basic Connect', 'Fuel Efficient'],
                    available: true
                }
            ];
            
            // Apply filters
            filterCars(location, carType);
            
            // Sort cars (default: price low to high)
            sortCars('price-low');
        }, 1500); // Simulate 1.5 second loading time for dramatic effect
    }
}

/**
 * Filter cars based on criteria
 * @param {string} location - Location filter
 * @param {string} carType - Car type filter
 */
function filterCars(location, carType) {
    // Start with all cars
    filteredCars = [...allCars];
    
    // Apply location filter if specified
    if (location && location !== 'all') {
        filteredCars = filteredCars.filter(car => car.location === location);
    }
    
    // Apply car type filter if specified
    if (carType && carType !== 'all') {
        filteredCars = filteredCars.filter(car => car.type.toLowerCase() === carType.toLowerCase());
    }
    
    // Apply price range filter if specified
    const priceRange = document.getElementById('price-range');
    if (priceRange) {
        const maxPrice = parseInt(priceRange.value);
        filteredCars = filteredCars.filter(car => car.price <= maxPrice);
    }
    
    // Reset to page 1 when filters change
    currentPage = 1;
    
    // Display filtered cars
    displayCars();
}

/**
 * Handle filter form submission
 * @param {Event} e - Form submit event
 */
function handleFilterSubmit(e) {
    e.preventDefault();
    
    // Get filter values
    const locationSelect = document.getElementById('location-filter');
    const carTypeSelect = document.getElementById('car-type-filter');
    
    const location = locationSelect ? locationSelect.value : 'all';
    const carType = carTypeSelect ? carTypeSelect.value : 'all';
    
    // Store in session storage
    sessionStorage.setItem('searchLocation', location);
    sessionStorage.setItem('searchCarType', carType);
    
    // Apply filters
    filterCars(location, carType);
}

/**
 * Sort cars by the given criteria
 * @param {string} sortBy - Sort criteria
 */
function sortCars(sortBy) {
    switch (sortBy) {
        case 'price-low':
            filteredCars.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filteredCars.sort((a, b) => b.price - a.price);
            break;
        case 'name-asc':
            filteredCars.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            filteredCars.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case 'panda-picks':
            // Sort by a combination of factors (price, features, etc.)
            filteredCars.sort((a, b) => {
                // Calculate a score based on features and price
                const aScore = a.features.length * 2 - a.price / 20;
                const bScore = b.features.length * 2 - b.price / 20;
                return bScore - aScore; // Higher score first
            });
            break;
        default:
            filteredCars.sort((a, b) => a.price - b.price);
    }
    
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
        
        const carCard = document.createElement('div');
        carCard.className = 'col-md-6 col-lg-4 mb-4';
        carCard.innerHTML = `
            <div class="card h-100 shadow-sm car-card panda-card">
                <div class="position-absolute top-0 end-0 m-2">
                    <span class="badge bg-panda p-2"><i class="fas fa-paw me-1"></i> Panda Approved</span>
                </div>
                <img src="${car.image}" class="card-img-top p-2" alt="${car.name}" onerror="this.src='https://images.pexels.com/photos/3608263/pexels-photo-3608263.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1'">
                <div class="card-body">
                    <h5 class="card-title">${car.name}</h5>
                    <p class="card-text text-muted">${car.type} - ${car.category}</p>
                    <div class="car-features mb-3">
                        ${car.features.slice(0, 3).map(feature => `<span><i class="fas fa-paw text-success me-1"></i>${feature}</span>`).join('')}
                        ${car.features.length > 3 ? `<span class="more-features">+${car.features.length - 3} more</span>` : ''}
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="car-price fw-bold">$${car.price}/day</div>
                        <div class="car-availability ${car.available ? 'available' : 'unavailable'}">
                            ${car.available ? '<i class="fas fa-circle me-1 text-success"></i>Available' : '<i class="fas fa-circle me-1 text-danger"></i>Unavailable'}
                        </div>
                    </div>
                </div>
                <div class="card-footer bg-white border-top-0 pt-0">
                    <div class="d-flex gap-2">
                        <button class="btn btn-outline-panda flex-grow-1" onclick="viewCarDetails(${car.id})">
                            <i class="fas fa-paw me-1"></i>Details
                        </button>
                        <button class="btn btn-panda flex-grow-1" onclick="quickAddToCart(${car.id})" ${!car.available ? 'disabled' : ''}>
                            <i class="fas fa-shopping-cart me-1"></i>Book
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        carsContainer.appendChild(carCard);
    }
    
    // Update pagination
    updatePagination(totalPages);
}

/**
 * Update pagination controls
 * @param {number} totalPages - Total number of pages
 */
function updatePagination(totalPages) {
    const paginationContainer = document.getElementById('pagination');
    
    if (!paginationContainer) return;
    
    // Clear container
    paginationContainer.innerHTML = '';
    
    // If only one page, hide pagination
    if (totalPages <= 1) {
        return;
    }
    
    // Previous button
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = `
        <a class="page-link" href="#" aria-label="Previous" onclick="changePage(${currentPage - 1}); return false;">
            <span aria-hidden="true">&laquo;</span>
        </a>
    `;
    paginationContainer.appendChild(prevLi);
    
    // Page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust start page if end page is maxed out
    if (endPage === totalPages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // First page if not visible
    if (startPage > 1) {
        const firstLi = document.createElement('li');
        firstLi.className = 'page-item';
        firstLi.innerHTML = `
            <a class="page-link" href="#" onclick="changePage(1); return false;">1</a>
        `;
        paginationContainer.appendChild(firstLi);
        
        // Ellipsis if needed
        if (startPage > 2) {
            const ellipsisLi = document.createElement('li');
            ellipsisLi.className = 'page-item disabled';
            ellipsisLi.innerHTML = `
                <a class="page-link" href="#">...</a>
            `;
            paginationContainer.appendChild(ellipsisLi);
        }
    }
    
    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
        const pageLi = document.createElement('li');
        pageLi.className = `page-item ${i === currentPage ? 'active' : ''}`;
        pageLi.innerHTML = `
            <a class="page-link" href="#" onclick="changePage(${i}); return false;">${i}</a>
        `;
        paginationContainer.appendChild(pageLi);
    }
    
    // Ellipsis if needed
    if (endPage < totalPages - 1) {
        const ellipsisLi = document.createElement('li');
        ellipsisLi.className = 'page-item disabled';
        ellipsisLi.innerHTML = `
            <a class="page-link" href="#">...</a>
        `;
        paginationContainer.appendChild(ellipsisLi);
    }
    
    // Last page if not visible
    if (endPage < totalPages) {
        const lastLi = document.createElement('li');
        lastLi.className = 'page-item';
        lastLi.innerHTML = `
            <a class="page-link" href="#" onclick="changePage(${totalPages}); return false;">${totalPages}</a>
        `;
        paginationContainer.appendChild(lastLi);
    }
    
    // Next button
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextLi.innerHTML = `
        <a class="page-link" href="#" aria-label="Next" onclick="changePage(${currentPage + 1}); return false;">
            <span aria-hidden="true">&raquo;</span>
        </a>
    `;
    paginationContainer.appendChild(nextLi);
}

/**
 * Change current page
 * @param {number} page - Page number to change to
 */
function changePage(page) {
    // Validate page number
    const totalPages = Math.ceil(filteredCars.length / carsPerPage);
    if (page < 1 || page > totalPages) {
        return;
    }
    
    // Update current page
    currentPage = page;
    
    // Display cars for new page
    displayCars();
    
    // Scroll to top of cars section
    document.querySelector('#car-list').scrollIntoView({ behavior: 'smooth' });
}

/**
 * View car details
 * @param {number} carId - Car ID to view details
 */
function viewCarDetails(carId) {
    const car = allCars.find(car => car.id === carId);
    
    if (!car) return;
    
    // Get modal elements
    const modal = document.getElementById('carDetailModal');
    const modalTitle = modal.querySelector('.modal-title');
    const modalImage = modal.querySelector('.car-detail-image');
    const modalType = modal.querySelector('.car-detail-type');
    const modalPrice = modal.querySelector('.car-detail-price');
    const modalFeatures = modal.querySelector('.car-detail-features');
    const modalAvailability = modal.querySelector('.car-detail-availability');
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    
    // Update modal content
    modalTitle.textContent = car.name;
    modalImage.src = car.image;
    modalImage.alt = car.name;
    modalImage.onerror = function() {
        this.src = 'https://images.pexels.com/photos/3608263/pexels-photo-3608263.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1';
    };
    modalType.textContent = `${car.type} - ${car.category}`;
    modalPrice.textContent = `$${car.price}/day`;
    
    // Update features list
    modalFeatures.innerHTML = '';
    car.features.forEach(feature => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex align-items-center';
        li.innerHTML = `<i class="fas fa-paw text-success me-2"></i>${feature}`;
        modalFeatures.appendChild(li);
    });
    
    // Update availability
    modalAvailability.className = `car-detail-availability ${car.available ? 'available' : 'unavailable'}`;
    modalAvailability.innerHTML = car.available ? 
        '<i class="fas fa-circle me-1 text-success"></i>Available' : 
        '<i class="fas fa-circle me-1 text-danger"></i>Unavailable';
    
    // Update add to cart button
    addToCartBtn.disabled = !car.available;
    addToCartBtn.setAttribute('data-car-id', car.id);
    
    // Show modal
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
}

/**
 * Quick add to cart without showing details modal
 * @param {number} carId - Car ID to add to cart
 */
function quickAddToCart(carId) {
    const car = allCars.find(car => car.id === carId);
    
    if (!car || !car.available) return;
    
    // Get dates from session storage
    const pickupDate = sessionStorage.getItem('searchPickupDate');
    const returnDate = sessionStorage.getItem('searchReturnDate');
    
    // Add to cart
    addToCart(car, pickupDate, returnDate);
}

/**
 * Add car to cart
 * @param {object} car - Car object to add to cart
 * @param {string} pickupDate - Pickup date
 * @param {string} returnDate - Return date
 */
function addToCart(car, pickupDate, returnDate) {
    if (!car || !pickupDate || !returnDate) {
        showToast('Please select pickup and return dates', 'error');
        return;
    }
    
    // Calculate rental duration in days
    const pickup = new Date(pickupDate);
    const returnD = new Date(returnDate);
    const durationMs = returnD.getTime() - pickup.getTime();
    const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
    
    if (durationDays <= 0) {
        showToast('Return date must be after pickup date', 'error');
        return;
    }
    
    // Create cart item
    const cartItem = {
        id: Date.now(), // Unique ID for cart item
        car: {
            id: car.id,
            name: car.name,
            type: car.type,
            category: car.category,
            price: car.price,
            image: car.image
        },
        pickupDate,
        returnDate,
        duration: durationDays,
        totalPrice: car.price * durationDays
    };
    
    // Get existing cart items from localStorage
    let cartItems = [];
    try {
        const storedCart = localStorage.getItem('cartItems');
        if (storedCart) {
            cartItems = JSON.parse(storedCart);
        }
    } catch (error) {
        console.error('Error loading cart items:', error);
        cartItems = [];
    }
    
    // Add new item to cart
    cartItems.push(cartItem);
    
    // Save updated cart to localStorage
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    
    // Update cart count
    updateCartCount();
    
    // Show success message
    showToast(`${car.name} added to cart for ${durationDays} days`, 'success');
}

/**
 * Update cart count in navbar
 */
function updateCartCount() {
    const cartCountElements = document.querySelectorAll('#cart-count');
    
    // Get cart items from localStorage
    let cartItems = [];
    try {
        const storedCart = localStorage.getItem('cartItems');
        if (storedCart) {
            cartItems = JSON.parse(storedCart);
        }
    } catch (error) {
        console.error('Error loading cart items:', error);
        cartItems = [];
    }
    
    // Update cart count in all elements
    cartCountElements.forEach(element => {
        element.textContent = cartItems.length;
        
        // Add animation if count is greater than 0
        if (cartItems.length > 0) {
            element.classList.add('animate__animated', 'animate__heartBeat');
            setTimeout(() => {
                element.classList.remove('animate__animated', 'animate__heartBeat');
            }, 1000);
        }
    });
}

/**
 * Show toast message
 * @param {string} message - Message to show
 * @param {string} type - Toast type (success, error, warning, info)
 */
function showToast(message, type = 'info') {
    // Create toast container if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toastEl = document.createElement('div');
    toastEl.className = `toast align-items-center text-white bg-${type === 'error' ? 'danger' : type} border-0`;
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');
    
    // Add panda theme to toast
    if (type === 'success') {
        toastEl.classList.add('panda-toast-success');
    } else if (type === 'error' || type === 'danger') {
        toastEl.classList.add('panda-toast-error');
    }
    
    // Create toast content
    const toastContent = document.createElement('div');
    toastContent.className = 'd-flex';
    
    // Add panda icon based on toast type
    let icon = 'info-circle';
    if (type === 'success') icon = 'paw';
    if (type === 'error' || type === 'danger') icon = 'exclamation-circle';
    if (type === 'warning') icon = 'exclamation-triangle';
    
    toastContent.innerHTML = `
        <div class="toast-body">
            <i class="fas fa-${icon} me-2"></i>${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    `;
    
    toastEl.appendChild(toastContent);
    toastContainer.appendChild(toastEl);
    
    // Initialize and show toast
    const toast = new bootstrap.Toast(toastEl, {
        animation: true,
        autohide: true,
        delay: 3000
    });
    toast.show();
}

/**
 * Format date to display in a more readable format
 * @param {string} dateString - Date string in format YYYY-MM-DD
 * @returns {string} Formatted date string
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Initialize cart count on page load
updateCartCount();
