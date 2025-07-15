// Learn page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const currentUser = window.WasteWiseDB.getCurrentUser();
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    // Initialize carousel
    let currentFactIndex = 0;
    const facts = document.querySelectorAll('.fact-card');
    const dots = document.querySelectorAll('.dot');
    
    // Auto-rotate facts every 5 seconds
    setInterval(() => {
        nextFact();
    }, 5000);
    
    // Carousel functions
    window.nextFact = function() {
        currentFactIndex = (currentFactIndex + 1) % facts.length;
        showFact(currentFactIndex);
    };
    
    window.previousFact = function() {
        currentFactIndex = (currentFactIndex - 1 + facts.length) % facts.length;
        showFact(currentFactIndex);
    };
    
    window.showFact = function(index) {
        // Remove active class from all facts and dots
        facts.forEach(fact => fact.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        // Add active class to current fact and dot
        facts[index].classList.add('active');
        dots[index].classList.add('active');
        
        currentFactIndex = index;
    };
    
    // Category functions
    window.openCategory = function(categoryType) {
        let categoryInfo = {};
        
        switch(categoryType) {
            case 'basics':
                categoryInfo = {
                    title: 'Recycling Basics',
                    description: 'Learn the fundamentals of recycling, including the 3 R\'s (Reduce, Reuse, Recycle), the recycling process, and why recycling is important for our environment.',
                    lessons: [
                        'Introduction to Recycling',
                        'The 3 R\'s Explained',
                        'Recycling Symbols and Codes',
                        'Common Recyclable Materials',
                        'The Recycling Process',
                        'Benefits of Recycling',
                        'Recycling Myths Debunked',
                        'Starting Your Recycling Journey'
                    ]
                };
                break;
            case 'sorting':
                categoryInfo = {
                    title: 'Waste Sorting',
                    description: 'Master the art of proper waste separation. Learn how to identify different materials, understand contamination, and sort waste effectively.',
                    lessons: [
                        'Plastic Types and Sorting',
                        'Paper and Cardboard Guidelines',
                        'Metal Identification',
                        'Glass Recycling Rules',
                        'Contamination Prevention',
                        'Special Waste Categories'
                    ]
                };
                break;
            case 'impact':
                categoryInfo = {
                    title: 'Environmental Impact',
                    description: 'Understand how recycling helps reduce pollution, conserve natural resources, and combat climate change.',
                    lessons: [
                        'Climate Change and Recycling',
                        'Resource Conservation',
                        'Pollution Reduction',
                        'Energy Savings Through Recycling'
                    ]
                };
                break;
        }
        
        alert(`${categoryInfo.title}\n\n${categoryInfo.description}\n\nLessons in this category:\n${categoryInfo.lessons.map((lesson, index) => `${index + 1}. ${lesson}`).join('\n')}\n\nThis would open the full category page with interactive lessons.`);
    };
    
    // Lesson functions
    window.openLesson = function(lessonType) {
        let lessonInfo = {};
        
        switch(lessonType) {
            case 'plastic-types':
                lessonInfo = {
                    title: 'Understanding Plastic Types',
                    description: 'Learn about the 7 different plastic recycling codes and what they mean. Understand which plastics can be recycled and how to identify them by their recycling symbols.',
                    content: 'This lesson covers:\n• Plastic recycling codes 1-7\n• Which plastics are commonly recycled\n• How to read recycling symbols\n• Best practices for plastic recycling\n• Common plastic recycling mistakes to avoid'
                };
                break;
            case 'paper-recycling':
                lessonInfo = {
                    title: 'Paper Recycling Process',
                    description: 'Discover how paper is collected, processed, and turned into new products. Learn about the paper recycling loop and its environmental benefits.',
                    content: 'This lesson covers:\n• The paper recycling process step-by-step\n• Types of paper that can be recycled\n• Paper contamination and how to avoid it\n• Environmental benefits of paper recycling\n• New products made from recycled paper'
                };
                break;
            case 'metal-recycling':
                lessonInfo = {
                    title: 'Metal Recycling Benefits',
                    description: 'Learn why metal recycling is one of the most energy-efficient forms of recycling and how it helps conserve natural resources.',
                    content: 'This lesson covers:\n• Types of metals that can be recycled\n• Energy savings from metal recycling\n• The metal recycling process\n• Economic benefits of metal recycling\n• How to prepare metals for recycling'
                };
                break;
        }
        
        // Populate modal
        document.getElementById('lessonTitle').textContent = lessonInfo.title;
        document.getElementById('lessonDescription').innerHTML = `
            <h4>${lessonInfo.title}</h4>
            <p>${lessonInfo.description}</p>
            <div style="margin-top: 1rem; padding: 1rem; background: #f0fdf4; border-radius: 8px; border-left: 4px solid #22c55e;">
                <strong>Lesson Content:</strong><br>
                ${lessonInfo.content.replace(/\n/g, '<br>')}
            </div>
        `;
        
        openModal('lessonModal');
    };
    
    window.markLessonComplete = function() {
        alert('Lesson marked as complete! 🎉\n\nYou\'ve earned 10 points for completing this lesson.\n\nYour learning progress has been updated.');
        closeModal('lessonModal');
    };
    
    // Search functionality
    const searchInput = document.getElementById('learnSearchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const query = this.value.trim();
                if (query) {
                    alert(`Searching for: "${query}"\n\nThis would search through:\n• Lesson titles and descriptions\n• Category content\n• Tips and facts\n• Video transcripts\n\nThis is a demo version.`);
                }
            }
        });
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
            alert('Learning Notifications:\n\n• New lesson available: "Advanced Composting"\n• You\'re 2 lessons away from earning a certificate!\n• Weekly recycling tip: Clean containers before recycling\n\nThis is a demo version.');
        });
    }
    
    // User menu dropdown
    const userMenu = document.querySelector('.user-menu');
    if (userMenu) {
        userMenu.addEventListener('click', function() {
            alert('User Menu:\n\n• Learning Progress\n• Certificates Earned\n• Bookmarked Lessons\n• Learning Preferences\n\nThis is a demo version.');
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
    
    console.log('WasteWise Learn page loaded successfully!');
});