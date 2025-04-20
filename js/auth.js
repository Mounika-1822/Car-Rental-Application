/**
 * Car Rental System - Authentication JavaScript
 * Created: April 2025
 */

// Global variables
let currentUser = null;

// Document ready function
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    checkAuthStatus();
    
    // Initialize login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Initialize register form
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegistration);
    }
    
    // Initialize logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Admin logout button
    const adminLogoutBtn = document.getElementById('admin-logout-btn');
    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', handleLogout);
    }
});

/**
 * Check authentication status
 */
function checkAuthStatus() {
    // Get user data from localStorage
    const userData = localStorage.getItem('currentUser');
    
    if (userData) {
        // Parse user data
        currentUser = JSON.parse(userData);
        
        // Update UI for logged in user
        updateAuthUI(true);
    } else {
        // Update UI for logged out user
        updateAuthUI(false);
    }
}

/**
 * Update UI based on authentication status
 * @param {boolean} isLoggedIn - Whether user is logged in
 */
function updateAuthUI(isLoggedIn) {
    const loginMenuItem = document.getElementById('login-menu-item');
    const userMenuItem = document.getElementById('user-menu-item');
    const usernameDisplay = document.getElementById('username-display');
    
    if (loginMenuItem && userMenuItem) {
        if (isLoggedIn) {
            // Hide login menu item
            loginMenuItem.classList.add('d-none');
            
            // Show user menu item
            userMenuItem.classList.remove('d-none');
            
            // Update username display
            if (usernameDisplay) {
                usernameDisplay.textContent = currentUser.firstName;
            }
        } else {
            // Show login menu item
            loginMenuItem.classList.remove('d-none');
            
            // Hide user menu item
            userMenuItem.classList.add('d-none');
        }
    }
}

/**
 * Handle login form submission
 * @param {Event} e - Form submit event
 */
function handleLogin(e) {
    e.preventDefault();
    
    // Get form data
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // Simulate API call to authenticate user
    setTimeout(() => {
        // For demo purposes, accept any email/password combination
        // In a real application, this would validate against a backend API
        
        // Create user object
        const user = {
            id: 1,
            email: email,
            firstName: email.split('@')[0], // Use part of email as first name for demo
            lastName: 'User',
            role: 'user'
        };
        
        // Check if email contains 'admin' to simulate admin login
        if (email.includes('admin')) {
            user.role = 'admin';
        }
        
        // Save user data to localStorage
        localStorage.setItem('currentUser', JSON.stringify(user));
        currentUser = user;
        
        // Update UI
        updateAuthUI(true);
        
        // Show success message
        showToast('Login Successful', 'You have been successfully logged in.', 'success');
        
        // Redirect based on role
        if (user.role === 'admin') {
            // Redirect to admin dashboard
            window.location.href = 'admin/index.html';
        } else {
            // Redirect to homepage or previous page
            const referrer = document.referrer;
            if (referrer && referrer.includes(window.location.hostname) && !referrer.includes('login.html')) {
                window.location.href = referrer;
            } else {
                window.location.href = 'index.html';
            }
        }
    }, 1000); // Simulate 1 second API call
}

/**
 * Handle registration form submission
 * @param {Event} e - Form submit event
 */
function handleRegistration(e) {
    e.preventDefault();
    
    // Get form data
    const firstName = document.getElementById('first-name').value;
    const lastName = document.getElementById('last-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    // Validate passwords match
    if (password !== confirmPassword) {
        // Show error message
        showToast('Registration Error', 'Passwords do not match.', 'danger');
        return;
    }
    
    // Simulate API call to register user
    setTimeout(() => {
        // Create user object
        const user = {
            id: Date.now(), // Generate unique ID
            email: email,
            firstName: firstName,
            lastName: lastName,
            role: 'user'
        };
        
        // Save user data to localStorage
        localStorage.setItem('currentUser', JSON.stringify(user));
        currentUser = user;
        
        // Update UI
        updateAuthUI(true);
        
        // Show success message
        showToast('Registration Successful', 'Your account has been created successfully.', 'success');
        
        // Redirect to homepage
        window.location.href = 'index.html';
    }, 1000); // Simulate 1 second API call
}

/**
 * Handle logout
 * @param {Event} e - Click event
 */
function handleLogout(e) {
    e.preventDefault();
    
    // Clear user data from localStorage
    localStorage.removeItem('currentUser');
    currentUser = null;
    
    // Update UI
    updateAuthUI(false);
    
    // Show success message
    showToast('Logout Successful', 'You have been successfully logged out.', 'info');
    
    // Redirect to homepage
    window.location.href = window.location.href.includes('/admin/') ? '../index.html' : 'index.html';
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
