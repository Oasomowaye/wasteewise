// Admin Pickup Requests Management functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize pickup requests data
    initializePickupRequestsData();
    
    // Current editing request
    let currentEditingRequest = null;
    
    // Load pickup requests table
    loadPickupRequestsTable();
    updateRequestsStats();
    
    // Search and filter functionality
    const searchInput = document.getElementById('pickupSearchInput');
    const statusFilter = document.getElementById('statusFilter');
    const priorityFilter = document.getElementById('priorityFilter');
    const dateFilter = document.getElementById('dateFilter');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            loadPickupRequestsTable();
        });
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', function() {
            loadPickupRequestsTable();
        });
    }
    
    if (priorityFilter) {
        priorityFilter.addEventListener('change', function() {
            loadPickupRequestsTable();
        });
    }
    
    if (dateFilter) {
        dateFilter.addEventListener('change', function() {
            loadPickupRequestsTable();
        });
    }
    
    // Export functionality
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            exportPickupRequests();
        });
    }
    
    // Initialize pickup requests data if not exists
    function initializePickupRequestsData() {
        if (!localStorage.getItem('wastewise_pickup_requests')) {
            const defaultRequests = [
                {
                    id: 'PR-001',
                    userId: 1,
                    userName: 'Adeoye Daniel',
                    userEmail: 'adeoye.daniel@gmail.com',
                    userPhone: '+234 806 488 5401',
                    address: '14 Adebayo Mokuolu Street, Basin Area, Ilorin',
                    pickupDate: '2025-01-15',
                    pickupTimeFrom: '10:00',
                    pickupTimeTo: '12:00',
                    status: 'pending',
                    priority: 'medium',
                    notes: 'Please call before arrival. Gate is usually locked.',
                    createdAt: '2025-01-10T08:30:00Z',
                    assignedTeam: null,
                    estimatedWeight: '25kg'
                },
                {
                    id: 'PR-002',
                    userId: 2,
                    userName: 'Gabriel Omowaye',
                    userEmail: 'omowayeayomide3@gmail.com',
                    userPhone: '+234 706 485 1175',
                    address: 'Beside Kwara State Polytechnic Primary School, Egbejila Road, Ilorin',
                    pickupDate: '2025-01-16',
                    pickupTimeFrom: '14:00',
                    pickupTimeTo: '16:00',
                    status: 'approved',
                    priority: 'high',
                    notes: 'Large amount of plastic bottles and containers.',
                    createdAt: '2025-01-11T14:20:00Z',
                    assignedTeam: 'team-1',
                    estimatedWeight: '40kg'
                },
                {
                    id: 'PR-003',
                    userId: 1,
                    userName: 'Adeoye Daniel',
                    userEmail: 'adeoye.daniel@gmail.com',
                    userPhone: '+234 806 488 5401',
                    address: '14 Adebayo Mokuolu Street, Basin Area, Ilorin',
                    pickupDate: '2025-01-12',
                    pickupTimeFrom: '09:00',
                    pickupTimeTo: '11:00',
                    status: 'completed',
                    priority: 'low',
                    notes: 'Regular weekly pickup.',
                    createdAt: '2025-01-08T10:15:00Z',
                    assignedTeam: 'team-2',
                    estimatedWeight: '20kg',
                    completedAt: '2025-01-12T10:30:00Z'
                },
                {
                    id: 'PR-004',
                    userId: 2,
                    userName: 'Gabriel Omowaye',
                    userEmail: 'omowayeayomide3@gmail.com',
                    userPhone: '+234 706 485 1175',
                    address: 'Beside Kwara State Polytechnic Primary School, Egbejila Road, Ilorin',
                    pickupDate: '2025-01-17',
                    pickupTimeFrom: '08:00',
                    pickupTimeTo: '10:00',
                    status: 'in-progress',
                    priority: 'medium',
                    notes: 'Mixed recyclables including paper and plastic.',
                    createdAt: '2025-01-12T16:45:00Z',
                    assignedTeam: 'team-3',
                    estimatedWeight: '30kg'
                }
            ];
            
            localStorage.setItem('wastewise_pickup_requests', JSON.stringify(defaultRequests));
        }
    }
    
    // Get pickup requests from localStorage
    function getPickupRequests() {
        return JSON.parse(localStorage.getItem('wastewise_pickup_requests') || '[]');
    }
    
    // Save pickup requests to localStorage
    function savePickupRequests(requests) {
        localStorage.setItem('wastewise_pickup_requests', JSON.stringify(requests));
    }
    
    // Get filtered pickup requests
    function getFilteredPickupRequests() {
        const requests = getPickupRequests();
        const searchQuery = searchInput?.value.toLowerCase() || '';
        const statusFilterValue = statusFilter?.value || '';
        const priorityFilterValue = priorityFilter?.value || '';
        const dateFilterValue = dateFilter?.value || '';
        
        return requests.filter(request => {
            const matchesSearch = !searchQuery || 
                request.id.toLowerCase().includes(searchQuery) ||
                request.userName.toLowerCase().includes(searchQuery) ||
                request.address.toLowerCase().includes(searchQuery) ||
                request.userEmail.toLowerCase().includes(searchQuery);
            
            const matchesStatus = !statusFilterValue || request.status === statusFilterValue;
            const matchesPriority = !priorityFilterValue || request.priority === priorityFilterValue;
            
            let matchesDate = true;
            if (dateFilterValue) {
                const requestDate = new Date(request.pickupDate);
                const today = new Date();
                const tomorrow = new Date(today);
                tomorrow.setDate(today.getDate() + 1);
                
                switch (dateFilterValue) {
                    case 'today':
                        matchesDate = requestDate.toDateString() === today.toDateString();
                        break;
                    case 'tomorrow':
                        matchesDate = requestDate.toDateString() === tomorrow.toDateString();
                        break;
                    case 'this-week':
                        const weekStart = new Date(today);
                        weekStart.setDate(today.getDate() - today.getDay());
                        const weekEnd = new Date(weekStart);
                        weekEnd.setDate(weekStart.getDate() + 6);
                        matchesDate = requestDate >= weekStart && requestDate <= weekEnd;
                        break;
                    case 'next-week':
                        const nextWeekStart = new Date(today);
                        nextWeekStart.setDate(today.getDate() + (7 - today.getDay()));
                        const nextWeekEnd = new Date(nextWeekStart);
                        nextWeekEnd.setDate(nextWeekStart.getDate() + 6);
                        matchesDate = requestDate >= nextWeekStart && requestDate <= nextWeekEnd;
                        break;
                }
            }
            
            return matchesSearch && matchesStatus && matchesPriority && matchesDate;
        });
    }
    
    // Update requests statistics
    function updateRequestsStats() {
        const requests = getPickupRequests();
        const pendingCount = requests.filter(r => r.status === 'pending').length;
        const approvedCount = requests.filter(r => r.status === 'approved' || r.status === 'in-progress').length;
        const completedCount = requests.filter(r => r.status === 'completed').length;
        
        document.getElementById('pendingCount').textContent = `${pendingCount} Pending`;
        document.getElementById('approvedCount').textContent = `${approvedCount} Approved`;
        document.getElementById('completedCount').textContent = `${completedCount} Completed`;
    }
    
    // Load pickup requests table
    function loadPickupRequestsTable() {
        const tbody = document.getElementById('pickupRequestsTable');
        const filteredRequests = getFilteredPickupRequests();
        
        tbody.innerHTML = '';
        
        if (filteredRequests.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8">
                        <div class="empty-state">
                            <i class="fas fa-truck"></i>
                            <h3>No pickup requests found</h3>
                            <p>Try adjusting your search criteria or check back later for new requests.</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        // Sort by creation date (newest first)
        filteredRequests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        filteredRequests.forEach(request => {
            const row = createPickupRequestRow(request);
            tbody.appendChild(row);
        });
    }
    
    // Create pickup request table row
    function createPickupRequestRow(request) {
        const row = document.createElement('tr');
        const initials = request.userName.split(' ').map(n => n[0]).join('').substring(0, 2);
        const createdDate = new Date(request.createdAt).toLocaleDateString();
        const pickupDate = new Date(request.pickupDate).toLocaleDateString();
        
        row.innerHTML = `
            <td>
                <strong>${request.id}</strong>
            </td>
            <td>
                <div class="request-info">
                    <div class="request-avatar">${initials}</div>
                    <div class="request-details">
                        <h4>${request.userName}</h4>
                        <p>${request.userEmail}</p>
                    </div>
                </div>
            </td>
            <td>
                <div class="address-info">${request.address}</div>
            </td>
            <td>
                <div class="pickup-schedule">
                    <div class="pickup-date">${pickupDate}</div>
                    <div class="pickup-time">${request.pickupTimeFrom} - ${request.pickupTimeTo}</div>
                </div>
            </td>
            <td>
                <span class="status-badge ${request.status}">${request.status.replace('-', ' ')}</span>
            </td>
            <td>
                <span class="priority-badge ${request.priority}">${request.priority}</span>
            </td>
            <td>${createdDate}</td>
            <td>
                <div class="request-actions">
                    <button class="action-btn view" onclick="viewRequestDetails('${request.id}')" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${request.status === 'pending' ? `
                        <button class="action-btn approve" onclick="quickApprove('${request.id}')" title="Quick Approve">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="action-btn reject" onclick="quickReject('${request.id}')" title="Quick Reject">
                            <i class="fas fa-times"></i>
                        </button>
                    ` : ''}
                    ${(request.status === 'pending' || request.status === 'approved') ? `
                        <button class="action-btn assign" onclick="assignPickupTeam('${request.id}')" title="Assign Team">
                            <i class="fas fa-user-plus"></i>
                        </button>
                    ` : ''}
                </div>
            </td>
        `;
        
        return row;
    }
    
    // View request details
    window.viewRequestDetails = function(requestId) {
        const requests = getPickupRequests();
        const request = requests.find(r => r.id === requestId);
        
        if (!request) return;
        
        currentEditingRequest = request;
        
        // Populate modal with request data
        document.getElementById('modalRequestId').textContent = request.id;
        document.getElementById('modalRequestStatus').textContent = request.status.replace('-', ' ');
        document.getElementById('modalRequestStatus').className = `request-status-large ${request.status}`;
        
        document.getElementById('modalUserName').textContent = request.userName;
        document.getElementById('modalUserEmail').textContent = request.userEmail;
        document.getElementById('modalUserPhone').textContent = request.userPhone;
        
        document.getElementById('modalPickupDate').textContent = new Date(request.pickupDate).toLocaleDateString();
        document.getElementById('modalPickupTime').textContent = `${request.pickupTimeFrom} - ${request.pickupTimeTo}`;
        document.getElementById('modalPriority').textContent = request.priority.charAt(0).toUpperCase() + request.priority.slice(1);
        document.getElementById('modalCreatedDate').textContent = new Date(request.createdAt).toLocaleDateString();
        
        document.getElementById('modalFullAddress').textContent = request.address;
        document.getElementById('modalNotes').textContent = request.notes || 'No additional notes provided.';
        
        openModal('requestDetailsModal');
    };
    
    // Quick approve request
    window.quickApprove = function(requestId) {
        const requests = getPickupRequests();
        const requestIndex = requests.findIndex(r => r.id === requestId);
        
        if (requestIndex !== -1) {
            requests[requestIndex].status = 'approved';
            requests[requestIndex].approvedAt = new Date().toISOString();
            requests[requestIndex].approvedBy = 'Admin';
            
            savePickupRequests(requests);
            loadPickupRequestsTable();
            updateRequestsStats();
            
            alert(`Pickup request ${requestId} has been approved successfully!`);
        }
    };
    
    // Quick reject request
    window.quickReject = function(requestId) {
        const reason = prompt('Please provide a reason for rejecting this pickup request:');
        
        if (reason !== null && reason.trim()) {
            const requests = getPickupRequests();
            const requestIndex = requests.findIndex(r => r.id === requestId);
            
            if (requestIndex !== -1) {
                requests[requestIndex].status = 'cancelled';
                requests[requestIndex].rejectedAt = new Date().toISOString();
                requests[requestIndex].rejectedBy = 'Admin';
                requests[requestIndex].rejectionReason = reason.trim();
                
                savePickupRequests(requests);
                loadPickupRequestsTable();
                updateRequestsStats();
                
                alert(`Pickup request ${requestId} has been rejected.`);
            }
        }
    };
    
    // Approve request from modal
    window.approveRequest = function() {
        if (!currentEditingRequest) return;
        
        const requests = getPickupRequests();
        const requestIndex = requests.findIndex(r => r.id === currentEditingRequest.id);
        
        if (requestIndex !== -1) {
            requests[requestIndex].status = 'approved';
            requests[requestIndex].approvedAt = new Date().toISOString();
            requests[requestIndex].approvedBy = 'Admin';
            
            savePickupRequests(requests);
            loadPickupRequestsTable();
            updateRequestsStats();
            
            closeModal('requestDetailsModal');
            alert(`Pickup request ${currentEditingRequest.id} has been approved successfully!`);
        }
    };
    
    // Reject request from modal
    window.rejectRequest = function() {
        if (!currentEditingRequest) return;
        
        const reason = prompt('Please provide a reason for rejecting this pickup request:');
        
        if (reason !== null && reason.trim()) {
            const requests = getPickupRequests();
            const requestIndex = requests.findIndex(r => r.id === currentEditingRequest.id);
            
            if (requestIndex !== -1) {
                requests[requestIndex].status = 'cancelled';
                requests[requestIndex].rejectedAt = new Date().toISOString();
                requests[requestIndex].rejectedBy = 'Admin';
                requests[requestIndex].rejectionReason = reason.trim();
                
                savePickupRequests(requests);
                loadPickupRequestsTable();
                updateRequestsStats();
                
                closeModal('requestDetailsModal');
                alert(`Pickup request ${currentEditingRequest.id} has been rejected.`);
            }
        }
    };
    
    // Assign pickup team
    window.assignPickupTeam = function(requestId) {
        const requests = getPickupRequests();
        const request = requests.find(r => r.id === requestId);
        
        if (!request) return;
        
        currentEditingRequest = request;
        
        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('assignDate').setAttribute('min', today);
        document.getElementById('assignDate').value = request.pickupDate;
        document.getElementById('assignPriority').value = request.priority;
        
        openModal('assignmentModal');
    };
    
    // Assign pickup from modal
    window.assignPickup = function() {
        if (!currentEditingRequest) return;
        assignPickupTeam(currentEditingRequest.id);
    };
    
    // Save assignment
    window.saveAssignment = function() {
        const form = document.getElementById('assignmentForm');
        
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        const team = document.getElementById('assignTeam').value;
        const date = document.getElementById('assignDate').value;
        const time = document.getElementById('assignTime').value;
        const priority = document.getElementById('assignPriority').value;
        const notes = document.getElementById('assignNotes').value;
        
        const requests = getPickupRequests();
        const requestIndex = requests.findIndex(r => r.id === currentEditingRequest.id);
        
        if (requestIndex !== -1) {
            requests[requestIndex].assignedTeam = team;
            requests[requestIndex].pickupDate = date;
            requests[requestIndex].assignedTime = time;
            requests[requestIndex].priority = priority;
            requests[requestIndex].assignmentNotes = notes;
            requests[requestIndex].status = 'approved';
            requests[requestIndex].assignedAt = new Date().toISOString();
            requests[requestIndex].assignedBy = 'Admin';
            
            savePickupRequests(requests);
            loadPickupRequestsTable();
            updateRequestsStats();
            
            // Reset form
            form.reset();
            
            closeModal('assignmentModal');
            closeModal('requestDetailsModal');
            
            const teamName = document.querySelector(`#assignTeam option[value="${team}"]`).textContent;
            alert(`Pickup request ${currentEditingRequest.id} has been assigned to ${teamName} for ${date} at ${time}.`);
        }
    };
    
    // Export pickup requests
    function exportPickupRequests() {
        const requests = getFilteredPickupRequests();
        
        if (requests.length === 0) {
            alert('No pickup requests to export.');
            return;
        }
        
        // Create CSV content
        const headers = ['Request ID', 'User Name', 'Email', 'Phone', 'Address', 'Pickup Date', 'Pickup Time', 'Status', 'Priority', 'Created Date', 'Notes'];
        const csvContent = [
            headers.join(','),
            ...requests.map(request => [
                request.id,
                `"${request.userName}"`,
                request.userEmail,
                request.userPhone,
                `"${request.address}"`,
                request.pickupDate,
                `"${request.pickupTimeFrom} - ${request.pickupTimeTo}"`,
                request.status,
                request.priority,
                new Date(request.createdAt).toLocaleDateString(),
                `"${request.notes || ''}"`
            ].join(','))
        ].join('\n');
        
        // Download CSV file
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pickup-requests-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        alert(`Exported ${requests.length} pickup requests to CSV file.`);
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
    
    // Navigation functionality
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
            alert('Logging out of admin panel...');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        }
    }
    
    console.log('WasteWise Admin Pickup Requests Management loaded successfully!');
});