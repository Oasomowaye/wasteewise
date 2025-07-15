// Dashboard functionality with database integration
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const currentUser = window.WasteWiseDB.getCurrentUser();
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    // Initialize database
    const db = window.WasteWiseDB;
    
    // Load user data and update UI
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
    
    // Update balance display
    function updateBalanceDisplay(balance) {
        const balanceElements = document.querySelectorAll('#balanceValue, .balance-value');
        balanceElements.forEach(element => {
            if (element) {
                element.textContent = `₦${balance.toFixed(2)}`;
            }
        });
        
        // Update modal balance
        const modalBalanceElement = document.getElementById('modalBalanceAmount');
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
    
    // Auto-refresh user data every 5 seconds to catch admin updates
    setInterval(() => {
        loadUserData();
    }, 5000);
    
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
    const withdrawButtons = document.querySelectorAll('#withdrawBtn, #withdrawBtnCard, .withdraw-btn');
    
    withdrawButtons.forEach(button => {
        if (button) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Check if user has sufficient balance
                const currentUser = db.getCurrentUser();
                if (!currentUser) {
                    alert('Please log in to withdraw funds.');
                    return;
                }
                
                const user = db.getUserById(currentUser.id);
                if (!user) {
                    alert('User not found. Please log in again.');
                    return;
                }
                
                if (user.balance < 100) {
                    alert('Minimum withdrawal amount is ₦100.00\n\nYour current balance: ₦' + user.balance.toFixed(2));
                    return;
                }
                
                // Update modal balance and open modal
                updateBalanceDisplay(user.balance);
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
    window.processWithdrawal = function() {
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
        
        // Validate account number
        if (accountNumber.length !== 10 || !/^\d+$/.test(accountNumber)) {
            alert('Please enter a valid 10-digit account number.');
            return;
        }
        
        const currentUser = db.getCurrentUser();
        if (!currentUser) {
            alert('Please log in to continue.');
            return;
        }
        
        const user = db.getUserById(currentUser.id);
        if (!user) {
            alert('User not found. Please log in again.');
            return;
        }
        
        const processingFee = 50;
        const totalDeduction = amount + processingFee;
        
        // Check if user has sufficient balance
        if (user.balance < totalDeduction) {
            alert(`Insufficient balance.\n\nRequired: ₦${totalDeduction.toFixed(2)} (₦${amount.toFixed(2)} + ₦${processingFee.toFixed(2)} fee)\nAvailable: ₦${user.balance.toFixed(2)}`);
            return;
        }
        
        // Show processing state
        const processBtn = document.getElementById('processWithdrawalBtn');
        if (processBtn) {
            processBtn.textContent = 'Processing...';
            processBtn.disabled = true;
        }
        
        setTimeout(() => {
            try {
                // Create withdrawal transaction
                const transaction = db.addTransaction({
                    userId: user.id,
                    type: 'withdrawal',
                    amount: amount,
                    description: `Withdrawal to ${bankName} - ${accountNumber}`,
                    status: 'pending',
                    reference: `WTH${Date.now()}`
                });
                
                // Create withdrawal request for admin
                const withdrawalRequest = db.addWithdrawalRequest({
                    userId: user.id,
                    userName: user.name,
                    userEmail: user.email,
                    amount: amount,
                    processingFee: processingFee,
                    totalDeduction: totalDeduction,
                    bankName: bankName,
                    accountNumber: accountNumber,
                    accountName: accountName,
                    status: 'pending',
                    transactionId: transaction.id
                });
                
                // Deduct amount from user balance
                const newBalance = user.balance - totalDeduction;
                db.updateUser(user.id, { balance: newBalance });
                
                // Update UI
                updateBalanceDisplay(newBalance);
                
                // Reset form
                form.reset();
                
                // Close modal
                closeModal('withdrawalModal');
                
                // Show success message
                alert(`Withdrawal Request Submitted Successfully!\n\nRequest ID: ${withdrawalRequest.id}\nAmount: ₦${amount.toFixed(2)}\nProcessing Fee: ₦${processingFee.toFixed(2)}\nTotal Deducted: ₦${totalDeduction.toFixed(2)}\n\nYour withdrawal request is being processed and will be reviewed by our admin team. You will receive a confirmation email once approved.`);
                
            } catch (error) {
                console.error('Withdrawal error:', error);
                alert('An error occurred while processing your withdrawal. Please try again.');
            } finally {
                // Reset button state
                if (processBtn) {
                    processBtn.textContent = 'Process Withdrawal';
                    processBtn.disabled = false;
                }
            }
        }, 2000);
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
    
    // Load user data on page load
    loadUserData();
    
    // Listen for storage changes (when admin updates from another tab)
    window.addEventListener('storage', function(e) {
        if (e.key === 'wastewise_users') {
            loadUserData();
        }
    });
});