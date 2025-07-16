// Recycle page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in with Firebase Auth
   function loadUserData() {
        const currentUser = db.getCurrentUser();
        if (!currentUser) {
            window.location.href = 'login.html';
            return;
        }
        
        const user = db.getUserById(currentUser.id);
        if (!user) {
            localStorage.removeItem('wastewise_current_user');
            window.location.href = 'login.html';
            return;
        }
        
        updateBalanceDisplay(user.balance);
        updateRecycleDisplay(user.recycledWeight);
        updatePointsDisplay(user.points);
        
        // Update user name in sidebar if it changed
        const userNameElement = document.querySelector('.user-info h3');
        if (userNameElement) {
            userNameElement.textContent = user.name;
        }
    }
    
    // Tab switching functionality
    const pickupTab = document.getElementById('pickupTab');
    const dropoffTab = document.getElementById('dropoffTab');
    const pickupForm = document.getElementById('pickupForm');
    const dropoffForm = document.getElementById('dropoffForm');
    
    // Set initial state - Pickup active as shown in image
    pickupTab.classList.add('active');
    dropoffTab.classList.remove('active');
    pickupForm.style.display = 'grid';
    dropoffForm.style.display = 'none';
    
    pickupTab.addEventListener('click', function() {
        // Switch to pickup tab
        pickupTab.classList.add('active');
        dropoffTab.classList.remove('active');
        pickupForm.style.display = 'grid';
        dropoffForm.style.display = 'none';
    });
    
    dropoffTab.addEventListener('click', function() {
        // Switch to dropoff tab
        dropoffTab.classList.add('active');
        pickupTab.classList.remove('active');
        dropoffForm.style.display = 'block';
        pickupForm.style.display = 'none';
    });
    
    // Pickup form functionality
    const requestBtn = document.querySelector('.request-btn');
    if (requestBtn) {
        requestBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            
            // Get form data
            const address = document.querySelector('.pickup-form .form-input').value;
            const date = document.querySelector('.date-input').value;
            const timeInputs = document.querySelectorAll('.time-input');
            const fromTime = timeInputs[0].value;
            const toTime = timeInputs[1].value;
            
            // Validate form
            if (!address.trim()) {
                alert('Please enter your address');
                return;
            }
            
            if (!date) {
                alert('Please select a pickup date');
                return;
            }
            
            if (!fromTime || !toTime) {
                alert('Please select pickup time range');
                return;
            }
            
            // Check if date is not in the past
            const selectedDate = new Date(date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (selectedDate < today) {
                alert('Please select a future date for pickup');
                return;
            }
            
            // Show loading state
            this.classList.add('loading');
            this.textContent = 'Processing Request...';
            this.disabled = true;
            
            try {
                // Get Firebase user
                const user = firebase.auth().currentUser;
                if (!user) {
                    alert('Please log in to submit a pickup request.');
                    this.classList.remove('loading');
                    this.textContent = 'Request pickup';
                    this.disabled = false;
                    return;
                }
                
                // Create pickup request object
                const pickupRequest = {
                    userId: user.uid,
                    userName: user.displayName || user.email,
                    userEmail: user.email,
                    address: address,
                    pickupDate: date,
                    pickupTimeFrom: fromTime,
                    pickupTimeTo: toTime,
                    status: 'pending',
                    priority: 'medium',
                    notes: '',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    estimatedWeight: '20kg'
                };
                
                // Store in Firestore
                const docRef = await firebase.firestore().collection('pickup_requests').add(pickupRequest);
                alert(`Pickup Request Submitted Successfully!\n\nRequest ID: ${docRef.id}\nAddress: ${address}\nDate: ${date}\nTime: ${fromTime} - ${toTime}\n\nYou will receive a confirmation email shortly. Our team will contact you 24 hours before the scheduled pickup.`);
                
                // Reset form
                document.querySelector('.pickup-form .form-input').value = '';
                document.querySelector('.date-input').value = '';
                timeInputs[0].value = '';
                timeInputs[1].value = '';
            } catch (error) {
                alert('An error occurred while submitting your request. Please try again.' + error.message);
            } finally {
                this.classList.remove('loading');
                this.textContent = 'Request pickup';
                this.disabled = false;
            }
        });
    }
    
    // Recycling center click handlers
    const centerItems = document.querySelectorAll('.center-item');
    centerItems.forEach(item => {
        item.addEventListener('click', function() {
            const centerName = this.querySelector('.center-name').textContent;
            const centerAddress = this.querySelector('.center-address').textContent;
            const centerPhone = this.querySelector('.center-phone').textContent;
            
            // Update prices section to show selected center's prices
            const pricesTitle = document.querySelector('.current-prices h3');
            pricesTitle.textContent = `Current prices of Waste at ${centerName.split(' ')[0]}`;
            
            // Show center details
            alert(`${centerName}\n\nAddress: ${centerAddress}\nPhone: ${centerPhone}\n\nClick OK to view current waste prices for this center.`);
        });
    });
    
    // Price item click handlers
    const priceItems = document.querySelectorAll('.price-item');
    priceItems.forEach(item => {
        item.addEventListener('click', function() {
            const wasteType = this.querySelector('.price-label').textContent;
            const price = this.querySelector('.price-value').textContent;
            
            alert(`${wasteType} Recycling\n\nCurrent Price: ${price} per kg\n\nWould you like to schedule a dropoff for ${wasteType}?`);
        });
    });
    
    // Address input functionality
    const addressInput = document.querySelector('.dropoff-form .form-input');
    if (addressInput) {
        addressInput.addEventListener('input', function() {
            // Simulate address-based center filtering
            if (this.value.trim().length > 3) {
                // In a real app, this would filter centers based on location
                console.log('Filtering centers based on:', this.value);
            }
        });
    }
    
    // Search functionality
    const searchInput = document.querySelector('.search-box input');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const query = this.value.trim();
                if (query) {
                    alert(`Searching for: ${query}\n\nThis is a demo. In a real application, this would search across recycling centers and services.`);
                }
            }
        });
    }
    
    // Notification button
    const notificationBtn = document.querySelector('.notification-btn');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', function() {
            alert('Notifications:\n\n• New recycling center added near you\n• Price update: PET bottles now ₦55/kg\n• Pickup scheduled for tomorrow\n\nThis is a demo version.');
        });
    }
    
    // User menu dropdown
    const userMenu = document.querySelector('.user-menu');
    if (userMenu) {
        userMenu.addEventListener('click', function() {
            alert('User Menu:\n\n• Profile Settings\n• Account Preferences\n• Help & Support\n• Log Out\n\nThis is a demo version.');
        });
    }
    
    // Navigation links - Fixed to handle proper cross-page navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Handle logout
            if (href === 'index.html' && this.id === 'logoutBtn') {
                e.preventDefault();
                const confirmLogout = confirm('Are you sure you want to log out?');
                if (confirmLogout) {
                    localStorage.removeItem('wastewise_current_user');
                    alert('Logging out...\n\nThank you for using WasteWise!');
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1000);
                }
                return;
            }
            
            // Allow all .html file navigation to proceed normally
            if (href && href.endsWith('.html')) {
                return;
            }
        });
    });
    
    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const confirmLogout = confirm('Are you sure you want to log out?');
            if (confirmLogout) {
                // Clear current user
                localStorage.removeItem('wastewise_current_user');
                
                alert('Logging out...\n\nThank you for using WasteWise!');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            }
        });
    }
    
    // Visibility toggle button
    const visibilityBtn = document.querySelector('.visibility-btn');
    if (visibilityBtn) {
        let isVisible = true;
        visibilityBtn.addEventListener('click', function() {
            const icon = this.querySelector('i');
            const priceValues = document.querySelectorAll('.price-value');
            
            if (isVisible) {
                icon.className = 'fas fa-eye-slash';
                priceValues.forEach(price => {
                    price.textContent = '***';
                });
            } else {
                icon.className = 'fas fa-eye';
                priceValues.forEach(price => {
                    price.textContent = '#50';
                });
            }
            isVisible = !isVisible;
        });
    }
    
    // Form input enhancements
    const formInputs = document.querySelectorAll('.form-input');
    formInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.style.borderColor = '#22c55e';
            this.style.boxShadow = '0 0 0 3px rgba(34, 197, 94, 0.1)';
        });
        
        input.addEventListener('blur', function() {
            if (!this.value.trim()) {
                this.style.borderColor = '#e5e7eb';
                this.style.boxShadow = 'none';
            }
        });
    });
    
    // Set minimum date to today for date input
    const dateInput = document.querySelector('.date-input');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
    }
    
    // Auto-resize functionality for mobile
    function handleResize() {
        if (window.innerWidth <= 768) {
            // Mobile optimizations
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) {
                sidebar.style.transform = 'translateX(-100%)';
            }
        }
    }
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Call on load
    
    // Simulate real-time price updates
    setInterval(() => {
        // In a real app, this would fetch updated prices from the server
        console.log('Checking for price updates...');
    }, 30000);
    
    console.log('WasteWise Recycle page loaded successfully!');
});

// Listen for auth state
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        // Update user name and photo from Firebase Auth
        var displayName = user.displayName || user.email || 'User';
        var photoURL = user.photoURL || 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1';
        // Sidebar name
        var sidebarName = document.querySelector('.user-info h3');
        if (sidebarName) sidebarName.textContent = displayName;
        // Welcome section
        var welcomeName = document.querySelector('.welcome-section h1');
        if (welcomeName) welcomeName.textContent = `Hello, ${displayName}`;
        // Card holder name
        var cardHolder = document.getElementById('cardholdername');
        if (cardHolder) cardHolder.textContent = displayName.toUpperCase();
        // User photo (sidebar and header)
        var avatar = document.querySelector('.user-avatar img');
        if (avatar) avatar.src = photoURL;
        var avatarSmall = document.querySelector('.user-avatar-small');
        if (avatarSmall) avatarSmall.src = photoURL;
    } else {
        // Not logged in, redirect to login
        window.location.href = 'login.html';
    }
});
// Logout button
var logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        window.firebaseAuth.signOut().then(function() {
            window.location.href = 'login.html';
        });
    });
}