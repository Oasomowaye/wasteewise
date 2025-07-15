// Recycling Partners page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const currentUser = window.WasteWiseDB.getCurrentUser();
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    // Initialize database
    const db = window.WasteWiseDB;
    
    // Initialize partners data if not exists
    initializePartnersData();
    
    // Current page and search state
    let currentPage = 1;
    let partnersPerPage = 6;
    let searchQuery = '';
    let allPartners = [];
    
    // Load partners
    loadPartners();
    
    // Search functionality
    const partnersSearchInput = document.getElementById('partnersSearchInput');
    const globalSearchInput = document.getElementById('globalSearchInput');
    
    if (partnersSearchInput) {
        partnersSearchInput.addEventListener('input', function() {
            searchQuery = this.value.toLowerCase();
            currentPage = 1;
            loadPartners();
        });
    }
    
    if (globalSearchInput) {
        globalSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const query = this.value.trim();
                if (query) {
                    alert(`Searching for: ${query}\n\nThis is a demo. In a real application, this would perform a global search.`);
                }
            }
        });
    }
    
    // Pagination
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            if (currentPage > 1) {
                currentPage--;
                loadPartners();
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            const filteredPartners = getFilteredPartners();
            const totalPages = Math.ceil(filteredPartners.length / partnersPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                loadPartners();
            }
        });
    }
    
    // Initialize partners data
    function initializePartnersData() {
        if (!localStorage.getItem('wastewise_partners')) {
            const defaultPartners = [
                {
                    id: 1,
                    name: 'Vicfold Recyclers',
                    sellerId: '123456',
                    address: '14 Adebayo Mokuolu Street, Basin Area, Ilorin',
                    phone: '+234 806 488 5401',
                    email: 'info@vicfold.com',
                    hours: '8:00 AM - 6:00 PM',
                    services: ['Plastic', 'Paper', 'Metal', 'Glass'],
                    status: 'active',
                    rating: 4.8,
                    createdAt: new Date().toISOString()
                },
                {
                    id: 2,
                    name: 'Duaklin Solutions',
                    sellerId: '123456',
                    address: 'Beside Kwara State Polytechnic Primary School, Egbejila Road, Ilorin',
                    phone: '+234 706 485 1175',
                    email: 'contact@duaklin.com',
                    hours: '7:00 AM - 7:00 PM',
                    services: ['Plastic', 'Electronics', 'Metal'],
                    status: 'active',
                    rating: 4.6,
                    createdAt: new Date().toISOString()
                },
                {
                    id: 3,
                    name: 'Eleganz Plastic',
                    sellerId: '123456',
                    address: 'Pipeline Road, Amoyo, Ilorin',
                    phone: '+234 701 010 5504',
                    email: 'hello@eleganzplastic.com',
                    hours: '8:00 AM - 5:00 PM',
                    services: ['Plastic', 'Rubber'],
                    status: 'active',
                    rating: 4.7,
                    createdAt: new Date().toISOString()
                },
                {
                    id: 4,
                    name: 'Aileria View',
                    sellerId: '123456',
                    address: 'Jaja Street, Adeta, Ilorin',
                    phone: '+234 706 216 6227',
                    email: 'info@aileriaview.com',
                    hours: '9:00 AM - 6:00 PM',
                    services: ['Paper', 'Cardboard', 'Books'],
                    status: 'active',
                    rating: 4.5,
                    createdAt: new Date().toISOString()
                },
                {
                    id: 5,
                    name: 'KWMC',
                    sellerId: '123456',
                    address: 'Industrial Area, Ilorin',
                    phone: '+234 803 123 4567',
                    email: 'contact@kwmc.com',
                    hours: '8:00 AM - 6:00 PM',
                    services: ['Metal', 'Aluminum', 'Iron'],
                    status: 'active',
                    rating: 4.9,
                    createdAt: new Date().toISOString()
                },
                {
                    id: 6,
                    name: 'Maverik Limited',
                    sellerId: '123456',
                    address: 'Commercial District, Ilorin',
                    phone: '+234 805 987 6543',
                    email: 'info@maverik.com',
                    hours: '8:00 AM - 7:00 PM',
                    services: ['Glass', 'Plastic', 'Metal', 'Paper'],
                    status: 'active',
                    rating: 4.8,
                    createdAt: new Date().toISOString()
                }
            ];
            
            localStorage.setItem('wastewise_partners', JSON.stringify(defaultPartners));
        }
    }
    
    // Get partners from localStorage
    function getPartners() {
        return JSON.parse(localStorage.getItem('wastewise_partners') || '[]');
    }
    
    // Save partners to localStorage
    function savePartners(partners) {
        localStorage.setItem('wastewise_partners', JSON.stringify(partners));
    }
    
    // Get filtered partners based on search
    function getFilteredPartners() {
        allPartners = getPartners();
        
        if (!searchQuery) {
            return allPartners;
        }
        
        return allPartners.filter(partner => 
            partner.name.toLowerCase().includes(searchQuery) ||
            partner.address.toLowerCase().includes(searchQuery) ||
            partner.services.some(service => service.toLowerCase().includes(searchQuery))
        );
    }
    
    // Load and display partners
    function loadPartners() {
        const partnersGrid = document.getElementById('partnersGrid');
        const filteredPartners = getFilteredPartners();
        
        // Calculate pagination
        const totalPages = Math.ceil(filteredPartners.length / partnersPerPage);
        const startIndex = (currentPage - 1) * partnersPerPage;
        const endIndex = startIndex + partnersPerPage;
        const partnersToShow = filteredPartners.slice(startIndex, endIndex);
        
        // Update pagination info
        updatePagination(currentPage, totalPages);
        
        // Clear grid
        partnersGrid.innerHTML = '';
        
        if (partnersToShow.length === 0) {
            // Show empty state
            partnersGrid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <i class="fas fa-search"></i>
                    <h3>No partners found</h3>
                    <p>Try adjusting your search terms or browse all available recycling partners.</p>
                </div>
            `;
            return;
        }
        
        // Create partner cards
        partnersToShow.forEach(partner => {
            const partnerCard = createPartnerCard(partner);
            partnersGrid.appendChild(partnerCard);
        });
    }
    
    // Create partner card element
    function createPartnerCard(partner) {
        const card = document.createElement('div');
        card.className = 'partner-card';
        card.onclick = () => showPartnerProfile(partner);
        
        // Highlight search terms
        const highlightedName = highlightSearchTerm(partner.name, searchQuery);
        const highlightedAddress = highlightSearchTerm(partner.address, searchQuery);
        
        card.innerHTML = `
            <div class="partner-logo">
                <div class="partner-icon">
                    <i class="fas fa-recycle"></i>
                </div>
            </div>
            <div class="partner-info">
                <div class="partner-name">${highlightedName}</div>
                <div class="partner-id">Seller ID: ${partner.sellerId}</div>
                <div class="partner-address">${highlightedAddress}</div>
                <button class="profile-btn" onclick="event.stopPropagation(); showPartnerProfile(${JSON.stringify(partner).replace(/"/g, '"')})">
                    Profile
                </button>
            </div>
        `;
        
        return card;
    }
    
    // Highlight search terms in text
    function highlightSearchTerm(text, searchTerm) {
        if (!searchTerm) return text;
        
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        return text.replace(regex, '<span class="search-highlight">$1</span>');
    }
    
    // Update pagination controls
    function updatePagination(current, total) {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const paginationInfo = document.getElementById('paginationInfo');
        
        if (prevBtn) {
            prevBtn.disabled = current <= 1;
        }
        
        if (nextBtn) {
            nextBtn.disabled = current >= total;
        }
        
        if (paginationInfo) {
            paginationInfo.textContent = `${current} of ${total}`;
        }
    }
    
    // Show partner profile modal
    window.showPartnerProfile = function(partner) {
        // If partner is passed as string (from onclick), parse it
        if (typeof partner === 'string') {
            partner = JSON.parse(partner);
        }
        
        // Populate modal with partner data
        document.getElementById('modalPartnerName').textContent = partner.name;
        document.getElementById('modalPartnerFullName').textContent = partner.name;
        document.getElementById('modalSellerId').textContent = partner.sellerId;
        document.getElementById('modalAddress').textContent = partner.address;
        document.getElementById('modalPhone').textContent = partner.phone;
        document.getElementById('modalEmail').textContent = partner.email;
        document.getElementById('modalHours').textContent = partner.hours;
        document.getElementById('modalServices').textContent = partner.services.join(', ');
        
        // Store current partner for actions
        window.currentPartner = partner;
        
        // Show modal
        openModal('partnerProfileModal');
    };
    
    // Contact partner function
    window.contactPartner = function() {
        const partner = window.currentPartner;
        if (partner) {
            alert(`Contacting ${partner.name}\n\nPhone: ${partner.phone}\nEmail: ${partner.email}\n\nThis would normally open your phone app or email client.`);
        }
    };
    
    // Get directions function
    window.getDirections = function() {
        const partner = window.currentPartner;
        if (partner) {
            alert(`Getting directions to ${partner.name}\n\nAddress: ${partner.address}\n\nThis would normally open your maps application with directions.`);
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
            alert('Notifications:\n\n• New recycling partner added near you\n• Partner price updates available\n• Special recycling event this weekend\n\nThis is a demo version.');
        });
    }
    
    // User menu dropdown
    const userMenu = document.querySelector('.user-menu');
    if (userMenu) {
        userMenu.addEventListener('click', function() {
            alert('User Menu:\n\n• Profile Settings\n• Account Preferences\n• Help & Support\n• Log Out\n\nThis is a demo version.');
        });
    }
    
    // Visibility toggle button
    const visibilityBtn = document.querySelector('.visibility-btn');
    if (visibilityBtn) {
        visibilityBtn.addEventListener('click', function() {
            alert('Visibility toggle:\n\nThis would hide/show sensitive information across the dashboard.\n\nThis is a demo version.');
        });
    }
    
    console.log('WasteWise Recycling Partners page loaded successfully!');
});