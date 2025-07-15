// Admin Authentication Manager
class AdminAuth {
    constructor() {
        this.sessionKey = 'wastewise_admin_session';
        this.sessionDuration = 8 * 60 * 60 * 1000; // 8 hours in milliseconds
    }
    
    // Check if admin is authenticated
    isAuthenticated() {
        const session = this.getSession();
        if (!session) {
            return false;
        }
        
        const loginTime = new Date(session.loginTime);
        const now = new Date();
        const timeDiff = now - loginTime;
        
        // Check if session has expired
        if (timeDiff > this.sessionDuration) {
            this.clearSession();
            return false;
        }
        
        return true;
    }
    
    // Get current session
    getSession() {
        try {
            const sessionData = localStorage.getItem(this.sessionKey);
            return sessionData ? JSON.parse(sessionData) : null;
        } catch (error) {
            console.error('Error parsing admin session:', error);
            this.clearSession();
            return null;
        }
    }
    
    // Clear session
    clearSession() {
        localStorage.removeItem(this.sessionKey);
    }
    
    // Redirect to login if not authenticated
    requireAuth() {
        if (!this.isAuthenticated()) {
            this.redirectToLogin();
            return false;
        }
        return true;
    }
    
    // Redirect to admin login
    redirectToLogin() {
        // Store the current page to redirect back after login
        const currentPage = window.location.pathname.split('/').pop();
        if (currentPage && currentPage !== 'admin-login.html') {
            localStorage.setItem('wastewise_admin_redirect', currentPage);
        }
        
        window.location.href = 'admin-login.html';
    }
    
    // Logout admin
    logout() {
        this.clearSession();
        this.redirectToLogin();
    }
    
    // Get admin username
    getAdminUsername() {
        const session = this.getSession();
        return session ? session.username : null;
    }
    
    // Extend session (refresh login time)
    extendSession() {
        const session = this.getSession();
        if (session) {
            session.loginTime = new Date().toISOString();
            localStorage.setItem(this.sessionKey, JSON.stringify(session));
        }
    }
}

// Create global admin auth instance
window.AdminAuth = new AdminAuth();

// Auto-extend session on user activity (for admin pages)
if (window.location.pathname.includes('admin') && !window.location.pathname.includes('admin-login')) {
    let activityTimer;
    
    function resetActivityTimer() {
        clearTimeout(activityTimer);
        activityTimer = setTimeout(() => {
            if (window.AdminAuth.isAuthenticated()) {
                window.AdminAuth.extendSession();
            }
        }, 5 * 60 * 1000); // Extend session every 5 minutes of activity
    }
    
    // Listen for user activity
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, resetActivityTimer, true);
    });
    
    // Initial timer
    resetActivityTimer();
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminAuth;
}