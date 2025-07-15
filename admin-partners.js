// Admin Partners Management functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check admin authentication
    if (!window.AdminAuth || !window.AdminAuth.requireAuth()) {
        return; // Will redirect to login
    }
    
    // Initialize partners data
    initializePartnersData();
    
    // Current editing partner
    let currentEditingPartner = null;
    let currentDeletePartner = null;
    
    // Load partners table
    loadPartnersTable();
    
    // Search and filter functionality
    const searchInput = document.getElementById('partnerSearchInput');
    const statusFilter = document.getElementById('statusFilter');
    const serviceFilter = document.getElementById('serviceFilter');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            loadPartnersTable();
        });
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', function() {
            loadPartnersTable();
        });
    }
    
    if (serviceFilter) {
        serviceFilter.addEventListener('change', function() {
            loadPartnersTable();
        });
    }
    
    // Add partner button
    const addPartnerBtn = document.getElementById('addPartnerBtn');
    if (addPartnerBtn) {
        addPartnerBtn.addEventListener('click', function() {
            openAddPartnerModal();
        });
    }
    
    // Initialize partners data if not exists
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
                    services: ['Paper', 'Cardboard'],
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
                    services: ['Metal', 'Aluminum'],
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
    
    // Get filtered partners
    function getFilteredPartners() {
        const partners = getPartners();
        const searchQuery = searchInput?.value.toLowerCase() || '';
        const statusFilterValue = statusFilter?.value || '';
        const serviceFilterValue = serviceFilter?.value.toLowerCase() || '';
        
        return partners.filter(partner => {
            const matchesSearch = !searchQuery || 
                partner.name.toLowerCase().includes(searchQuery) ||
                partner.address.toLowerCase().includes(searchQuery) ||
                partner.email.toLowerCase().includes(searchQuery) ||
                partner.phone.includes(searchQuery);
            
            const matchesStatus = !statusFilterValue || partner.status === statusFilterValue;
            
            const matchesService = !serviceFilterValue || 
                partner.services.some(service => service.toLowerCase().includes(serviceFilterValue));
            
            return matchesSearch && matchesStatus && matchesService;
        });
    }
    
    // Load partners table
    function loadPartnersTable() {
        const tbody = document.getElementById('partnersTableBody');
        const filteredPartners = getFilteredPartners();
        
        tbody.innerHTML = '';
        
        if (filteredPartners.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7">
                        <div class="empty-state">
                            <i class="fas fa-handshake"></i>
                            <h3>No partners found</h3>
                            <p>Try adjusting your search criteria or add a new partner.</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        filteredPartners.forEach(partner => {
            const row = createPartnerRow(partner);
            tbody.appendChild(row);
        });
    }
    
    // Create partner table row
    function createPartnerRow(partner) {
        const row = document.createElement('tr');
        const initials = partner.name.split(' ').map(n => n[0]).join('').substring(0, 2);
        const createdDate = new Date(partner.createdAt).toLocaleDateString();
        
        // Generate star rating
        const fullStars = Math.floor(partner.rating);
        const hasHalfStar = partner.rating % 1 !== 0;
        let starsHtml = '';
        
        for (let i = 0; i < fullStars; i++) {
            starsHtml += '★';
        }
        if (hasHalfStar) {
            starsHtml += '☆';
        }
        
        row.innerHTML = `
            <td>
                <div class="partner-info">
                    <div class="partner-avatar">${initials}</div>
                    <div class="partner-details">
                        <h4>${partner.name}</h4>
                        <p>ID: ${partner.sellerId}</p>
                    </div>
                </div>
            </td>
            <td>
                <div class="contact-info">
                    <div><i class="fas fa-phone"></i>${partner.phone}</div>
                    <div><i class="fas fa-envelope"></i>${partner.email}</div>
                    <div><i class="fas fa-map-marker-alt"></i>${partner.address}</div>
                </div>
            </td>
            <td>
                <div class="services-list">
                    ${partner.services.map(service => `<span class="service-tag">${service}</span>`).join('')}
                </div>
            </td>
            <td>
                <span class="status-badge ${partner.status}">${partner.status}</span>
            </td>
            <td>
                <div class="rating-display">
                    <span class="stars">${starsHtml}</span>
                    <span class="rating-number">${partner.rating}</span>
                </div>
            </td>
            <td>${createdDate}</td>
            <td>
                <div class="partner-actions">
                    <button class="action-btn edit" onclick="editPartner(${partner.id})" title="Edit Partner">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn view" onclick="viewPartner(${partner.id})" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn delete" onclick="deletePartner(${partner.id})" title="Delete Partner">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        return row;
    }
    
    // Open add partner modal
    function openAddPartnerModal() {
        currentEditingPartner = null;
        document.getElementById('modalTitle').textContent = 'Add New Partner';
        resetPartnerForm();
        openModal('partnerModal');
    }
    
    // Edit partner
    window.editPartner = function(partnerId) {
        const partners = getPartners();
        const partner = partners.find(p => p.id === partnerId);
        
        if (!partner) return;
        
        currentEditingPartner = partner;
        document.getElementById('modalTitle').textContent = 'Edit Partner';
        populatePartnerForm(partner);
        openModal('partnerModal');
    };
    
    // View partner
    window.viewPartner = function(partnerId) {
        const partners = getPartners();
        const partner = partners.find(p => p.id === partnerId);
        
        if (!partner) return;
        
        const details = `
Partner Details:

Name: ${partner.name}
Seller ID: ${partner.sellerId}
Address: ${partner.address}
Phone: ${partner.phone}
Email: ${partner.email}
Operating Hours: ${partner.hours}
Services: ${partner.services.join(', ')}
Status: ${partner.status.toUpperCase()}
Rating: ${partner.rating}/5
Created: ${new Date(partner.createdAt).toLocaleDateString()}

This would normally open a detailed partner profile page.
        `;
        
        alert(details);
    };
    
    // Delete partner
    window.deletePartner = function(partnerId) {
        const partners = getPartners();
        const partner = partners.find(p => p.id === partnerId);
        
        if (!partner) return;
        
        currentDeletePartner = partner;
        document.getElementById('deletePartnerName').textContent = partner.name;
        openModal('deleteModal');
    };
    
    // Confirm delete
    window.confirmDelete = function() {
        if (!currentDeletePartner) return;
        
        const partners = getPartners();
        const updatedPartners = partners.filter(p => p.id !== currentDeletePartner.id);
        savePartners(updatedPartners);
        
        loadPartnersTable();
        closeModal('deleteModal');
        
        alert(`Partner "${currentDeletePartner.name}" has been deleted successfully.`);
        currentDeletePartner = null;
    };
    
    // Reset partner form
    function resetPartnerForm() {
        document.getElementById('partnerForm').reset();
        document.querySelectorAll('.service-checkbox').forEach(checkbox => {
            checkbox.checked = false;
        });
    }
    
    // Populate partner form for editing
    function populatePartnerForm(partner) {
        document.getElementById('partnerName').value = partner.name;
        document.getElementById('sellerId').value = partner.sellerId;
        document.getElementById('partnerAddress').value = partner.address;
        document.getElementById('partnerPhone').value = partner.phone;
        document.getElementById('partnerEmail').value = partner.email;
        document.getElementById('operatingHours').value = partner.hours;
        document.getElementById('partnerStatus').value = partner.status;
        document.getElementById('partnerRating').value = partner.rating;
        
        // Set services checkboxes
        document.querySelectorAll('.service-checkbox').forEach(checkbox => {
            checkbox.checked = partner.services.includes(checkbox.value);
        });
    }
    
    // Save partner
    window.savePartner = function() {
        const form = document.getElementById('partnerForm');
        
        // Validate form
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        // Get form data
        const name = document.getElementById('partnerName').value.trim();
        const sellerId = document.getElementById('sellerId').value.trim();
        const address = document.getElementById('partnerAddress').value.trim();
        const phone = document.getElementById('partnerPhone').value.trim();
        const email = document.getElementById('partnerEmail').value.trim();
        const hours = document.getElementById('operatingHours').value.trim() || '8:00 AM - 6:00 PM';
        const status = document.getElementById('partnerStatus').value;
        const rating = parseFloat(document.getElementById('partnerRating').value);
        
        // Get selected services
        const services = [];
        document.querySelectorAll('.service-checkbox:checked').forEach(checkbox => {
            services.push(checkbox.value);
        });
        
        if (services.length === 0) {
            alert('Please select at least one service.');
            return;
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address.');
            return;
        }
        
        const partners = getPartners();
        
        if (currentEditingPartner) {
            // Update existing partner
            const partnerIndex = partners.findIndex(p => p.id === currentEditingPartner.id);
            if (partnerIndex !== -1) {
                partners[partnerIndex] = {
                    ...partners[partnerIndex],
                    name,
                    sellerId,
                    address,
                    phone,
                    email,
                    hours,
                    services,
                    status,
                    rating,
                    updatedAt: new Date().toISOString()
                };
            }
        } else {
            // Add new partner
            const newPartner = {
                id: Date.now(),
                name,
                sellerId,
                address,
                phone,
                email,
                hours,
                services,
                status,
                rating,
                createdAt: new Date().toISOString()
            };
            partners.push(newPartner);
        }
        
        savePartners(partners);
        loadPartnersTable();
        closeModal('partnerModal');
        
        const action = currentEditingPartner ? 'updated' : 'added';
        alert(`Partner "${name}" has been ${action} successfully.`);
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
            
            if (href === '#logout') {
                e.preventDefault();
                handleLogout();
                return;
            }
            
            // Allow all .html file navigation to proceed normally
            if (href && href.endsWith('.html')) {
                return;
            }
        });
    });
    
    // Handle navigation
    function handleNavigation(section) {
        switch(section) {
            case 'users':
                alert('Users Management\n\nThis would show a detailed users management page.');
                break;
            case 'transactions':
                alert('Transactions Management\n\nThis would show transaction management page.');
                break;
            case 'withdrawals':
                alert('Withdrawals Management\n\nThis would show withdrawal management page.');
                break;
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
    
    console.log('WasteWise Admin Partners Management loaded successfully!');
});