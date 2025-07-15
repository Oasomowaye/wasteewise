// Global Theme Manager - Restricted to authenticated pages only
class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('wastewise_theme') || 'light';
        this.isAuthenticatedPage = this.checkIfAuthenticatedPage();
        this.init();
    }
    
    init() {
        // Only apply theme management on authenticated pages
        if (!this.isAuthenticatedPage) {
            // For non-authenticated pages, ensure light theme
            this.forceLight();
            return;
        }
        
        // Load dark mode CSS only for authenticated pages
        this.loadDarkModeCSS();
        
        // Apply saved theme
        this.applyTheme(this.currentTheme);
        
        // Listen for system theme changes
        this.setupSystemThemeListener();
        
        // Setup theme persistence across pages
        this.setupThemePersistence();
    }
    
    checkIfAuthenticatedPage() {
        const currentPath = window.location.pathname;
        const filename = currentPath.split('/').pop() || 'index.html';
        
        // List of authenticated pages that support theme switching
        const authenticatedPages = [
            'dashboard.html',
            'recycle.html',
            'recycling-partners.html',
            'transactions.html',
            'learn.html',
            'settings.html',
            'admin.html',
            'admin-partners.html',
            'admin-pickup-requests.html'
        ];
        
        return authenticatedPages.includes(filename);
    }
    
    forceLight() {
        // Ensure light theme for non-authenticated pages
        const body = document.body;
        if (body) {
            body.classList.remove('dark-mode', 'light-mode');
            // Light theme is default (no class needed)
        }
    }
    
    loadDarkModeCSS() {
        // Check if dark mode CSS is already loaded
        if (!document.querySelector('link[href="dark-mode.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'dark-mode.css';
            document.head.appendChild(link);
        }
    }
    
    applyTheme(theme) {
        // Only apply theme changes on authenticated pages
        if (!this.isAuthenticatedPage) {
            this.forceLight();
            return;
        }
        
        const body = document.body;
        
        // Check if body is available
        if (!body) {
            // If body is not available, wait for DOM to load
            document.addEventListener('DOMContentLoaded', () => {
                this.applyTheme(theme);
            });
            return;
        }
        
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
        
        this.currentTheme = theme;
        
        // Save theme preference only for authenticated pages
        localStorage.setItem('wastewise_theme', theme);
        
        // Update user preferences in database if available
        this.updateUserPreferences(theme);
        
        // Dispatch theme change event
        window.dispatchEvent(new CustomEvent('themeChanged', { 
            detail: { theme: theme, isDark: this.isDarkMode() } 
        }));
    }
    
    updateUserPreferences(theme) {
        // Only update if database is available, user is logged in, and on authenticated page
        if (this.isAuthenticatedPage && window.WasteWiseDB) {
            const db = window.WasteWiseDB;
            const currentUser = db.getCurrentUser();
            
            if (currentUser) {
                const user = db.getUserById(currentUser.id);
                if (user) {
                    const preferences = user.preferences || {};
                    preferences.theme = theme;
                    db.updateUser(currentUser.id, { preferences: preferences });
                }
            }
        }
    }
    
    setupSystemThemeListener() {
        // Only listen for system theme changes on authenticated pages
        if (!this.isAuthenticatedPage) return;
        
        // Listen for system theme changes when auto is selected
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (this.currentTheme === 'auto') {
                this.applyTheme('auto');
            }
        });
    }
    
    setupThemePersistence() {
        // Apply theme on page load only for authenticated pages
        document.addEventListener('DOMContentLoaded', () => {
            if (this.isAuthenticatedPage) {
                this.applyTheme(this.currentTheme);
            } else {
                this.forceLight();
            }
        });
        
        // Reapply theme when navigating between pages
        window.addEventListener('pageshow', () => {
            if (this.isAuthenticatedPage) {
                this.applyTheme(this.currentTheme);
            } else {
                this.forceLight();
            }
        });
    }
    
    setTheme(theme) {
        // Only allow theme changes on authenticated pages
        if (!this.isAuthenticatedPage) {
            console.warn('Theme switching is only available on authenticated pages');
            return;
        }
        this.applyTheme(theme);
    }
    
    getTheme() {
        return this.isAuthenticatedPage ? this.currentTheme : 'light';
    }
    
    isDarkMode() {
        if (!this.isAuthenticatedPage) return false;
        
        if (this.currentTheme === 'dark') {
            return true;
        } else if (this.currentTheme === 'auto') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return false;
    }
    
    toggleTheme() {
        // Only allow theme toggle on authenticated pages
        if (!this.isAuthenticatedPage) {
            console.warn('Theme switching is only available on authenticated pages');
            return;
        }
        
        const newTheme = this.isDarkMode() ? 'light' : 'dark';
        this.applyTheme(newTheme);
    }
    
    // Method to sync theme with settings page
    syncWithSettings() {
        // Only sync on authenticated pages
        if (!this.isAuthenticatedPage) return;
        
        // Update theme options in settings page if it exists
        const themeOptions = document.querySelectorAll('.theme-option');
        if (themeOptions.length > 0) {
            themeOptions.forEach(option => {
                option.classList.remove('active');
                if (option.dataset.theme === this.currentTheme) {
                    option.classList.add('active');
                }
            });
        }
    }
    
    // Method to load user theme preference from database
    loadUserThemePreference() {
        // Only load user preferences on authenticated pages
        if (!this.isAuthenticatedPage) {
            this.forceLight();
            return;
        }
        
        if (window.WasteWiseDB) {
            const db = window.WasteWiseDB;
            const currentUser = db.getCurrentUser();
            
            if (currentUser) {
                const user = db.getUserById(currentUser.id);
                if (user && user.preferences && user.preferences.theme) {
                    this.applyTheme(user.preferences.theme);
                }
            }
        }
    }
    
    // Method to check if theme switching is available
    isThemeSwitchingAvailable() {
        return this.isAuthenticatedPage;
    }
}

// Create global theme manager instance after DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.ThemeManager = new ThemeManager();
    });
} else {
    // DOM is already loaded
    window.ThemeManager = new ThemeManager();
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;
}