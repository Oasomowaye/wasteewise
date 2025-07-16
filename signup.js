// Password toggle functionality
document.getElementById('passwordToggle').addEventListener('click', function() {
    const passwordInput = document.getElementById('password');
    const showText = this.querySelector('.show-text');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        showText.textContent = 'HIDE';
    } else {
        passwordInput.type = 'password';
        showText.textContent = 'SHOW';
    }
});

// Password validation
const passwordInput = document.getElementById('password');
const requirements = {
    lowercase: /[a-z]/,
    uppercase: /[A-Z]/,
    numbers: /\d/,
    length: /.{8,}/
};

passwordInput.addEventListener('input', function() {
    const password = this.value;
    
    // Check each requirement
    Object.keys(requirements).forEach(req => {
        const element = document.getElementById(req);
        const icon = element.querySelector('.requirement-icon');
        
        if (requirements[req].test(password)) {
            element.classList.add('valid');
            icon.className = 'fas fa-check requirement-icon';
        } else {
            element.classList.remove('valid');
            icon.className = 'fas fa-times requirement-icon';
        }
    });
});

// Form submission - Updated to use Firebase Auth for email/password registration
// and Google sign up

document.getElementById('signupForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const email = formData.get('email');
    const password = formData.get('password');
    const firstName = formData.get('firstName');
    const lastName = formData.get('lastName');
    
    // Basic validation
    if (!email || !password || !firstName || !lastName) {
        alert('Please fill in all required fields.');
        return;
    }
    
    // Password validation
    const isValidPassword = Object.keys(requirements).every(req => 
        requirements[req].test(password)
    );
    
    if (!isValidPassword) {
        alert('Please ensure your password meets all requirements.');
        return;
    }
    
    const submitBtn = document.querySelector('.signup-submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Creating Account...';
    submitBtn.disabled = true;

    // Use Firebase Auth for registration
    window.firebaseAuth.signUpWithEmail(email, password)
        .then((userCredential) => {
            // Optionally, update user profile with first and last name
            return userCredential.user.updateProfile({
                displayName: `${firstName} ${lastName}`
            });
        })
        .then(() => {
            alert(`Welcome to WasteWise, ${firstName}!\n\nYour account has been created successfully. You can now access all WasteWise services.`);
            // Reset form
            document.getElementById('signupForm').reset();
            // Reset password requirements display
            document.querySelectorAll('.requirement').forEach(req => {
                req.classList.remove('valid');
                req.querySelector('.requirement-icon').className = 'fas fa-times requirement-icon';
            });
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            // Redirect to dashboard after successful signup
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        })
        .catch((error) => {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            alert(`Signup failed: ${error.message}`);
        });
});

// Google sign up handler
const googleSignupBtn = document.getElementById('googleSignupBtn');
if (googleSignupBtn) {
    googleSignupBtn.addEventListener('click', function() {
        const submitBtn = document.querySelector('.signup-submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Signing up with Google...';
        submitBtn.disabled = true;
        window.firebaseAuth.signInWithGoogle()
            .then((result) => {
                alert('Welcome to WasteWise! You have signed up with your Google account.');
                window.location.href = 'dashboard.html';
            })
            .catch((error) => {
                alert(`Google signup failed: ${error.message}`);
            })
            .finally(() => {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            });
    });
}

// Login link handler
document.querySelector('.login-link-text').addEventListener('click', function(e) {
    e.preventDefault();
    window.location.href = 'login.html';
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

console.log('WasteWise signup page loaded successfully!');