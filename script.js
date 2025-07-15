// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Header background change on scroll
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = 'none';
    }
});

// Enhanced form submission with Google Maps integration
document.querySelector('.waste-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const locationInput = document.querySelector('.location-input');
    const serviceSelect = document.querySelector('.service-select');
    
    if (!locationInput.value.trim()) {
        alert('Please enter your location');
        locationInput.focus();
        return;
    }
    
    if (serviceSelect.value === 'Select') {
        alert('Please select a service type');
        serviceSelect.focus();
        return;
    }
    
    // Get the address from the input
    const address = locationInput.value.trim();
    const serviceType = serviceSelect.value;
    
    // Simulate form submission with loading state
    const button = document.querySelector('.get-started-btn');
    const originalText = button.textContent;
    button.textContent = 'Opening Maps...';
    button.disabled = true;
    
    setTimeout(() => {
        // Open Google Maps with the searched address
        openGoogleMaps(address, serviceType);
        
        // Reset button state
        button.textContent = originalText;
        button.disabled = false;
        
        // Show success message
        alert(`Service request processed!\n\nAddress: ${address}\nService: ${serviceType}\n\nOpening Google Maps to show your location...`);
        
        // Reset form
        locationInput.value = '';
        serviceSelect.value = 'Select';
    }, 1500);
});

// Function to open Google Maps with the searched address
function openGoogleMaps(address, serviceType) {
    // Encode the address for URL
    const encodedAddress = encodeURIComponent(address);
    
    // Create Google Maps URL with the address
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    
    // Alternative: Use directions URL if you want to show directions from user's current location
    // const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
    
    // Open Google Maps in a new tab/window
    window.open(googleMapsUrl, '_blank');
    
    // Log the action for analytics (in a real app)
    console.log(`Google Maps opened for address: ${address}, Service: ${serviceType}`);
}

// Enhanced address input with suggestions (basic implementation)
const locationInput = document.querySelector('.location-input');
if (locationInput) {
    // Add placeholder text to guide users
    locationInput.placeholder = 'Enter your address (e.g., 123 Main Street, City, State)';
    
    // Add input validation and formatting
    locationInput.addEventListener('input', function() {
        const value = this.value.trim();
        
        // Remove any invalid characters for address
        this.value = value.replace(/[<>]/g, '');
        
        // Add visual feedback for valid address format
        if (value.length > 10 && value.includes(',')) {
            this.style.borderColor = '#22c55e';
            this.style.boxShadow = '0 0 0 3px rgba(34, 197, 94, 0.1)';
        } else if (value.length > 0) {
            this.style.borderColor = '#f59e0b';
            this.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
        } else {
            this.style.borderColor = '#e5e7eb';
            this.style.boxShadow = 'none';
        }
    });
    
    // Add keyboard shortcut for quick submission
    locationInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && this.value.trim()) {
            e.preventDefault();
            document.querySelector('.get-started-btn').click();
        }
    });
}

// Add geolocation functionality for current location
function addCurrentLocationButton() {
    const locationInputContainer = document.querySelector('.waste-form');
    const locationInput = document.querySelector('.location-input');
    
    // Create current location button
    const currentLocationBtn = document.createElement('button');
    currentLocationBtn.type = 'button';
    currentLocationBtn.className = 'current-location-btn';
    currentLocationBtn.innerHTML = '<i class="fas fa-location-arrow"></i> Use Current Location';
    currentLocationBtn.style.cssText = `
        background: #f3f4f6;
        border: 2px solid #e5e7eb;
        color: #374151;
        padding: 0.75rem 1rem;
        border-radius: 8px;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-top: 0.5rem;
        width: 100%;
        justify-content: center;
    `;
    
    // Add hover effects
    currentLocationBtn.addEventListener('mouseenter', function() {
        this.style.borderColor = '#22c55e';
        this.style.color = '#22c55e';
    });
    
    currentLocationBtn.addEventListener('mouseleave', function() {
        this.style.borderColor = '#e5e7eb';
        this.style.color = '#374151';
    });
    
    // Add click handler for geolocation
    currentLocationBtn.addEventListener('click', function() {
        if (navigator.geolocation) {
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Getting Location...';
            this.disabled = true;
            
            navigator.geolocation.getCurrentPosition(
                function(position) {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    
                    // Use reverse geocoding to get address (simplified version)
                    // In a real app, you'd use Google Geocoding API
                    const approximateAddress = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
                    locationInput.value = `Current Location (${approximateAddress})`;
                    locationInput.style.borderColor = '#22c55e';
                    locationInput.style.boxShadow = '0 0 0 3px rgba(34, 197, 94, 0.1)';
                    
                    currentLocationBtn.innerHTML = '<i class="fas fa-check"></i> Location Found';
                    currentLocationBtn.style.borderColor = '#22c55e';
                    currentLocationBtn.style.color = '#22c55e';
                    currentLocationBtn.disabled = false;
                    
                    setTimeout(() => {
                        currentLocationBtn.innerHTML = '<i class="fas fa-location-arrow"></i> Use Current Location';
                        currentLocationBtn.style.borderColor = '#e5e7eb';
                        currentLocationBtn.style.color = '#374151';
                    }, 2000);
                },
                function(error) {
                    currentLocationBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Location Access Denied';
                    currentLocationBtn.style.borderColor = '#ef4444';
                    currentLocationBtn.style.color = '#ef4444';
                    currentLocationBtn.disabled = false;
                    
                    setTimeout(() => {
                        currentLocationBtn.innerHTML = '<i class="fas fa-location-arrow"></i> Use Current Location';
                        currentLocationBtn.style.borderColor = '#e5e7eb';
                        currentLocationBtn.style.color = '#374151';
                    }, 3000);
                    
                    console.error('Geolocation error:', error);
                }
            );
        } else {
            alert('Geolocation is not supported by this browser.');
        }
    });
    
    // Insert the button after the location input
    locationInput.parentNode.insertBefore(currentLocationBtn, locationInput.nextSibling);
}

