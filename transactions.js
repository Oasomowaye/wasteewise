// Transactions page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const currentUser = window.WasteWiseDB.getCurrentUser();
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    // Initialize database
    const db = window.WasteWiseDB;
    
    // Pagination state
    let currentPage = 1;
    let transactionsPerPage = 10;
    let currentTransaction = null;
    
    // Load transactions data
    loadTransactionsData();
    updateTransactionsSummary();
    
    // Search and filter functionality
    const searchInput = document.getElementById('transactionSearchInput');
    const typeFilter = document.getElementById('typeFilter');
    const statusFilter = document.getElementById('statusFilter');
    const dateFilter = document.getElementById('dateFilter');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            currentPage = 1;
            loadTransactionsData();
        });
    }
    
    if (typeFilter) {
        typeFilter.addEventListener('change', function() {
            currentPage = 1;
            loadTransactionsData();
        });
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', function() {
            currentPage = 1;
            loadTransactionsData();
        });
    }
    
    if (dateFilter) {
        dateFilter.addEventListener('change', function() {
            currentPage = 1;
            loadTransactionsData();
        });
    }
    
    // Pagination
    const prevPageBtn = document.getElementById('prevPageBtn');
    const nextPageBtn = document.getElementById('nextPageBtn');
    
    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', function() {
            if (currentPage > 1) {
                currentPage--;
                loadTransactionsData();
            }
        });
    }
    
    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', function() {
            const filteredTransactions = getFilteredTransactions();
            const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                loadTransactionsData();
            }
        });
    }
    
    // Export functionality
    const exportBtn = document.getElementById('exportTransactions');
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            exportTransactions();
        });
    }
    
    // Get user transactions
    function getUserTransactions() {
        const currentUser = db.getCurrentUser();
        if (!currentUser) {
            return [];
        }
        
        const allTransactions = db.getTransactions();
        return allTransactions.filter(t => t.userId === currentUser.id);
    }
    
    // Get filtered transactions
    function getFilteredTransactions() {
        const transactions = getUserTransactions();
        const searchQuery = searchInput?.value.toLowerCase() || '';
        const typeFilterValue = typeFilter?.value || '';
        const statusFilterValue = statusFilter?.value || '';
        const dateFilterValue = dateFilter?.value || '';
        
        return transactions.filter(transaction => {
            const matchesSearch = !searchQuery || 
                transaction.id.toLowerCase().includes(searchQuery) ||
                transaction.description.toLowerCase().includes(searchQuery) ||
                transaction.type.toLowerCase().includes(searchQuery);
            
            const matchesType = !typeFilterValue || transaction.type === typeFilterValue;
            const matchesStatus = !statusFilterValue || transaction.status === statusFilterValue;
            
            let matchesDate = true;
            if (dateFilterValue) {
                const transactionDate = new Date(transaction.date);
                const today = new Date();
                
                switch (dateFilterValue) {
                    case 'today':
                        matchesDate = transactionDate.toDateString() === today.toDateString();
                        break;
                    case 'week':
                        const weekAgo = new Date(today);
                        weekAgo.setDate(today.getDate() - 7);
                        matchesDate = transactionDate >= weekAgo;
                        break;
                    case 'month':
                        const monthAgo = new Date(today);
                        monthAgo.setMonth(today.getMonth() - 1);
                        matchesDate = transactionDate >= monthAgo;
                        break;
                    case 'year':
                        const yearAgo = new Date(today);
                        yearAgo.setFullYear(today.getFullYear() - 1);
                        matchesDate = transactionDate >= yearAgo;
                        break;
                }
            }
            
            return matchesSearch && matchesType && matchesStatus && matchesDate;
        });
    }
    
    // Update transactions summary
    function updateTransactionsSummary() {
        const transactions = getUserTransactions();
        const currentUser = db.getCurrentUser();
        const user = currentUser ? db.getUserById(currentUser.id) : null;
        
        let totalIncome = 0;
        let totalExpenses = 0;
        
        transactions.forEach(transaction => {
            if (transaction.type === 'recycling' || transaction.type === 'deposit') {
                totalIncome += transaction.amount;
            } else if (transaction.type === 'withdrawal') {
                totalExpenses += transaction.amount;
            }
        });
        
        document.getElementById('totalIncome').textContent = `₦${totalIncome.toFixed(2)}`;
        document.getElementById('totalExpenses').textContent = `₦${totalExpenses.toFixed(2)}`;
        document.getElementById('currentBalance').textContent = user ? `₦${user.balance.toFixed(2)}` : '₦0.00';
        document.getElementById('totalTransactions').textContent = transactions.length.toString();
    }
    
    // Load transactions data
    function loadTransactionsData() {
        const tbody = document.getElementById('transactionsTableBody');
        const filteredTransactions = getFilteredTransactions();
        
        // Calculate pagination
        const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);
        const startIndex = (currentPage - 1) * transactionsPerPage;
        const endIndex = startIndex + transactionsPerPage;
        const transactionsToShow = filteredTransactions.slice(startIndex, endIndex);
        
        // Update pagination info
        updatePagination(currentPage, totalPages);
        
        // Clear table
        tbody.innerHTML = '';
        
        if (transactionsToShow.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7">
                        <div class="empty-state">
                            <i class="fas fa-receipt"></i>
                            <h3>No transactions found</h3>
                            <p>Try adjusting your search criteria or start recycling to see transactions here.</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        // Sort by date (newest first)
        transactionsToShow.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        transactionsToShow.forEach(transaction => {
            const row = createTransactionRow(transaction);
            tbody.appendChild(row);
        });
    }
    
    // Create transaction table row
    function createTransactionRow(transaction) {
        const row = document.createElement('tr');
        const date = new Date(transaction.date);
        const dateStr = date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
        const timeStr = date.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true 
        });
        
        const amountClass = (transaction.type === 'recycling' || transaction.type === 'deposit') ? 'positive' : 'negative';
        const amountPrefix = (transaction.type === 'recycling' || transaction.type === 'deposit') ? '+' : '-';
        
        row.innerHTML = `
            <td>
                <span class="transaction-id">${transaction.id}</span>
            </td>
            <td>
                <div>${dateStr}</div>
                <div class="transaction-date">${timeStr}</div>
            </td>
            <td>
                <span class="transaction-type ${transaction.type}">${transaction.type}</span>
            </td>
            <td>${transaction.description}</td>
            <td>
                <span class="transaction-amount ${amountClass}">${amountPrefix}₦${transaction.amount.toFixed(2)}</span>
            </td>
            <td>
                <span class="transaction-status ${transaction.status}">${transaction.status}</span>
            </td>
            <td>
                <div class="transaction-actions">
                    <button class="action-btn view" onclick="viewTransactionDetails('${transaction.id}')" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn download" onclick="downloadTransactionReceipt('${transaction.id}')" title="Download Receipt">
                        <i class="fas fa-download"></i>
                    </button>
                </div>
            </td>
        `;
        
        return row;
    }
    
    // Update pagination controls
    function updatePagination(current, total) {
        const prevBtn = document.getElementById('prevPageBtn');
        const nextBtn = document.getElementById('nextPageBtn');
        const paginationInfo = document.getElementById('paginationInfo');
        
        if (prevBtn) {
            prevBtn.disabled = current <= 1;
        }
        
        if (nextBtn) {
            nextBtn.disabled = current >= total;
        }
        
        if (paginationInfo) {
            paginationInfo.textContent = `Page ${current} of ${total}`;
        }
    }
    
    // View transaction details
    window.viewTransactionDetails = function(transactionId) {
        const transactions = getUserTransactions();
        const transaction = transactions.find(t => t.id === transactionId);
        
        if (!transaction) return;
        
        currentTransaction = transaction;
        
        // Populate modal with transaction data
        document.getElementById('detailTransactionId').textContent = transaction.id;
        document.getElementById('detailStatus').textContent = transaction.status;
        document.getElementById('detailStatus').className = `detail-status transaction-status ${transaction.status}`;
        
        const date = new Date(transaction.date);
        const dateTimeStr = date.toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
        
        document.getElementById('detailDateTime').textContent = dateTimeStr;
        document.getElementById('detailType').textContent = transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1);
        document.getElementById('detailAmount').textContent = `₦${transaction.amount.toFixed(2)}`;
        document.getElementById('detailDescription').textContent = transaction.description;
        document.getElementById('detailReference').textContent = transaction.reference || transaction.id;
        
        // Calculate balance after (this would be stored in real app)
        const currentUser = db.getCurrentUser();
        const user = currentUser ? db.getUserById(currentUser.id) : null;
        document.getElementById('detailBalanceAfter').textContent = user ? `₦${user.balance.toFixed(2)}` : '₦0.00';
        
        // Set notes based on transaction type and status
        let notes = 'This transaction was processed successfully. No additional action required.';
        if (transaction.status === 'pending') {
            notes = 'This transaction is currently being processed. Please allow 1-3 business days for completion.';
        } else if (transaction.status === 'failed') {
            notes = 'This transaction failed to process. Please contact support if you need assistance.';
        } else if (transaction.type === 'withdrawal') {
            notes = 'Withdrawal processed successfully. Funds have been transferred to your specified account.';
        } else if (transaction.type === 'recycling') {
            notes = 'Recycling payment processed. Thank you for contributing to environmental sustainability!';
        }
        
        document.getElementById('detailNotes').querySelector('p').textContent = notes;
        
        openModal('transactionDetailsModal');
    };
    
    // Download transaction receipt
    window.downloadTransactionReceipt = function(transactionId) {
        const transactions = getUserTransactions();
        const transaction = transactions.find(t => t.id === transactionId);
        
        if (!transaction) return;
        
        // Create receipt content
        const currentUser = db.getCurrentUser();
        const user = currentUser ? db.getUserById(currentUser.id) : null;
        const date = new Date(transaction.date);
        
        const receiptContent = `
WASTEWISE TRANSACTION RECEIPT
================================

Transaction ID: ${transaction.id}
Date: ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
Time: ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}

Customer Information:
Name: ${user ? user.name : 'N/A'}
Email: ${user ? user.email : 'N/A'}

Transaction Details:
Type: ${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
Description: ${transaction.description}
Amount: ₦${transaction.amount.toFixed(2)}
Status: ${transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
Reference: ${transaction.reference || transaction.id}

Thank you for using WasteWise!
For support, contact: support@wastewise.com
        `;
        
        // Download as text file
        const blob = new Blob([receiptContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `wastewise-receipt-${transaction.id}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        alert(`Receipt for transaction ${transaction.id} has been downloaded.`);
    };
    
    // Download receipt from modal
    window.downloadReceipt = function() {
        if (currentTransaction) {
            downloadTransactionReceipt(currentTransaction.id);
        }
    };
    
    // Export transactions
    function exportTransactions() {
        const transactions = getFilteredTransactions();
        
        if (transactions.length === 0) {
            alert('No transactions to export.');
            return;
        }
        
        // Create CSV content
        const headers = ['Transaction ID', 'Date', 'Time', 'Type', 'Description', 'Amount', 'Status', 'Reference'];
        const csvContent = [
            headers.join(','),
            ...transactions.map(transaction => {
                const date = new Date(transaction.date);
                return [
                    transaction.id,
                    date.toLocaleDateString(),
                    date.toLocaleTimeString(),
                    transaction.type,
                    `"${transaction.description}"`,
                    transaction.amount.toFixed(2),
                    transaction.status,
                    transaction.reference || transaction.id
                ].join(',');
            })
        ].join('\n');
        
        // Download CSV file
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `wastewise-transactions-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        alert(`Exported ${transactions.length} transactions to CSV file.`);
    }
    
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
    
    // Notification button
    const notificationBtn = document.querySelector('.notification-btn');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', function() {
            alert('Transaction Notifications:\n\n• New withdrawal processed successfully\n• Recycling payment received: ₦150.00\n• Monthly statement available for download\n\nThis is a demo version.');
        });
    }
    
    // User menu dropdown
    const userMenu = document.querySelector('.user-menu');
    if (userMenu) {
        userMenu.addEventListener('click', function() {
            alert('User Menu:\n\n• Transaction History\n• Download Statements\n• Payment Methods\n• Transaction Preferences\n\nThis is a demo version.');
        });
    }
    
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
    
    // Auto-update transactions every 10 seconds
    setInterval(() => {
        updateTransactionsSummary();
        loadTransactionsData();
    }, 10000); // More frequent updates
    
    // Listen for storage changes (when admin updates from another tab)
    window.addEventListener('storage', function(e) {
        if (e.key === 'wastewise_users' || e.key === 'wastewise_transactions') {
            updateTransactionsSummary();
            loadTransactionsData();
        }
    });
});