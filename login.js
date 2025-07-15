// Password toggle functionality
document.getElementById('loginPasswordToggle').addEventListener('click', function() {
    const passwordInput = document.getElementById('loginPassword');
    const showText = this.querySelector('.show-text');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        showText.textContent = 'HIDE';
    } else {
        passwordInput.type = 'password';
        showText.textContent = 'SHOW';
    }
});

// Form submission - Updated to use database authentication
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const email = formData.get('email');
    const password = formData.get('password');
    
    // Basic validation
    if (!email || !password) {
        alert('Please fill in all required fields.');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        return;
    }
    
    // Simulate login process
    const submitBtn = document.querySelector('.login-submit-btn');
    const originalText = submitBtn.textContent;
    
    submitBtn.textContent = 'Logging in...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        // Initialize database if not already done
        if (!window.WasteWiseDB) {
            // Load database script dynamically if not loaded
            const script = document.createElement('script');
            script.src = 'database.js';
            script.onload = function() {
                performLogin(email, password, submitBtn, originalText);
            };
            document.head.appendChild(script);
        } else {
            performLogin(email, password, submitBtn, originalText);
        }
    }, 1000);
});

function performLogin(email, password, submitBtn, originalText) {
    const db = window.WasteWiseDB;
    
    // Authenticate user
    const user = db.authenticateUser(email, password);
    
    if (user) {
        // Successful login
        alert(`Welcome back, ${user.name}!\n\nYou have successfully logged into your WasteWise account.\n\nBalance: ₦${user.balance.toFixed(2)}\nPoints: ${user.points}`);
        
        // Reset form
        document.getElementById('loginForm').reset();
        
        submitBtn.textContent = 'Success!';
        submitBtn.style.background = '#10b981';
        
        // Redirect to dashboard after successful login
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 500); // Faster redirect
    } else {
        // Failed login
        alert('Invalid email or password. Please try again.\n\nDemo accounts:\n• adeoye.daniel@gmail.com / password123\n• omowayeayomide3@gmail.com / password123');
        
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        submitBtn.style.background = '#22c55e';
    }
}

// Forgot password functionality
document.querySelector('.forgot-link').addEventListener('click', function(e) {
    e.preventDefault();
    const email = prompt('Please enter your email address to reset your password:');
    if (email) {
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            alert(`Password reset instructions have been sent to ${email}\n\nPlease check your email and follow the instructions to reset your password.`);
        } else {
            alert('Please enter a valid email address.');
        }
    }
});

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

// Form validation with better UX
function validateLoginForm() {
    const inputs = document.querySelectorAll('#loginEmail, #loginPassword');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
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

// Enhanced form validation on input
document.querySelectorAll('#loginEmail, #loginPassword').forEach(input => {
    input.addEventListener('blur', function() {
        if (!this.value.trim()) {
            this.style.borderColor = '#ef4444';
            this.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
        } else {
            this.style.borderColor = '#22c55e';
            this.style.boxShadow = '0 0 0 3px rgba(34, 197, 94, 0.1)';
        }
    });
    
    input.addEventListener('focus', function() {
        this.style.borderColor = '#22c55e';
        this.style.boxShadow = '0 0 0 3px rgba(34, 197, 94, 0.1)';
    });
});

// Load database script
document.addEventListener('DOMContentLoaded', function() {
    if (!window.WasteWiseDB) {
        const script = document.createElement('script');
        script.src = 'database.js';
        document.head.appendChild(script);
    }
});

console.log('WasteWise login page loaded successfully!');