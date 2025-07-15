// WasteWise Database Management System
// Using localStorage as a simple database solution

class WasteWiseDB {
    constructor() {
        this.initializeDatabase();
    }

    // Initialize database with default data if not exists
    initializeDatabase() {
        if (!localStorage.getItem('wastewise_users')) {
            const defaultUsers = [
                {
                    id: 1,
                    name: 'Adeoye Daniel',
                    firstName: 'Adeoye',
                    lastName: 'Daniel',
                    email: 'adeoye.daniel@gmail.com',
                    password: 'password123', // In real app, this would be hashed
                    joinDate: '2025-01-15',
                    status: 'active',
                    balance: 0,
                    points: 501,
                    recycledWeight: 3.0,
                    lastUpdated: new Date().toISOString(),
                    avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1'
                },
                {
                    id: 2,
                    name: 'Gabriel Omowaye',
                    firstName: 'Gabriel',
                    lastName: 'Omowaye',
                    email: 'omowayeayomide3@gmail.com',
                    password: 'password123',
                    joinDate: '2025-06-28',
                    status: 'active',
                    balance: 0,
                    points: 0,
                    recycledWeight: 0,
                    lastUpdated: new Date().toISOString(),
                    avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1'
                }
            ];
            this.saveUsers(defaultUsers);
        }

        if (!localStorage.getItem('wastewise_transactions')) {
            // Initialize with some sample transactions for the current user
            const sampleTransactions = [
                {
                    id: 'WS' + Date.now(),
                    userId: 1,
                    type: 'recycling',
                    amount: 150.00,
                    description: 'Plastic recycling payment',
                    status: 'success',
                    date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
                    reference: 'REF' + Date.now(),
                    weight: 0.5
                },
                {
                    id: 'WS' + (Date.now() + 1),
                    userId: 1,
                    type: 'recycling',
                    amount: 200.00,
                    description: 'Paper and cardboard recycling',
                    status: 'success',
                    date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
                    reference: 'REF' + (Date.now() + 1),
                    weight: 0.8
                },
                {
                    id: 'WS' + (Date.now() + 2),
                    userId: 1,
                    type: 'withdrawal',
                    amount: 100.00,
                    description: 'Withdrawal to GTBank',
                    status: 'pending',
                    date: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
                    reference: 'REF' + (Date.now() + 2)
                }
            ];
            this.saveTransactions(sampleTransactions);
        }

        if (!localStorage.getItem('wastewise_current_user')) {
            // Set default current user
            localStorage.setItem('wastewise_current_user', JSON.stringify({
                id: 1,
                name: 'Adeoye Daniel',
                email: 'adeoye.daniel@gmail.com'
            }));
        }

        if (!localStorage.getItem('wastewise_admin_transactions')) {
            this.saveAdminTransactions([]);
        }

        if (!localStorage.getItem('wastewise_withdrawal_requests')) {
            this.saveWithdrawalRequests([]);
        }
    }

    // User Management
    getUsers() {
        return JSON.parse(localStorage.getItem('wastewise_users') || '[]');
    }

    saveUsers(users) {
        localStorage.setItem('wastewise_users', JSON.stringify(users));
    }

    getUserById(id) {
        const users = this.getUsers();
        return users.find(user => user.id === id);
    }

    getUserByEmail(email) {
        const users = this.getUsers();
        return users.find(user => user.email === email);
    }

