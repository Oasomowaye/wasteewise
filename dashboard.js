// Dashboard functionality with database integration
let currentUser = null;

firebase.auth().onAuthStateChanged(async function(user) {
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    currentUser = user;
    // Fetch user data from Firestore
    const userDocRef = firebase.firestore().collection('users').doc(user.uid);
    let userDoc = await userDocRef.get();
    if (!userDoc.exists) {
        // Create user document if it doesn't exist
        await userDocRef.set({
            displayName: user.displayName || user.email || '',
            email: user.email || '',
            balance: 0,
            recycledWeight: 0,
            points: 0,
            status: 'active',
            joinDate: new Date().toISOString()
        });
        userDoc = await userDocRef.get();
    }
    const userData = userDoc.data();
    updateBalanceDisplay();
    updateRecycleDisplay(userData.recycledWeight || 0);
    updatePointsDisplay(userData.points || 0);
    // Update user name in sidebar
    const userNameElement = document.querySelector('.user-info h3');
    if (userNameElement) {
        userNameElement.textContent = user.displayName || user.email || '';
    }
});

// Update balance display
async function updateBalanceDisplay() {
    if (!currentUser) return;
    const userDoc = await firebase.firestore().collection('users').doc(currentUser.uid).get();
    const balance = userDoc.exists ? userDoc.data().balance || 0 : 0;
    const balanceElements = document.querySelectorAll('#balanceValue, .balance-value');
    const modalBalanceElement = document.getElementById('modalBalanceAmount');
    balanceElements.forEach(element => {
        element.textContent = `₦${balance.toFixed(2)}`;
    });
    if (modalBalanceElement) {
        modalBalanceElement.textContent = `₦${balance.toFixed(2)}`;
    }
}

// Update recycle display
function updateRecycleDisplay(weight) {
    const recycleElements = document.querySelectorAll('#recycleValue, .recycle-amount');
    recycleElements.forEach(element => {
        if (element) {
            element.textContent = `${weight.toFixed(1)}kg`;
        }
    });
}

// Update points display
function updatePointsDisplay(points) {
    const pointsElements = document.querySelectorAll('.points-amount');
    pointsElements.forEach(element => {
        if (element) {
            element.textContent = points.toString();
        }
    });
}

// Visibility toggle functionality
let isBalanceVisible = true;
const toggleButtons = document.querySelectorAll('.toggle-visibility, #balanceVisibilityBtn');
const balanceElements = document.querySelectorAll('.balance-amount, #balanceValue, .balance-value');

toggleButtons.forEach(button => {
    if (button) {
        button.addEventListener('click', function() {
            isBalanceVisible = !isBalanceVisible;
            const icon = this.querySelector('i');
            
            balanceElements.forEach(element => {
                if (isBalanceVisible) {
                    element.style.filter = 'none';
                    if (icon) icon.className = 'fas fa-eye';
                } else {
                    element.style.filter = 'blur(5px)';
                    if (icon) icon.className = 'fas fa-eye-slash';
                }
            });
        });
    }
});

// Withdraw button functionality
const withdrawButtons = document.querySelectorAll('#withdrawBtn, #withdrawBtnCard, .withdraw-btn, .exchange-btn');
withdrawButtons.forEach(button => {
    if (button) {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            // Open withdrawal modal
            openModal('withdrawalModal');
        });
    }
});

// Withdrawal form functionality
const withdrawalForm = document.getElementById('withdrawalForm');
if (withdrawalForm) {
    const withdrawAmountInput = document.getElementById('withdrawAmount');
    const summaryAmount = document.getElementById('summaryAmount');
    const summaryFee = document.getElementById('summaryFee');
    const summaryTotal = document.getElementById('summaryTotal');
    const summaryReceive = document.getElementById('summaryReceive');
    
    // Update summary when amount changes
    if (withdrawAmountInput) {
        withdrawAmountInput.addEventListener('input', function() {
            const amount = parseFloat(this.value) || 0;
            const fee = 50; // Fixed processing fee
            const total = amount + fee;
            const receive = amount;
            
            if (summaryAmount) summaryAmount.textContent = `₦${amount.toFixed(2)}`;
            if (summaryFee) summaryFee.textContent = `₦${fee.toFixed(2)}`;
            if (summaryTotal) summaryTotal.textContent = `₦${total.toFixed(2)}`;
            if (summaryReceive) summaryReceive.textContent = `₦${receive.toFixed(2)}`;
        });
    }
}

