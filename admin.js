// Admin Dashboard functionality with database integration
document.addEventListener('DOMContentLoaded', function() {
    // Check admin authentication
    if (!window.AdminAuth || !window.AdminAuth.requireAuth()) {
        return; // Will redirect to login
    }
    
    // Initialize dashboard
    initializeDashboard();
    
    // Auto-refresh every 30 seconds
    setInterval(() => {
        updateDashboardStats();
        loadRecentUsers();
        loadRecentTransactions();
        loadBalanceManagement();
        loadWithdrawalRequests();
    }, 30000);
    
    // Navigation functionality
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            const section = this.getAttribute('data-section');
            
            if (href === '#logout') {
                e.preventDefault();
                handleLogout();
                return;
            }
            
            // Allow all .html file navigation to proceed normally
            if (href && href.endsWith('.html')) {
                return;
            }
            
            // Handle admin section navigation
            if (section) {
                e.preventDefault();
                handleNavigation(section);
                
                // Update active nav item
                document.querySelectorAll('.nav-item').forEach(item => {
                    item.classList.remove('active');
                });
                this.closest('.nav-item').classList.add('active');
            }
        });
    });
    
    // Search functionality
    const userSearchInput = document.getElementById('userSearchInput');
    if (userSearchInput) {
        userSearchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase();
            filterBalanceTable(query);
        });
    }
    
    // Add balance button
    const addBalanceBtn = document.getElementById('addBalanceBtn');
    if (addBalanceBtn) {
        addBalanceBtn.addEventListener('click', function() {
            populateUserSelect();
            openModal('addBalanceModal');
        });
    }
    
    // Action type change handler
    window.toggleActionInputs = function() {
        const actionType = document.getElementById('actionType').value;
        const amountLabel = document.getElementById('amountLabel');
        const currencySymbol = document.getElementById('currencySymbol');
        const actionAmount = document.getElementById('actionAmount');
        
        switch(actionType) {
            case 'add_balance':
                amountLabel.textContent = 'Amount to Add';
                currencySymbol.textContent = '₦';
                currencySymbol.style.display = 'block';
                break;
            case 'deduct_balance':
                amountLabel.textContent = 'Amount to Deduct';
                currencySymbol.textContent = '₦';
                currencySymbol.style.display = 'block';
                break;
            case 'add_points':
                amountLabel.textContent = 'Points to Add (kg)';
                currencySymbol.textContent = 'kg';
                currencySymbol.style.display = 'block';
                break;
            case 'deduct_points':
                amountLabel.textContent = 'Points to Deduct (kg)';
                currencySymbol.textContent = 'kg';
                currencySymbol.style.display = 'block';
                break;
            case 'set_balance':
                amountLabel.textContent = 'New Balance Amount';
                currencySymbol.textContent = '₦';
                currencySymbol.style.display = 'block';
                break;
            case 'set_points':
                amountLabel.textContent = 'New Points Amount (kg)';
                currencySymbol.textContent = 'kg';
                currencySymbol.style.display = 'block';
                break;
        }
        
        // Update preview when action type changes
        actionAmount.removeEventListener('input', updatePreview);
        actionAmount.addEventListener('input', updatePreview);
        updatePreview();
    };
    
    // Update preview function
    function updatePreview() {
        const actionType = document.getElementById('actionType').value;
        const currentBalance = parseFloat(document.getElementById('currentBalance').value) || 0;
        const currentPoints = parseFloat(document.getElementById('currentPoints').value) || 0;
        const actionAmount = parseFloat(document.getElementById('actionAmount').value) || 0;
        
        let newBalance = currentBalance;
        let newPoints = currentPoints;
        
        switch(actionType) {
            case 'add_balance':
                newBalance = currentBalance + actionAmount;
                break;
            case 'deduct_balance':
                newBalance = Math.max(0, currentBalance - actionAmount);
                break;
            case 'add_points':
                newPoints = currentPoints + actionAmount;
                break;
            case 'deduct_points':
                newPoints = Math.max(0, currentPoints - actionAmount);
                break;
            case 'set_balance':
                newBalance = actionAmount;
                break;
            case 'set_points':
                newPoints = actionAmount;
                break;
        }
        
        document.getElementById('previewBalance').textContent = `₦${newBalance.toFixed(2)}`;
        document.getElementById('previewPoints').textContent = `${newPoints.toFixed(1)}kg`;
    }
    
    // Initialize dashboard statistics
    async function initializeDashboard() {
        await updateDashboardStats();
        await loadRecentUsers();
        await loadRecentTransactions();
        await loadBalanceManagement();
        await loadWithdrawalRequests();
    }
    
    // Update dashboard statistics
    async function updateDashboardStats() {
        const users = await fetchUsers();
        const withdrawals = await fetchWithdrawals();
        const pickupRequests = await fetchPickupRequests();
        console.log('Dashboard stats users:', users.length, users);
        let totalUsers = users.length;
        let totalRecycled = users.reduce((sum, u) => sum + (u.recycledWeight || 0), 0);
        let totalPoints = users.reduce((sum, u) => sum + (u.points || 0), 0);
        let totalWithdrawals = withdrawals.reduce((sum, w) => sum + (w.amount || 0), 0);
        let overallBalance = users.reduce((sum, u) => sum + (u.balance || 0), 0);
        document.getElementById('totalUsers').textContent = totalUsers;
        document.getElementById('totalRecycled').textContent = `${totalRecycled.toFixed(1)} kg`;
        document.getElementById('totalPoints').textContent = totalPoints;
        document.getElementById('totalWithdrawals').textContent = `₦${totalWithdrawals.toFixed(2)}`;
        document.getElementById('overallBalance').textContent = `₦${overallBalance.toFixed(2)}`;
        document.getElementById('totalPickupRequests').textContent = pickupRequests.length;
    }
    
    // Load recent users
    async function loadRecentUsers() {
        const users = await fetchUsers();
        const tbody = document.getElementById('recentUsersTable');
        tbody.innerHTML = '';
        users.slice(0, 5).forEach(user => {
            const row = document.createElement('tr');
            const joinDate = user.joinDate ? new Date(user.joinDate).toLocaleDateString() : '';
            row.innerHTML = `
                <td>${getDisplayName(user)}</td>
                <td>${user.email}</td>
                <td>${joinDate}</td>
                <td><span class="status ${user.status}">${user.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : ''}</span></td>
                <td>
                    <button class="action-btn edit" onclick="editUserBalance('${user.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn view" onclick="viewUser('${user.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }
    
    // Load recent transactions
    async function loadRecentTransactions() {
        const transactions = await fetchTransactions();
        const tbody = document.getElementById('recentTransactionsTable');
        tbody.innerHTML = '';
        if (transactions.length === 0) {
            tbody.innerHTML = `
                <tr class="no-data">
                    <td colspan="5">
                        <div class="no-data-message">
                            <i class="fas fa-exchange-alt"></i>
                            <p>No transactions found</p>
                        </div>
                    </td>
                </tr>
            `;
        } else {
            transactions.slice(0, 5).forEach(transaction => {
                const row = document.createElement('tr');
                const date = transaction.date ? new Date(transaction.date).toLocaleDateString() : '';
                let amountDisplay = `₦${Math.abs(transaction.amount || 0).toFixed(2)}`;
                row.innerHTML = `
                    <td>${transaction.id}</td>
                    <td>${transaction.userName || ''}</td>
                    <td>${amountDisplay}</td>
                    <td>${transaction.type || ''}</td>
                    <td>${date}</td>
                `;
                tbody.appendChild(row);
            });
        }
    }
    
    // Load balance management table
    async function loadBalanceManagement() {
        const users = await fetchUsers();
        const tbody = document.getElementById('balanceManagementTable');
        tbody.innerHTML = '';
        users.forEach(user => {
            const initials = user.name ? user.name.split(' ').map(n => n[0]).join('') : '';
            const row = document.createElement('tr');
            const lastUpdated = user.lastUpdated ? new Date(user.lastUpdated).toLocaleDateString() : '';
            row.innerHTML = `
                <td>
                    <div class="user-info">
                        <div class="user-avatar-small">${initials}</div>
                        <span>${getDisplayName(user)}</span>
                    </div>
                </td>
                <td>${user.email}</td>
                <td class="balance-amount">₦${(user.balance || 0).toFixed(2)}</td>
                <td class="points-amount">${(user.recycledWeight || 0).toFixed(1)}kg</td>
                <td>${lastUpdated}</td>
                <td>
                    <button class="balance-action-btn edit" onclick="window.editBalance('${user.id}')">
                        <i class="fas fa-edit"></i>
                        Edit
                    </button>
                    <button class="balance-action-btn history" onclick="viewBalanceHistory('${user.id}')">
                        <i class="fas fa-history"></i>
                        History
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }
    
    // Load withdrawal requests
    async function loadWithdrawalRequests() {
        const withdrawals = await fetchWithdrawals();
        const tbody = document.getElementById('withdrawalRequestsTable', );
        const pendingCount = document.getElementById('pendingWithdrawalsCount');
        if (!tbody) return;
        tbody.innerHTML = '';
        const pendingRequests = withdrawals.filter(req => req.status === 'pending');
        pendingCount.textContent = `${pendingRequests.length} Pending`;
        if (withdrawals.length === 0) {
            tbody.innerHTML = `
                <tr class="no-data">
                    <td colspan="7">
                        <div class="no-data-message">
                            <i class="fas fa-money-bill-wave"></i>
                            <p>No withdrawal requests found</p>
                        </div>
                    </td>
                </tr>
            `;
        } else {
            withdrawals.slice(0, 10).forEach(request => {
                const row = document.createElement('tr');
                const requestDate = request.createdAt && request.createdAt.toDate ? request.createdAt.toDate().toLocaleDateString() : '';
                let statusClass = 'pending';
                if (request.status === 'completed') statusClass = 'active';
                if (request.status === 'rejected') statusClass = 'inactive';
                row.innerHTML = `
                    <td>${request.id}</td>
                    <td>
                        <div class="user-info">
                            <span>${request.userName}</span>
                            <small>${request.userEmail}</small>
                        </div>
                    </td>
                    <td class="balance-amount">₦${(request.amount || 0).toFixed(2)}</td>
                    <td>
                        <div style="font-size: 0.75rem;">
                            <div><strong>${request.bankName}</strong></div>
                            <div>${request.accountNumber}</div>
                            <div>${request.accountName}</div>
                        </div>
                    </td>
                    <td><span class="status ${statusClass}">${request.status}</span></td>
                    <td>${requestDate}</td>
                    <td>
                        ${request.status === 'pending' ? `
                            <button class="balance-action-btn edit" onclick="approveWithdrawal('${request.id}')" style="background: #22c55e; color: white;">
                                <i class="fas fa-check"></i>
                                Approve
                            </button>
                            <button class="balance-action-btn history" onclick="rejectWithdrawal('${request.id}')" style="background: #ef4444; color: white;">
                                <i class="fas fa-times"></i>
                                Reject
                            </button>
                        ` : `
                            <button class="balance-action-btn history" onclick="viewWithdrawalDetails('${request.id}')">
                                <i class="fas fa-eye"></i>
                                View
                            </button>
                        `}
                    </td>
                `;
                tbody.appendChild(row);
            });
        }
    }
    
    // Approve withdrawal
    window.approveWithdrawal = async function(requestId) {
        const withdrawals = await fetchWithdrawals();
        const request = withdrawals.find(req => req.id === requestId);
        if (!request) return;
        const confirmApproval = confirm(`Approve withdrawal request?\n\nUser: ${request.userName}\nAmount: ₦${request.amount.toFixed(2)}\nBank: ${request.bankName}\nAccount: ${request.accountNumber}\n\nThis action cannot be undone.`);
        if (confirmApproval) {
            await updateWithdrawal(requestId, {
                status: 'completed',
                processedBy: 'Admin',
                processedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            await addAdminTransaction({
                userId: request.userId,
                userName: getDisplayName(request),
                action: 'withdrawal_approved',
                amount: request.amount,
                reason: `Withdrawal approved - ${request.bankName} ${request.accountNumber}`,
                adminName: 'Admin',
                type: 'Withdrawal Approved'
            });
            await loadWithdrawalRequests();
            await updateDashboardStats();
            alert(`Withdrawal approved successfully!\n\nAmount: ₦${request.amount.toFixed(2)} has been processed for ${request.userName}.`);
        }
    };
    
    // Reject withdrawal
    window.rejectWithdrawal = async function(requestId) {
        const withdrawals = await fetchWithdrawals();
        const request = withdrawals.find(req => req.id === requestId);
        if (!request) return;
        const reason = prompt(`Reject withdrawal request for ${request.userName}?\n\nAmount: ₦${request.amount.toFixed(2)}\n\nPlease provide a reason for rejection:`);
        if (reason !== null && reason.trim()) {
            await updateWithdrawal(requestId, {
                status: 'rejected',
                rejectionReason: reason.trim(),
                processedBy: 'Admin',
                processedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            // Refund user balance
            const user = (await fetchUsers()).find(u => u.id === request.userId);
            if (user) {
                await updateUser(request.userId, { balance: (user.balance || 0) + (request.totalDeduction || 0) });
            }
            await addAdminTransaction({
                userId: request.userId,
                userName: getDisplayName(request),
                action: 'withdrawal_rejected',
                amount: request.totalDeduction,
                reason: `Withdrawal rejected: ${reason.trim()}`,
                adminName: 'Admin',
                type: 'Withdrawal Rejected'
            });
            await loadWithdrawalRequests();
            await loadBalanceManagement();
            await updateDashboardStats();
            alert(`Withdrawal rejected and balance refunded.\n\nUser: ${request.userName}\nRefunded: ₦${request.totalDeduction.toFixed(2)}\nReason: ${reason.trim()}`);
        }
    };
    
    // Withdrawal management functions
    window.viewWithdrawalDetails = function(requestId) {
        const request = db.getWithdrawalRequests().find(req => req.id === requestId);
        if (!request) return;
        
        const requestDate = request.createdAt && request.createdAt.toDate ? request.createdAt.toDate().toLocaleDateString() : 'N/A';
        const processedDate = request.processedAt && request.processedAt.toDate ? request.processedAt.toDate().toLocaleDateString() : 'N/A';
        
        let details = `Withdrawal Request Details\n\n`;
        details += `Request ID: ${request.id}\n`;
        details += `User: ${request.userName}\n`;
        details += `Email: ${request.userEmail}\n`;
        details += `Amount: ₦${request.amount.toFixed(2)}\n`;
        details += `Processing Fee: ₦${request.processingFee.toFixed(2)}\n`;
        details += `Total Deducted: ₦${request.totalDeduction.toFixed(2)}\n`;
        details += `Bank: ${request.bankName}\n`;
        details += `Account Number: ${request.accountNumber}\n`;
        details += `Account Name: ${request.accountName}\n`;
        details += `Status: ${request.status.toUpperCase()}\n`;
        details += `Request Date: ${requestDate}\n`;
        details += `Processed Date: ${processedDate}\n`;
        
        if (request.rejectionReason) {
            details += `Rejection Reason: ${request.rejectionReason}\n`;
        }
        
        alert(details);
    };
    
    // Populate user select dropdown
    function populateUserSelect() {
        fetchUsers().then(users => {
            const select = document.getElementById('selectUser');
            select.innerHTML = '<option value="">Choose a user...</option>';
            
            users.forEach(user => {
                const option = document.createElement('option');
                option.value = user.id;
                option.textContent = `${getDisplayName(user)} (${user.email})`;
                select.appendChild(option);
            });
        });
    }
    
    // Filter balance table
    function filterBalanceTable(query) {
        const rows = document.querySelectorAll('#balanceManagementTable tr');
        
        rows.forEach(row => {
            const name = row.querySelector('.user-info span')?.textContent.toLowerCase() || '';
            const email = row.cells[1]?.textContent.toLowerCase() || '';
            
            if (name.includes(query) || email.includes(query)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }
    
    // Handle navigation
    function handleNavigation(section) {
        switch(section) {
            case 'dashboard':
                // Already on dashboard
                window.scrollTo({ top: 0, behavior: 'smooth' });
                break;
            case 'users':
                // Scroll to balance management section (users)
                const balanceSection = document.querySelector('.balance-management-section');
                if (balanceSection) {
                    balanceSection.scrollIntoView({ behavior: 'smooth' });
                }
                break;
            case 'transactions':
                // Scroll to recent transactions or show transactions management
                const transactionsSection = document.querySelector('.dashboard-section .exchange-log');
                if (transactionsSection) {
                    transactionsSection.scrollIntoView({ behavior: 'smooth' });
                }
                break;
            case 'withdrawals':
                // Scroll to withdrawal requests section
                const withdrawalSection = document.getElementById('withdrawalRequestsSection');
                if (withdrawalSection) {
                    withdrawalSection.scrollIntoView({ behavior: 'smooth' });
                }
                break;
            default:
                alert(`${section.charAt(0).toUpperCase() + section.slice(1)} Management\n\nThis would show the ${section} management interface.`);
        }
    }
    
    // Handle logout
    function handleLogout() {
        const confirmLogout = confirm('Are you sure you want to log out of the admin panel?');
        if (confirmLogout) {
            // Use AdminAuth to handle logout
            window.AdminAuth.logout();
        }
    }
    
    // Global functions for button handlers
    window.editUserBalance = async function(userId) {
        const users = await fetchUsers();
        const user = users.find(u => u.id === userId);
        if (user) {
            editBalance(userId);
        }
    };
    
    window.viewUser = async function(userId) {
        const users = await fetchUsers();
        const user = users.find(u => u.id === userId);
        if (user) {
            const joinDate = user.joinDate ? new Date(user.joinDate).toLocaleDateString() : '';
            alert(`User Details:\n\nName: ${user.name}\nEmail: ${user.email}\nJoin Date: ${joinDate}\nStatus: ${user.status}\nBalance: ₦${user.balance.toFixed(2)}\nRecycling Points: ${user.recycledWeight.toFixed(1)}kg\nTotal Points: ${user.points}\n\nThis would open a detailed user profile page.`);
        }
    };
    
    window.editBalance = async function(userId) {
        const users = await fetchUsers();
        const user = users.find(u => u.id === userId);
        if (!user) return;
        window.currentEditingUserId = userId;
        if (!user) {
            alert('User not found.');
            return;
        }
        const initials = user.name ? user.name.split(' ').map(n => n[0]).join('') : '';
        document.getElementById('modalUserAvatar').textContent = initials;
        document.getElementById('modalUserName').textContent = user.name || '';
        document.getElementById('modalUserEmail').textContent = user.email || '';
        document.getElementById('currentBalance').value = typeof user.balance === 'number' ? user.balance.toFixed(2) : '0.00';
        document.getElementById('currentPoints').value = typeof user.recycledWeight === 'number' ? user.recycledWeight.toFixed(1) : '0.0';
        document.getElementById('actionType').value = 'add_balance';
        document.getElementById('actionAmount').value = '';
        document.getElementById('actionReason').value = '';
        window.toggleActionInputs();
        window.openModal('editBalanceModal');
    };
    
    window.viewBalanceHistory = async function(userId) {
        const users = await fetchUsers();
        const user = users.find(u => u.id === userId);
        const adminTransactions = await fetchTransactions();
        const userTransactions = adminTransactions.filter(t => t.userId === userId);
        if (!userTransactions.length) {
            alert(`Balance History for ${user.name}\n\nNo balance changes found.\n\nThis user hasn't had any admin-initiated balance changes yet.`);
            return;
        }
        let historyText = `Balance History for ${user.name}\n\n`;
        userTransactions.slice(0, 10).forEach(transaction => {
            const date = transaction.date && transaction.date.toDate ? transaction.date.toDate().toLocaleDateString() : '';
            let amountDisplay = '';
            if (transaction.action && transaction.action.includes('balance')) {
                amountDisplay = `₦${Math.abs(transaction.amount || 0).toFixed(2)}`;
            } else if (transaction.action && transaction.action.includes('points')) {
                amountDisplay = `${Math.abs(transaction.amount || 0).toFixed(1)}kg`;
            } else {
                amountDisplay = `₦${Math.abs(transaction.amount || 0).toFixed(2)}`;
            }
            historyText += `${date} - ${transaction.type}: ${amountDisplay}\nReason: ${transaction.reason}\n\n`;
        });
        alert(historyText);
    };
    
    window.saveBalanceChanges = async function() {
        const userId = window.currentEditingUserId;
        const users = await fetchUsers();
        const user = users.find(u => u.id === userId);
        if (!user) return;
        const actionType = document.getElementById('actionType').value;
        const actionAmount = parseFloat(document.getElementById('actionAmount').value);
        const actionReason = document.getElementById('actionReason').value;
        if (!actionAmount || actionAmount < 0) {
            alert('Please enter a valid amount.');
            return;
        }
        if (!actionReason.trim()) {
            alert('Please provide a reason for this action.');
            return;
        }
        const oldBalance = user.balance;
        const oldPoints = user.recycledWeight;
        let newBalance = oldBalance;
        let newPoints = oldPoints;
        switch(actionType) {
            case 'add_balance':
                newBalance = oldBalance + actionAmount;
                break;
            case 'deduct_balance':
                newBalance = Math.max(0, oldBalance - actionAmount);
                break;
            case 'add_points':
                newPoints = oldPoints + actionAmount;
                break;
            case 'deduct_points':
                newPoints = Math.max(0, oldPoints - actionAmount);
                break;
            case 'set_balance':
                newBalance = actionAmount;
                break;
            case 'set_points':
                newPoints = actionAmount;
                break;
        }
        await updateUser(userId, { 
            balance: newBalance, 
            recycledWeight: newPoints,
            lastUpdated: new Date().toISOString()
        });
        await addAdminTransaction({
            userId: userId,
            userName: getDisplayName(user),
            action: actionType,
            oldBalance: oldBalance,
            newBalance: newBalance,
            oldPoints: oldPoints,
            newPoints: newPoints,
            amount: actionType.includes('balance') ? (newBalance - oldBalance) : (newPoints - oldPoints),
            reason: actionReason,
            adminName: 'Admin',
            type: actionType.replace('_', ' ').toUpperCase()
        });
        updateDashboardStats();
        loadRecentUsers();
        loadRecentTransactions();
        loadBalanceManagement();
        let changeAmount = '';
        if (actionType.includes('balance')) {
            changeAmount = `₦${Math.abs(newBalance - oldBalance).toFixed(2)}`;
        } else {
            changeAmount = `${Math.abs(newPoints - oldPoints).toFixed(1)}kg`;
        }
        alert(`User Updated Successfully!\n\nUser: ${user.name}\nAction: ${actionType.replace('_', ' ').toUpperCase()}\nAmount Changed: ${changeAmount}\nReason: ${actionReason}\n\nOld Balance: ₦${oldBalance.toFixed(2)} → New Balance: ₦${newBalance.toFixed(2)}\nOld Recycling Points: ${oldPoints.toFixed(1)}kg → New Recycling Points: ${newPoints.toFixed(1)}kg\n\nChanges will be reflected in the user dashboard immediately.`);
        closeModal('editBalanceModal');
    };
    
    window.saveBulkBalance = async function() {
        const selectedUserId = document.getElementById('selectUser').value;
        const bulkActionType = document.getElementById('bulkActionType').value;
        const bulkAmount = parseFloat(document.getElementById('bulkAmount').value);
        const bulkReason = document.getElementById('bulkReason').value;
        if (!selectedUserId) {
            alert('Please select a user.');
            return;
        }
        if (!bulkAmount || bulkAmount <= 0) {
            alert('Please enter a valid amount.');
            return;
        }
        if (!bulkReason.trim()) {
            alert('Please provide a reason for this action.');
            return;
        }
        const users = await fetchUsers();
        let user = users.find(u => u.id === selectedUserId);
        let oldBalance = 0;
        let oldPoints = 0;
        if (!user) {
            user = {
                id: selectedUserId,
                name: document.getElementById('selectUser').selectedOptions[0]?.textContent.split(' (')[0] || '',
                email: '',
                balance: 0,
                recycledWeight: 0,
                status: 'active',
                joinDate: new Date().toISOString()
            };
            await firebase.firestore().collection('users').doc(selectedUserId).set(user, { merge: true });
        } else {
            oldBalance = typeof user.balance === 'number' ? user.balance : 0;
            oldPoints = typeof user.recycledWeight === 'number' ? user.recycledWeight : 0;
        }
        let newBalance = oldBalance;
        let newPoints = oldPoints;
        if (bulkActionType === 'add_balance') {
            newBalance = oldBalance + bulkAmount;
        } else if (bulkActionType === 'add_points') {
            newPoints = oldPoints + bulkAmount;
        }
        await firebase.firestore().collection('users').doc(selectedUserId).set({ 
            balance: typeof newBalance === 'number' ? newBalance : 0, 
            recycledWeight: typeof newPoints === 'number' ? newPoints : 0,
            lastUpdated: new Date().toISOString()
        }, { merge: true });
        await addAdminTransaction({
            userId: selectedUserId,
            userName: getDisplayName(user),
            action: bulkActionType,
            oldBalance: oldBalance,
            newBalance: newBalance,
            oldPoints: oldPoints,
            newPoints: newPoints,
            amount: bulkAmount,
            reason: bulkReason,
            adminName: 'Admin',
            type: bulkActionType.replace('_', ' ').toUpperCase()
        });
        updateDashboardStats();
        loadRecentUsers();
        loadRecentTransactions();
        loadBalanceManagement();
        document.getElementById('addBalanceForm').reset();
        let changeAmount = '';
        if (bulkActionType === 'add_balance') {
            changeAmount = `₦${bulkAmount.toFixed(2)}`;
        } else {
            changeAmount = `${bulkAmount.toFixed(1)}kg`;
        }
        alert(`User Updated Successfully!\n\nUser: ${user.name}\nAction: ${bulkActionType.replace('_', ' ').toUpperCase()}\nAmount Added: ${changeAmount}\nReason: ${bulkReason}\n\nChanges will be reflected in the user dashboard immediately.`);
        closeModal('addBalanceModal');
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
    
    // View all buttons
    document.getElementById('viewAllUsers')?.addEventListener('click', function() {
        const users = db.getUsers();
        let usersList = 'All Users:\n\n';
        users.forEach(user => {
            usersList += `${user.name} (${user.email})\nBalance: ₦${user.balance.toFixed(2)} | Recycling Points: ${user.recycledWeight.toFixed(1)}kg\nStatus: ${user.status}\n\n`;
        });
        alert(usersList);
    });
    
    document.getElementById('viewAllTransactions')?.addEventListener('click', function() {
        const transactions = db.getAdminTransactions();
        if (transactions.length === 0) {
            alert('No admin transactions found.');
            return;
        }
        
        let transactionsList = 'All Admin Transactions:\n\n';
        transactions.slice(0, 10).forEach(transaction => {
            const date = transaction.date && transaction.date.toDate ? transaction.date.toDate().toLocaleDateString() : '';
            transactionsList += `${transaction.id} - ${transaction.userName}\n${transaction.type} | ${date}\nReason: ${transaction.reason}\n\n`;
        });
        alert(transactionsList);
    });
    
    console.log('WasteWise Admin Dashboard loaded successfully!');
});

// Mobile menu toggle for admin
function toggleAdminSidebar() {
    const sidebar = document.querySelector('.admin-sidebar');
    sidebar.classList.toggle('open');
}

// Add mobile menu button if needed
if (window.innerWidth <= 768) {
    const header = document.querySelector('.admin-header .header-left');
    if (header) {
        const menuBtn = document.createElement('button');
        menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        menuBtn.className = 'mobile-menu-btn';
        menuBtn.style.cssText = 'background: none; border: none; font-size: 1.25rem; color: #6b7280; cursor: pointer; margin-right: 1rem;';
        menuBtn.onclick = toggleAdminSidebar;
        header.insertBefore(menuBtn, header.firstChild);
    }
}

// Replace all local DB logic with Firebase Firestore
// Helper: fetch users from Firestore
async function fetchUsers() {
    if (!window.firebase || !firebase.firestore) {
        console.error('Firebase Firestore is not available.');
        return [];
    }
    try {
        const snapshot = await firebase.firestore().collection('users').get();
        const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('Fetched users from Firestore:', users);
        return users;
    } catch (error) {
        console.error('Error fetching users from Firestore:', error);
        return [];
    }
}
// Helper: fetch transactions from Firestore
async function fetchTransactions() {
    if (!window.firebase || !firebase.firestore) {
        console.error('Firebase Firestore is not available.');
        return [];
    }
    try {
        const snapshot = await firebase.firestore().collection('transactions').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error fetching transactions from Firestore:', error);
        return [];
    }
}
// Helper: fetch withdrawals from Firestore
async function fetchWithdrawals() {
    if (!window.firebase || !firebase.firestore) {
        console.error('Firebase Firestore is not available.');
        return [];
    }
    try {
        const snapshot = await firebase.firestore().collection('withdrawals').get();
        const withdrawals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('Fetched withdrawals from Firestore:', withdrawals);
        return withdrawals;
    } catch (error) {
        console.error('Error fetching withdrawals from Firestore:', error);
        return [];
    }
}
// Helper: fetch pickup requests from Firestore
async function fetchPickupRequests() {
    if (!window.firebase || !firebase.firestore) {
        console.error('Firebase Firestore is not available.');
        return [];
    }
    try {
        const snapshot = await firebase.firestore().collection('pickup_requests').get();
        const pickups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('Fetched pickup requests from Firestore:', pickups);
        return pickups;
    } catch (error) {
        console.error('Error fetching pickup requests from Firestore:', error);
        return [];
    }
}
// Helper: update user in Firestore
async function updateUser(userId, data) {
    if (!window.firebase || !firebase.firestore) {
        console.error('Firebase Firestore is not available.');
        return;
    }
    await firebase.firestore().collection('users').doc(userId).update(data);
}
// Helper: update withdrawal in Firestore
async function updateWithdrawal(id, data) {
    if (!window.firebase || !firebase.firestore) {
        console.error('Firebase Firestore is not available.');
        return;
    }
    await firebase.firestore().collection('withdrawals').doc(id).update(data);
}
// Helper: add admin transaction to Firestore
async function addAdminTransaction(data) {
    if (!window.firebase || !firebase.firestore) {
        console.error('Firebase Firestore is not available.');
        return;
    }
    await firebase.firestore().collection('admin_transactions').add({ ...data, date: firebase.firestore.FieldValue.serverTimestamp() });
}

// Helper to get display name
function getDisplayName(user) {
    return user.displayName || user.name || user.email || '';
}