    updateUser(userId, updates) {
        const users = this.getUsers();
        const userIndex = users.findIndex(user => user.id === userId);
        
        if (userIndex !== -1) {
            users[userIndex] = { ...users[userIndex], ...updates, lastUpdated: new Date().toISOString() };
            this.saveUsers(users);
            
            // Trigger storage event for real-time updates
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'wastewise_users',
                newValue: JSON.stringify(users),
                url: window.location.href
            }));
            
            return users[userIndex];
        }
        return null;
    }

    // Current User Management
    getCurrentUser() {
        return JSON.parse(localStorage.getItem('wastewise_current_user') || 'null');
    }

    setCurrentUser(user) {
        localStorage.setItem('wastewise_current_user', JSON.stringify(user));
    }

    // Transaction Management
    getTransactions() {
        return JSON.parse(localStorage.getItem('wastewise_transactions') || '[]');
    }

    saveTransactions(transactions) {
        localStorage.setItem('wastewise_transactions', JSON.stringify(transactions));
    }

    addTransaction(transaction) {
        const transactions = this.getTransactions();
        const newTransaction = {
            id: `WS${Date.now()}`,
            ...transaction,
            date: new Date().toISOString()
        };
        transactions.unshift(newTransaction);
        this.saveTransactions(transactions);
        return newTransaction;
    }

    // Admin Transaction Management
    getAdminTransactions() {
        return JSON.parse(localStorage.getItem('wastewise_admin_transactions') || '[]');
    }

    saveAdminTransactions(transactions) {
        localStorage.setItem('wastewise_admin_transactions', JSON.stringify(transactions));
    }

    addAdminTransaction(transaction) {
        const transactions = this.getAdminTransactions();
        const newTransaction = {
            id: `ADM${Date.now()}`,
            ...transaction,
            date: new Date().toISOString(),
            timestamp: Date.now()
        };
        transactions.unshift(newTransaction);
        this.saveAdminTransactions(transactions);
        return newTransaction;
    }

    // Withdrawal Requests Management
    getWithdrawalRequests() {
        return JSON.parse(localStorage.getItem('wastewise_withdrawal_requests') || '[]');
    }

    saveWithdrawalRequests(requests) {
        localStorage.setItem('wastewise_withdrawal_requests', JSON.stringify(requests));
    }

    addWithdrawalRequest(request) {
        const requests = this.getWithdrawalRequests();
        const newRequest = {
            id: `WR${Date.now()}`,
            ...request,
            requestDate: new Date().toISOString(),
            timestamp: Date.now()
        };
        requests.unshift(newRequest);
        this.saveWithdrawalRequests(requests);
        return newRequest;
    }

    updateWithdrawalRequest(requestId, updates) {
        const requests = this.getWithdrawalRequests();
        const requestIndex = requests.findIndex(req => req.id === requestId);
        
        if (requestIndex !== -1) {
            requests[requestIndex] = { ...requests[requestIndex], ...updates, updatedAt: new Date().toISOString() };
            this.saveWithdrawalRequests(requests);
            return requests[requestIndex];
        }
        return null;
    }

    // Balance Management
    updateUserBalance(userId, newBalance, reason = '', adminName = 'Admin') {
        const user = this.updateUser(userId, { balance: newBalance });
        if (user) {
            this.addAdminTransaction({
                userId: userId,
                userName: user.name,
                action: 'balance_update',
                oldBalance: user.balance,
                newBalance: newBalance,
                amount: newBalance - user.balance,
                reason: reason,
                adminName: adminName,
                type: 'Balance Update'
            });
        }
        return user;
    }

    updateUserPoints(userId, newPoints, reason = '', adminName = 'Admin') {
        const user = this.updateUser(userId, { recycledWeight: newPoints });
        if (user) {
            this.addAdminTransaction({
                userId: userId,
                userName: user.name,
                action: 'points_update',
                oldPoints: user.recycledWeight,
                newPoints: newPoints,
                amount: newPoints - user.recycledWeight,
                reason: reason,
                adminName: adminName,
                type: 'Points Update'
            });
        }
        return user;
    }

    // Statistics
    getDashboardStats() {
        const users = this.getUsers();
        const transactions = this.getTransactions();
        const withdrawalRequests = this.getWithdrawalRequests();
        
        return {
            totalUsers: users.length,
            totalRecycled: users.reduce((sum, user) => sum + (user.recycledWeight || 0), 0),
            totalPoints: users.reduce((sum, user) => sum + (user.points || 0), 0),
            totalBalance: users.reduce((sum, user) => sum + (user.balance || 0), 0),
            totalWithdrawals: withdrawalRequests
                .filter(req => req.status === 'completed')
                .reduce((sum, req) => sum + (req.amount || 0), 0),
            pendingWithdrawals: withdrawalRequests.filter(req => req.status === 'pending').length
        };
    }

    // Authentication
    authenticateUser(email, password) {
        const user = this.getUserByEmail(email);
        if (user && user.password === password) {
            this.setCurrentUser({
                id: user.id,
                name: user.name,
                email: user.email
            });
            return user;
        }
        return null;
    }

    // Data Export/Import
    exportData() {
        return {
            users: this.getUsers(),
            transactions: this.getTransactions(),
            adminTransactions: this.getAdminTransactions(),
            withdrawalRequests: this.getWithdrawalRequests(),
            currentUser: this.getCurrentUser(),
            exportDate: new Date().toISOString()
        };
    }

    importData(data) {
        if (data.users) this.saveUsers(data.users);
        if (data.transactions) this.saveTransactions(data.transactions);
        if (data.adminTransactions) this.saveAdminTransactions(data.adminTransactions);
        if (data.withdrawalRequests) this.saveWithdrawalRequests(data.withdrawalRequests);
        if (data.currentUser) this.setCurrentUser(data.currentUser);
    }

    // Clear all data (for testing)
    clearAllData() {
        localStorage.removeItem('wastewise_users');
        localStorage.removeItem('wastewise_transactions');
        localStorage.removeItem('wastewise_admin_transactions');
        localStorage.removeItem('wastewise_withdrawal_requests');
        localStorage.removeItem('wastewise_current_user');
        this.initializeDatabase();
    }
}

// Create global database instance
window.WasteWiseDB = new WasteWiseDB();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WasteWiseDB;
}