// Initialize current location button
document.addEventListener('DOMContentLoaded', function() {
    addCurrentLocationButton();
});

// Mobile menu toggle
document.querySelector('.menu-btn').addEventListener('click', function() {
    const navMenu = document.querySelector('.nav-menu');
    navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
});

// Search functionality
document.querySelector('.search-btn').addEventListener('click', function() {
    const searchQuery = prompt('What are you looking for?');
    if (searchQuery) {
        alert(`Searching for: ${searchQuery}\n\nThis is a demo. In a real application, this would perform a search.`);
    }
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.service-card, .feature-item, .recycling-content > *').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Button hover effects
document.querySelectorAll('button, .service-link').forEach(element => {
    element.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
    });
    
    element.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

// Service card click handlers
document.querySelectorAll('.service-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const serviceName = this.closest('.service-card').querySelector('h3').textContent;
        alert(`You clicked on: ${serviceName}\n\nThis would normally navigate to the service page.`);
    });
});

// Auth button handlers - Updated to navigate to respective pages
document.querySelector('.login-btn').addEventListener('click', function(e) {
    e.preventDefault();
    window.location.href = 'login.html';
});

document.querySelector('.signup-btn').addEventListener('click', function(e) {
    e.preventDefault();
    window.location.href = 'signup.html';
});

// Feature item click handlers
document.querySelectorAll('.feature-item').forEach(item => {
    item.addEventListener('click', function() {
        const featureName = this.querySelector('span').textContent;
        alert(`You clicked on: ${featureName}\n\nThis feature would be implemented in a full application.`);
    });
});

// CTA button handler
document.querySelector('.cta-button').addEventListener('click', function() {
    document.querySelector('.services-section').scrollIntoView({
        behavior: 'smooth'
    });
});

// Recycling button handler
document.querySelector('.recycling-btn').addEventListener('click', function() {
    alert('This would navigate to the recycling basics page.\n\nDemo version - feature not fully implemented.');
});

// Help button handler
document.querySelector('.help-btn').addEventListener('click', function() {
    alert('Customer support chat would open here.\n\nDemo version - feature not fully implemented.');
});

// Add loading state to buttons
function addLoadingState(button, duration = 2000) {
    const originalText = button.textContent;
    const originalBg = button.style.backgroundColor;
    
    button.textContent = 'Loading...';
    button.disabled = true;
    button.style.opacity = '0.7';
    
    setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
        button.style.opacity = '1';
        button.style.backgroundColor = originalBg;
    }, duration);
}

// Parallax effect for hero section
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    const rate = scrolled * -0.5;
    
    if (hero) {
        hero.style.backgroundPosition = `center ${rate}px`;
    }
});

// Form validation with better UX
function validateForm() {
    const inputs = document.querySelectorAll('.location-input, .service-select');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value || input.value === 'Select') {
            input.style.borderColor = '#ef4444';
            input.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
            isValid = false;
            
            // Remove error styling after user starts typing
            input.addEventListener('input', function() {
                this.style.borderColor = '#e5e7eb';
                this.style.boxShadow = 'none';
            }, { once: true });
        }
    });
    
    return isValid;
}

// Enhanced form submission
document.querySelector('.waste-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (validateForm()) {
        const button = document.querySelector('.get-started-btn');
        addLoadingState(button);
        
        // Simulate API call
        setTimeout(() => {
            alert('Service request submitted successfully!\n\nYou will receive a confirmation email shortly.');
        }, 1000);
    }
});

// Add helpful tooltips for better UX
function addTooltips() {
    const locationInput = document.querySelector('.location-input');
    const serviceSelect = document.querySelector('.service-select');
    
    // Add title attributes for accessibility
    locationInput.title = 'Enter your full address including street, city, and state for accurate service location';
    serviceSelect.title = 'Select the type of waste management service you need';
    
    // Add focus hints
    locationInput.addEventListener('focus', function() {
        if (!this.value) {
            this.placeholder = 'e.g., 123 Main Street, Anytown, State 12345';
        }
    });
    
    locationInput.addEventListener('blur', function() {
        this.placeholder = 'Enter your address (e.g., 123 Main Street, City, State)';
    });
}

// Initialize tooltips
document.addEventListener('DOMContentLoaded', function() {
    addTooltips();
});

console.log('WasteWise website loaded successfully with Google Maps integration!');