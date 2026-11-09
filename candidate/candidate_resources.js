// DOM elements
const backButton = document.getElementById('back');
const jobListUl = document.getElementById('jobListUl');
const loadingMessage = document.querySelector('.loading-message');
const searchResourcesForm = document.getElementById('searchResourcesForm');
const submitBtn = document.querySelector('.submit-btn');
const btnText = document.querySelector('.btn-text');
const loadingSpinner = document.querySelector('.loading-spinner');
const resourcesListUl = document.getElementById('resourcesListUl');

// Get token
const token = localStorage.getItem('token');

// Initialize back button when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing back button...');
    
    // Error handling for back button
    const backButton = document.getElementById('back');
    if (backButton) {
        console.log('Back button found, adding event listener...');
        backButton.addEventListener('click', () => {
            console.log('Back button clicked, navigating to dashboard...');
            try {
                window.location.href = 'candidate_dashboard.html';
            } catch (error) {
                console.error('Navigation error:', error);
                // Fallback navigation
                window.location.replace('candidate_dashboard.html');
            }
        });
        console.log('Back button event listener added successfully');
    } else {
        console.error('Back button not found in DOM');
    }
});

// Sample resources data
const resources = [
    {
        title: 'JavaScript Fundamentals',
        category: 'Programming',
        link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
        description: 'Learn the basics of JavaScript programming language'
    },
    {
        title: 'React Tutorial',
        category: 'Frontend',
        link: 'https://react.dev/learn',
        description: 'Build user interfaces with React library'
    },
    {
        title: 'Python for Beginners',
        category: 'Programming',
        link: 'https://docs.python.org/3/tutorial/',
        description: 'Start your journey with Python programming'
    },
    {
        title: 'Data Structures & Algorithms',
        category: 'Computer Science',
        link: 'https://www.geeksforgeeks.org/data-structures/',
        description: 'Master fundamental computer science concepts'
    },
    {
        title: 'System Design Interview',
        category: 'Interview Prep',
        link: 'https://www.educative.io/courses/grokking-the-system-design-interview',
        description: 'Learn system design concepts for technical interviews'
    }
];

// Enhanced form validation
function validateSearchQuery(query) {
    if (!query || query.trim().length < 2) {
        showNotification('Please enter a search query with at least 2 characters.', 'error');
        return false;
    }
    return true;
}

// Update resources list with modern styling
const updateResourcesList = (filteredResources) => {
    if (loadingMessage) {
        loadingMessage.style.display = 'none';
    }
    
    if (filteredResources.length === 0) {
        resourcesListUl.innerHTML = `
            <div class="no-resources">
                <p>🔍 No resources found for your search query.</p>
                <p>Try searching for different keywords or browse all available resources.</p>
            </div>
        `;
        return;
    }
    
    resourcesListUl.innerHTML = filteredResources.map(resource => `
        <li class="resource-item">
            <div class="resource-info">
                <div class="resource-title">${escapeHTML(resource.title)}</div>
                <div class="resource-category">${escapeHTML(resource.category)}</div>
                <div class="resource-description" style="color: rgba(255, 255, 255, 0.7); font-size: 0.85rem; margin-top: 5px;">
                    ${escapeHTML(resource.description)}
                </div>
                <div class="resource-meta" style="margin-top: 8px; display: flex; gap: 10px;">
                    <span class="difficulty" style="background: rgba(102, 126, 234, 0.3); padding: 2px 8px; border-radius: 12px; font-size: 0.75rem;">${escapeHTML(resource.difficulty || 'All Levels')}</span>
                    <span class="type" style="background: rgba(34, 197, 94, 0.3); padding: 2px 8px; border-radius: 12px; font-size: 0.75rem;">${escapeHTML(resource.type || 'Resource')}</span>
                </div>
            </div>
            <a href="${escapeHTML(safeURL(resource.link))}" target="_blank" class="resource-link">
                Access Resource
            </a>
        </li>
    `).join('');
    
    // Add click handlers for resource items
    document.querySelectorAll('.resource-item').forEach(item => {
        item.addEventListener('click', (e) => {
            // Don't trigger if clicking on the link
            if (e.target.classList.contains('resource-link')) {
                return;
            }
            
            // Find the link within the item and open it
            const link = item.querySelector('.resource-link');
            if (link) {
                window.open(link.href, '_blank');
            }
        });
    });
};

