// Firebase Auth and Firestore: Load and update user profile
window.addEventListener('DOMContentLoaded', function() {
    // Listen for auth state
    firebase.auth().onAuthStateChanged(async function(user) {
        if (user) {
            // Load user info
            const displayName = user.displayName || '';
            const photoURL = user.photoURL || 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1';
            document.getElementById('sidebarUserName').textContent = displayName;
            document.getElementById('sidebarUserAvatar').src = photoURL;
            document.getElementById('headerUserAvatar').src = photoURL;
            document.getElementById('profilePicture').src = photoURL;
            // Split name for form
            const nameParts = displayName.split(' ');
            document.getElementById('firstName').value = nameParts[0] || '';
            document.getElementById('lastName').value = nameParts.slice(1).join(' ') || '';
            document.getElementById('email').value = user.email;
            // Optionally load phone from Firestore
            const db = firebase.firestore();
            const userDoc = await db.collection('users').doc(user.uid).get();
            if (userDoc.exists) {
                const data = userDoc.data();
                if (data.phone) document.getElementById('phone').value = data.phone;
            }
        } else {
            window.location.href = 'login.html';
        }
    });

    // Profile picture upload functionality
    window.triggerFileUpload = function() {
        document.getElementById('profilePictureInput').click();
    };
    document.getElementById('profilePictureInput').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Please select a valid image file.');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                alert('Image size must be less than 5MB.');
                return;
            }
            const reader = new FileReader();
            reader.onload = async function(e) {
                const imageUrl = e.target.result;
                // Update UI
                document.getElementById('sidebarUserAvatar').src = imageUrl;
                document.getElementById('headerUserAvatar').src = imageUrl;
                document.getElementById('profilePicture').src = imageUrl;
                // Update Firebase Auth profile
                const user = firebase.auth().currentUser;
                if (user) {
                    await user.updateProfile({ photoURL: imageUrl });
                    // Update Firestore user doc
                    await firebase.firestore().collection('users').doc(user.uid).set({ photoURL: imageUrl }, { merge: true });
                    alert('Profile picture updated successfully!');
                }
            };
            reader.readAsDataURL(file);
        }
    });
    window.removeProfilePicture = async function() {
        const confirmRemove = confirm('Are you sure you want to remove your profile picture?');
        if (confirmRemove) {
            const defaultAvatar = 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1';
            document.getElementById('sidebarUserAvatar').src = defaultAvatar;
            document.getElementById('headerUserAvatar').src = defaultAvatar;
            document.getElementById('profilePicture').src = defaultAvatar;
            const user = firebase.auth().currentUser;
            if (user) {
                await user.updateProfile({ photoURL: defaultAvatar });
                await firebase.firestore().collection('users').doc(user.uid).set({ photoURL: defaultAvatar }, { merge: true });
                alert('Profile picture removed successfully!');
            }
        }
    };
    // Profile form submission
    document.getElementById('profileForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        if (!firstName || !lastName || !email) {
            alert('Please fill in all required fields.');
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address.');
            return;
        }
        const user = firebase.auth().currentUser;
        if (user) {
            const displayName = `${firstName} ${lastName}`;
            await user.updateProfile({ displayName });
            // Update Firestore user doc
            await firebase.firestore().collection('users').doc(user.uid).set({ displayName, phone }, { merge: true });
            document.getElementById('sidebarUserName').textContent = displayName;
            alert('Profile updated successfully!');
        }
    });
    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.firebaseAuth.signOut().then(function() {
                window.location.href = 'login.html';
            });
        });
    }
});

