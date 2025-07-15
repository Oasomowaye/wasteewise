// Admin Login functionality
document.addEventListener('DOMContentLoaded', function() {
    // Admin credentials (in a real application, this would be handled server-side)
    const ADMIN_CREDENTIALS = {
        username: 'admin',
        password: 'admin123'
    };
    
    // Password toggle functionality
    const passwordToggle = document.getElementById('adminPasswordToggle');
    const passwordInput = document.getElementById('adminPassword');
    
    if (passwordToggle && passwordInput) {
        passwordToggle.addEventListener('click', function() {
            const icon = this.querySelector('i');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.className = 'fas fa-eye-slash';
            } else {
                passwordInput.type = 'password';
                icon.className = 'fas fa-eye';
            }
        });
    }
    
    // Form submission
    const adminLoginForm = document.getElementById('adminLoginForm');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('adminUsername').value.trim();
            const password = document.getElementById('adminPassword').value;
            
            // Clear previous error messages
            clearMessages();
            
            // Basic validation
            if (!username || !password) {
                showError('Please enter both username and password.');
                return;
            }
            
            // Show loading state
            const submitBtn = document.querySelector('.admin-login-btn');
            const originalText = submitBtn.innerHTML;
            submitBtn.classList.add('loading');
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';
            submitBtn.disabled = true;
            
            // Simulate authentication delay
            setTimeout(() => {
                // Verify credentials
                if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
                    // Successful login
                    showSuccess('Authentication successful! Redirecting to admin panel...');
                    
                    // Store admin session
                    localStorage.setItem('wastewise_admin_session', JSON.stringify({
                        username: username,
                        loginTime: new Date().toISOString(),
                        sessionId: generateSessionId()
                    }));
                    
                    // Reset form
                    adminLoginForm.reset();
                    
                    // Redirect to admin dashboard after delay
                    setTimeout(() => {
                        window.location.href = 'admin.html';
                    }, 1500);
                } else {
                    // Failed login
                    showError('Invalid username or password. Please try again.');
                    
                    // Add error styling to inputs
                    document.getElementById('adminUsername').classList.add('error');
                    document.getElementById('adminPassword').classList.add('error');
                    
                    // Remove error styling after user starts typing
                    [document.getElementById('adminUsername'), document.getElementById('adminPassword')].forEach(input => {
                        input.addEventListener('input', function() {
                            this.classList.remove('error');
                            clearMessages();
                        }, { once: true });
                    });
                }
                
                // Reset button state
                submitBtn.classList.remove('loading');
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 2000);
        });
    }
    
    // Generate session ID
    function generateSessionId() {
        return 'admin_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    // Show error message
    function showError(message) {
        clearMessages();
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
        
        const form = document.getElementById('adminLoginForm');
        form.appendChild(errorDiv);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }
    
    // Show success message
    function showSuccess(message) {
        clearMessages();
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
        
        const form = document.getElementById('adminLoginForm');
        form.appendChild(successDiv);
    }
    
    // Clear all messages
    function clearMessages() {
        const messages = document.querySelectorAll('.error-message, .success-message');
        messages.forEach(message => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
        });
    }
    
    // Check if already logged in
    const existingSession = localStorage.getItem('wastewise_admin_session');
    if (existingSession) {
        try {
            const session = JSON.parse(existingSession);
            const loginTime = new Date(session.loginTime);
            const now = new Date();
            const hoursSinceLogin = (now - loginTime) / (1000 * 60 * 60);
            
            // Session expires after 8 hours
            if (hoursSinceLogin < 8) {
                // Valid session exists, redirect to admin panel
                window.location.href = 'admin.html';
                return;
            } else {
                // Session expired, remove it
                localStorage.removeItem('wastewise_admin_session');
            }
        } catch (error) {
            // Invalid session data, remove it
            localStorage.removeItem('wastewise_admin_session');
        }
    }
    
    // Enhanced form validation
    const inputs = document.querySelectorAll('#adminUsername, #adminPassword');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (!this.value.trim()) {
                this.classList.add('error');
            } else {
                this.classList.remove('error');
            }
        });
        
        input.addEventListener('focus', function() {
            this.classList.remove('error');
            clearMessages();
        });
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Alt + A to focus username field
        if (e.altKey && e.key === 'a') {
            e.preventDefault();
            document.getElementById('adminUsername').focus();
        }
        
        // Alt + P to focus password field
        if (e.altKey && e.key === 'p') {
            e.preventDefault();
            document.getElementById('adminPassword').focus();
        }
    });
    
    // Security: Clear form on page unload
    window.addEventListener('beforeunload', function() {
        const form = document.getElementById('adminLoginForm');
        if (form) {
            form.reset();
        }
    });
    
    // Auto-focus username field
    setTimeout(() => {
        const usernameInput = document.getElementById('adminUsername');
        if (usernameInput) {
            usernameInput.focus();
        }
    }, 500);
    
    console.log('WasteWise Admin Login page loaded successfully!');
});