// Enhanced search functionality
const performSearch = async (query) => {
    try {
        console.log('Searching for resources:', query);
        
        // Get authentication token
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Authentication required. Please log in again.');
        }
        
        // Call backend API for AI-powered recommendations
        const response = await fetch('http://localhost:8000/api/candidate/resources', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                query: query,
                category: null // Can be extended to support category filtering
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            console.log('AI recommendations:', data.resources);
            updateResourcesList(data.resources);
            
            if (data.resources.length > 0) {
                showNotification(`Found ${data.resources.length} AI-recommended resource(s) for "${query}"`, 'success');
            } else {
                showNotification(`No resources found for "${query}"`, 'info');
            }
        } else {
            throw new Error('Failed to get recommendations');
        }
        
    } catch (error) {
        console.error('Error searching resources:', error);
        showNotification('Failed to search resources. Please try again.', 'error');
        
        // Fallback to local resources if API fails
        const filteredResources = resources.filter(resource => 
            resource.title.toLowerCase().includes(query.toLowerCase()) || 
            resource.category.toLowerCase().includes(query.toLowerCase()) ||
            resource.description.toLowerCase().includes(query.toLowerCase())
        );
        
        updateResourcesList(filteredResources);
    }
};

// Form submission with enhanced UX
if (searchResourcesForm) {
    searchResourcesForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const searchQuery = document.getElementById('searchQuery').value.trim();
        
        // Enhanced validation
        if (!validateSearchQuery(searchQuery)) {
            return;
        }
        
        // Show loading state
        setLoadingState(true);
        
        try {
            await performSearch(searchQuery);
        } catch (error) {
            console.error('Error in form submission:', error);
            showNotification('Failed to search resources. Please try again.', 'error');
        } finally {
            setLoadingState(false);
        }
    });
}

// Loading state management with enhanced UX
function setLoadingState(isLoading) {
    if (isLoading) {
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        loadingSpinner.style.display = 'block';
        submitBtn.style.cursor = 'not-allowed';
        submitBtn.style.opacity = '0.7';
    } else {
        submitBtn.disabled = false;
        btnText.style.display = 'block';
        loadingSpinner.style.display = 'none';
        submitBtn.style.cursor = 'pointer';
        submitBtn.style.opacity = '1';
    }
}

// Enhanced notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${escapeHTML(message)}</span>
        <button class="notification-close">×</button>
    `;

    // Enhanced styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 10px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 10px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        animation: slideInRight 0.3s ease;
        max-width: 400px;
        font-family: 'Inter', sans-serif;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    `;

    if (type === 'success') {
        notification.style.background = 'rgba(34, 197, 94, 0.9)';
    } else if (type === 'error') {
        notification.style.background = 'rgba(239, 68, 68, 0.9)';
    } else {
        notification.style.background = 'rgba(59, 130, 246, 0.9)';
    }

    document.body.appendChild(notification);

    // Enhanced close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    });

    // Auto remove after 5 seconds with fade out
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

// Add enhanced CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background 0.3s ease;
    }
    
    .notification-close:hover {
        background: rgba(255, 255, 255, 0.2);
    }
    
    /* Enhanced form input styling */
    .form-group input:focus {
        outline: none;
        border-color: rgba(255, 255, 255, 0.6);
        box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
        transform: translateY(-2px);
    }
    
    .form-group input:hover {
        background: rgba(255, 255, 255, 0.15);
    }
`;
document.head.appendChild(style);

// Initialize page with enhanced functionality
document.addEventListener('DOMContentLoaded', () => {
    console.log('Resources page loaded for user:', username);
    
    // Load initial resources
    updateResourcesList(resources);
    showNotification('Welcome to Learning Resources! Search for topics to find relevant materials.', 'info');
    
    // Add input focus effects
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.style.transform = 'translateY(-2px)';
        });
        
        input.addEventListener('blur', () => {
            input.parentElement.style.transform = 'translateY(0)';
        });
    });
    
    // Add real-time search (optional enhancement)
    searchQuery.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        if (query.length >= 2) {
            // Debounce the search
            clearTimeout(searchQuery.debounceTimer);
            searchQuery.debounceTimer = setTimeout(() => {
                performSearch(query);
            }, 300);
        } else if (query.length === 0) {
            // Show all resources when search is cleared
            updateResourcesList(resources);
        }
    });
});