// Settings page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const currentUser = window.WasteWiseDB.getCurrentUser();
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    // Initialize database
    const db = window.WasteWiseDB;
    
    // Load current user data
    loadUserSettings();
    
    // Initialize theme
    initializeTheme();
    
    // Load current user settings
    function loadUserSettings() {
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
        
        // Update profile information
        updateUserProfile(user);
        
        // Populate profile form
        populateProfileForm(user);
        
        // Load user preferences
        loadUserPreferences(user);
    }
    
    // Listen for storage changes (when admin updates from another tab)
    window.addEventListener('storage', function(e) {
        if (e.key === 'wastewise_users') {
            loadUserSettings();
        }
    });
    
    function updateUserProfile(user) {
        // Update user name in sidebar
        const sidebarUserName = document.getElementById('sidebarUserName');
        if (sidebarUserName) {
            sidebarUserName.textContent = user.name;
        }
        
        // Update user avatars
        const avatars = [
            document.getElementById('sidebarUserAvatar'),
            document.getElementById('headerUserAvatar'),
            document.getElementById('profilePicture')
        ];
        
        avatars.forEach(avatar => {
            if (avatar) {
                avatar.src = user.avatar || 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1';
                avatar.alt = user.name;
            }
        });
    }
    
    function populateProfileForm(user) {
        // Split name into first and last name
        const nameParts = user.name.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        document.getElementById('firstName').value = firstName;
        document.getElementById('lastName').value = lastName;
        document.getElementById('email').value = user.email;
        document.getElementById('phone').value = user.phone || '';
    }
    
    function loadUserPreferences(user) {
        const preferences = user.preferences || {};
        
        // Load notification preferences
        document.getElementById('recyclingReminders').checked = preferences.recyclingReminders !== false;
        document.getElementById('balanceUpdates').checked = preferences.balanceUpdates !== false;
        document.getElementById('marketingEmails').checked = preferences.marketingEmails || false;
        document.getElementById('transactionAlerts').checked = preferences.transactionAlerts !== false;
        document.getElementById('partnerUpdates').checked = preferences.partnerUpdates !== false;
        document.getElementById('loginNotifications').checked = preferences.loginNotifications !== false;
        
        // Load accessibility preferences
        document.getElementById('reduceMotion').checked = preferences.reduceMotion || false;
        document.getElementById('highContrast').checked = preferences.highContrast || false;
        
        // Apply accessibility preferences
        if (preferences.reduceMotion) {
            document.body.classList.add('reduce-motion');
        }
        if (preferences.highContrast) {
            document.body.classList.add('high-contrast');
        }
    }
    
    // Profile picture upload functionality
    window.triggerFileUpload = function() {
        document.getElementById('profilePictureInput').click();
    };
    
    document.getElementById('profilePictureInput').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please select a valid image file.');
                return;
            }
            
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Image size must be less than 5MB.');
                return;
            }
            
            // Read and display the image
            const reader = new FileReader();
            reader.onload = function(e) {
                const imageUrl = e.target.result;
                
                // Update all profile pictures
                const avatars = [
                    document.getElementById('sidebarUserAvatar'),
                    document.getElementById('headerUserAvatar'),
                    document.getElementById('profilePicture')
                ];
                
                avatars.forEach(avatar => {
                    if (avatar) {
                        avatar.src = imageUrl;
                    }
                });
                
                // Save to user profile
                const currentUser = db.getCurrentUser();
                db.updateUser(currentUser.id, { avatar: imageUrl });
                
                alert('Profile picture updated successfully!');
            };
            reader.readAsDataURL(file);
        }
    });
    
    window.removeProfilePicture = function() {
        const confirmRemove = confirm('Are you sure you want to remove your profile picture?');
        if (confirmRemove) {
            const defaultAvatar = 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1';
            
            // Update all profile pictures
            const avatars = [
                document.getElementById('sidebarUserAvatar'),
                document.getElementById('headerUserAvatar'),
                document.getElementById('profilePicture')
            ];
            
            avatars.forEach(avatar => {
                if (avatar) {
                    avatar.src = defaultAvatar;
                }
            });
            
            // Save to user profile
            const currentUser = db.getCurrentUser();
            db.updateUser(currentUser.id, { avatar: defaultAvatar });
            
            alert('Profile picture removed successfully!');
        }
    };
    
    // Profile form submission
    document.getElementById('profileForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        
        // Validate required fields
        if (!firstName || !lastName || !email) {
            alert('Please fill in all required fields.');
            return;
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address.');
            return;
        }
        
        // Check if email is already taken by another user
        const currentUser = db.getCurrentUser();
        const existingUser = db.getUserByEmail(email);
        if (existingUser && existingUser.id !== currentUser.id) {
            alert('This email address is already in use by another account.');
            return;
        }
        
        // Update user profile
        const fullName = `${firstName} ${lastName}`;
        const updates = {
            name: fullName,
            firstName: firstName,
            lastName: lastName,
            email: email,
            phone: phone
        };
        
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        
        setTimeout(() => {
            db.updateUser(currentUser.id, updates);
            
            // Update current user session
            db.setCurrentUser({
                id: currentUser.id,
                name: fullName,
                email: email
            });
            
            // Update UI
            updateUserProfile(db.getUserById(currentUser.id));
            
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            
            alert('Profile updated successfully!');
        }, 1000);
    });
    
    window.resetProfileForm = function() {
        const currentUser = db.getCurrentUser();
        const user = db.getUserById(currentUser.id);
        populateProfileForm(user);
    };
    
    // Theme functionality
    function initializeTheme() {
        const savedTheme = localStorage.getItem('wastewise_theme') || 'light';
        applyTheme(savedTheme);
        
        // Set active theme option
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.remove('active');
            if (option.dataset.theme === savedTheme) {
                option.classList.add('active');
            }
        });
    }
    
    // Theme selection
    document.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', function() {
            const theme = this.dataset.theme;
            
            // Remove active class from all options
            document.querySelectorAll('.theme-option').forEach(opt => {
                opt.classList.remove('active');
            });
            
            // Add active class to selected option
            this.classList.add('active');
            
            // Apply theme
            applyTheme(theme);
            
            // Save theme preference
            localStorage.setItem('wastewise_theme', theme);
            
            // Save to user preferences
            const currentUser = db.getCurrentUser();
            const user = db.getUserById(currentUser.id);
            const preferences = user.preferences || {};
            preferences.theme = theme;
            db.updateUser(currentUser.id, { preferences: preferences });
        });
    });
    
    function applyTheme(theme) {
        const body = document.body;
        
        // Remove existing theme classes
        body.classList.remove('dark-mode', 'light-mode');
        
        if (theme === 'dark') {
            body.classList.add('dark-mode');
        } else if (theme === 'auto') {
            // Check system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                body.classList.add('dark-mode');
            }
        }
        // light theme is default (no class needed)
    }
    
    // Listen for system theme changes when auto is selected
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
        const savedTheme = localStorage.getItem('wastewise_theme');
        if (savedTheme === 'auto') {
            applyTheme('auto');
        }
    });
    
    // Password functionality
    window.togglePassword = function(inputId) {
        const input = document.getElementById(inputId);
        const button = input.nextElementSibling;
        const icon = button.querySelector('i');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.className = 'fas fa-eye-slash';
        } else {
            input.type = 'password';
            icon.className = 'fas fa-eye';
        }
    };
    
    // Password validation
    const newPasswordInput = document.getElementById('newPassword');
    const requirements = {
        length: /.{8,}/,
        uppercase: /[A-Z]/,
        lowercase: /[a-z]/,
        number: /\d/
    };
    
    newPasswordInput.addEventListener('input', function() {
        const password = this.value;
        
        // Check each requirement
        Object.keys(requirements).forEach(req => {
            const element = document.getElementById(`${req}Req`);
            const icon = element.querySelector('i');
            
            if (requirements[req].test(password)) {
                element.classList.add('valid');
                icon.className = 'fas fa-check';
            } else {
                element.classList.remove('valid');
                icon.className = 'fas fa-times';
            }
        });
    });
    
    // Password form submission
    document.getElementById('passwordForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Validate current password
        const currentUser = db.getCurrentUser();
        const user = db.getUserById(currentUser.id);
        
        if (user.password !== currentPassword) {
            alert('Current password is incorrect.');
            return;
        }
        
        // Validate new password requirements
        const isValidPassword = Object.keys(requirements).every(req => 
            requirements[req].test(newPassword)
        );
        
        if (!isValidPassword) {
            alert('Please ensure your new password meets all requirements.');
            return;
        }
        
        // Validate password confirmation
        if (newPassword !== confirmPassword) {
            alert('New password and confirmation do not match.');
            return;
        }
        
        // Check if new password is different from current
        if (currentPassword === newPassword) {
            alert('New password must be different from your current password.');
            return;
        }
        
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        
        setTimeout(() => {
            // Update password
            db.updateUser(currentUser.id, { password: newPassword });
            
            // Reset form
            this.reset();
            
            // Reset password requirements display
            document.querySelectorAll('.requirement').forEach(req => {
                req.classList.remove('valid');
                req.querySelector('i').className = 'fas fa-times';
            });
            
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            
            alert('Password updated successfully!');
        }, 1000);
    });
    
    window.resetPasswordForm = function() {
        document.getElementById('passwordForm').reset();
        
        // Reset password requirements display
        document.querySelectorAll('.requirement').forEach(req => {
            req.classList.remove('valid');
            req.querySelector('i').className = 'fas fa-times';
        });
    };
    
    // Accessibility preferences
    document.getElementById('reduceMotion').addEventListener('change', function() {
        const currentUser = db.getCurrentUser();
        const user = db.getUserById(currentUser.id);
        const preferences = user.preferences || {};
        preferences.reduceMotion = this.checked;
        db.updateUser(currentUser.id, { preferences: preferences });
        
        if (this.checked) {
            document.body.classList.add('reduce-motion');
        } else {
            document.body.classList.remove('reduce-motion');
        }
    });
    
    document.getElementById('highContrast').addEventListener('change', function() {
        const currentUser = db.getCurrentUser();
        const user = db.getUserById(currentUser.id);
        const preferences = user.preferences || {};
        preferences.highContrast = this.checked;
        db.updateUser(currentUser.id, { preferences: preferences });
        
        if (this.checked) {
            document.body.classList.add('high-contrast');
        } else {
            document.body.classList.remove('high-contrast');
        }
    });
    
    // Notification preferences
    const notificationInputs = [
        'recyclingReminders', 'balanceUpdates', 'marketingEmails',
        'transactionAlerts', 'partnerUpdates', 'loginNotifications'
    ];
    
    notificationInputs.forEach(inputId => {
        document.getElementById(inputId).addEventListener('change', function() {
            const currentUser = db.getCurrentUser();
            const user = db.getUserById(currentUser.id);
            const preferences = user.preferences || {};
            preferences[inputId] = this.checked;
            db.updateUser(currentUser.id, { preferences: preferences });
        });
    });
    
    // Navigation functionality - Fixed to handle proper cross-page navigation
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
    
    // Search functionality
    const searchInput = document.getElementById('globalSearchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const query = this.value.trim();
                if (query) {
                    alert(`Searching for: ${query}\n\nThis is a demo. In a real application, this would perform a global search.`);
                }
            }
        });
    }
    
    // Notification button
    const notificationBtn = document.querySelector('.notification-btn');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', function() {
            alert('Notifications:\n\n• Settings updated successfully\n• New security features available\n• Profile sync completed\n\nThis is a demo version.');
        });
    }
    
    // User menu dropdown
    const userMenu = document.querySelector('.user-menu');
    if (userMenu) {
        userMenu.addEventListener('click', function() {
            alert('User Menu:\n\n• Profile Settings\n• Account Preferences\n• Help & Support\n• Log Out\n\nThis is a demo version.');
        });
    }
    
    // 2FA functionality (demo)
    document.querySelector('.btn-outline').addEventListener('click', function() {
        alert('Two-Factor Authentication\n\nThis feature would guide you through setting up 2FA using:\n• SMS verification\n• Authenticator app\n• Email backup codes\n\nThis is a demo version.');
    });
    
    console.log('WasteWise Settings page loaded successfully!');
});