// Process withdrawal function
window.processWithdrawal = async function() {
    const form = document.getElementById('withdrawalForm');
    if (!form) return;

    // Get form data
    const amount = parseFloat(document.getElementById('withdrawAmount').value);
    const bankName = document.getElementById('bankName').value;
    const accountNumber = document.getElementById('accountNumber').value;
    const accountName = document.getElementById('accountName').value;

    // Validate form
    if (!amount || amount < 100) {
        alert('Please enter a valid withdrawal amount (minimum ₦100).');
        return;
    }
    if (!bankName || !accountNumber || !accountName) {
        alert('Please fill in all required fields.');
        return;
    }
    if (accountNumber.length !== 10 || !/^\d+$/.test(accountNumber)) {
        alert('Please enter a valid 10-digit account number.');
        return;
    }

    // Firebase Auth user
    const user = firebase.auth().currentUser;
    if (!user) {
        alert('Please log in to continue.');
        return;
    }
    // Get user balance from Firestore
    const userDocRef = firebase.firestore().collection('users').doc(user.uid);
    const userDoc = await userDocRef.get();
    if (!userDoc.exists) {
        alert('User not found. Please log in again.');
        return;
    }
    const userData = userDoc.data();
    const balance = userData.balance || 0;
    const processingFee = 50;
    const totalDeduction = amount + processingFee;
    if (balance < totalDeduction) {
        alert(`Insufficient balance.\n\nRequired: ₦${totalDeduction.toFixed(2)} (₦${amount.toFixed(2)} + ₦${processingFee.toFixed(2)} fee)\nAvailable: ₦${balance.toFixed(2)}`);
        return;
    }
    // Show processing state
    const processBtn = document.getElementById('processWithdrawalBtn');
    if (processBtn) {
        processBtn.textContent = 'Processing...';
        processBtn.disabled = true;
    }
    try {
        // Add withdrawal record to Firestore
        const withdrawalRef = await firebase.firestore().collection('withdrawals').add({
            userId: user.uid,
            userName: user.displayName || user.email,
            userEmail: user.email,
            amount: amount,
            processingFee: processingFee,
            totalDeduction: totalDeduction,
            bankName: bankName,
            accountNumber: accountNumber,
            accountName: accountName,
            status: 'pending',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        // Update user balance in Firestore
        await userDocRef.update({ balance: balance - totalDeduction });
        // Update UI
        updateBalanceDisplay();
        form.reset();
        closeModal('withdrawalModal');
        alert(`Withdrawal Request Submitted Successfully!\n\nRequest ID: ${withdrawalRef.id}\nAmount: ₦${amount.toFixed(2)}\nProcessing Fee: ₦${processingFee.toFixed(2)}\nTotal Deducted: ₦${totalDeduction.toFixed(2)}\n\nYour withdrawal request is being processed and will be reviewed by our admin team. You will receive a confirmation email once approved.`);
    } catch (error) {
        console.error('Withdrawal error:', error);
        alert('An error occurred while processing your withdrawal. Please try again.');
    } finally {
        if (processBtn) {
            processBtn.textContent = 'Process Withdrawal';
            processBtn.disabled = false;
        }
    }
};

// Modal functions
window.openModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
};

window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
};

// Close modal when clicking outside
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
});

// Firebase Auth: Update user info and handle logout
window.addEventListener('DOMContentLoaded', function() {
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
});

// If you want auto-refresh, use setInterval(() => updateBalanceDisplay(), 5000);