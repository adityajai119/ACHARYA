// Admin Activity Management
document.addEventListener('DOMContentLoaded', function() {
    initializeActivityPage();
});

function initializeActivityPage() {
    // Initialize back button
    const backBtn = document.getElementById('back');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            try {
                window.location.href = 'admin_dashboard.html';
            } catch (error) {
                console.error('Navigation error:', error);
                window.location.replace('admin_dashboard.html');
            }
        });
    }

    // Initialize filter form
    const filterForm = document.getElementById('filterForm');
    if (filterForm) {
        filterForm.addEventListener('submit', handleFilterSubmit);
    }

    // Load initial activities
    fetchActivities();
}

const token = localStorage.getItem('token');

const showLoading = () => {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const activityListUl = document.getElementById('activityListUl');
    
    if (loadingIndicator) loadingIndicator.style.display = 'flex';
    if (activityListUl) activityListUl.style.display = 'none';
};

const hideLoading = () => {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const activityListUl = document.getElementById('activityListUl');
    
    if (loadingIndicator) loadingIndicator.style.display = 'none';
    if (activityListUl) activityListUl.style.display = 'block';
};

const showNotification = (message, type = 'info') => {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 10px;
        color: white;
        font-weight: 600;
        z-index: 1000;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    // Set background based on type
    if (type === 'success') {
        notification.style.background = 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)';
    } else if (type === 'error') {
        notification.style.background = 'linear-gradient(135deg, #f44336 0%, #da190b 100%)';
    } else {
        notification.style.background = 'linear-gradient(135deg, #2196F3 0%, #0b7dda 100%)';
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
};

const updateActivityList = (activities) => {
    const list = document.getElementById('activityListUl');
    const totalActivities = document.getElementById('totalActivities');
    const todayActivities = document.getElementById('todayActivities');
    
    if (!list) return;
    
    // Update stats
    if (totalActivities) totalActivities.textContent = activities.length;
    
    const today = new Date().toDateString();
    const todayCount = activities.filter(activity => 
        new Date(activity.timestamp).toDateString() === today
    ).length;
    if (todayActivities) todayActivities.textContent = todayCount;
    
    if (activities.length === 0) {
        list.innerHTML = `
            <li class="no-activities">
                <div style="text-align: center; padding: 40px; color: rgba(255, 255, 255, 0.7);">
                    <h3>📭 No Activities Found</h3>
                    <p>No activities match your current filter criteria.</p>
                </div>
            </li>
        `;
        return;
    }
    
    list.innerHTML = activities.map(activity => {
        const timestamp = new Date(activity.timestamp);
        const timeAgo = getTimeAgo(timestamp);
        const activityIcon = getActivityIcon(activity.description);
        
        return `
            <li class="activity-item">
                <div class="activity-content">
                    <div class="activity-icon">${activityIcon}</div>
                    <div class="activity-details">
                        <div class="activity-description">${escapeHTML(activity.description)}</div>
                        <div class="activity-time">${timeAgo}</div>
                    </div>
                </div>
            </li>
        `;
    }).join('');
};

const getActivityIcon = (description) => {
    const lowerDesc = description.toLowerCase();
    if (lowerDesc.includes('login')) return '🔐';
    if (lowerDesc.includes('logout')) return '🚪';
    if (lowerDesc.includes('job')) return '💼';
    if (lowerDesc.includes('application')) return '📝';
    if (lowerDesc.includes('client')) return '👥';
    if (lowerDesc.includes('delete')) return '🗑️';
    if (lowerDesc.includes('update')) return '✏️';
    if (lowerDesc.includes('add')) return '➕';
    return '📊';
};

const getTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
};

const fetchActivities = async (filter = '') => {
    showLoading();
    
    try {
        const url = filter ? 
            `http://localhost:8000/api/activities/filter?filter=${encodeURIComponent(filter)}` : 
            'http://localhost:8000/api/activities';
            
        const response = await fetch(url, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });
        
        if (response.ok) {
            const activities = await response.json();
            updateActivityList(activities);
            showNotification(`✅ Loaded ${activities.length} activities`, 'success');
        } else if (response.status === 401) {
            showNotification('❌ Unauthorized. Please login again.', 'error');
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 2000);
        } else if (response.status === 403) {
            showNotification('❌ Access denied. Admin privileges required.', 'error');
        } else {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.error('Error fetching activities:', error);
        showNotification('❌ Failed to load activities. Please try again.', 'error');
        updateActivityList([]);
    } finally {
        hideLoading();
    }
};

const handleFilterSubmit = async (e) => {
    e.preventDefault();
    const filterInput = document.getElementById('filterActivity');
    const filter = filterInput.value.trim();
    
    if (filter) {
        showNotification(`🔍 Filtering activities for: "${filter}"`, 'info');
    } else {
        showNotification('📊 Loading all activities', 'info');
    }
    
    await fetchActivities(filter);
};