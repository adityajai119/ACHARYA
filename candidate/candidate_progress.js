const progressForm = document.getElementById('progressForm');
const progressItemInput = document.getElementById('progressItem');
const progressCategoryInput = document.getElementById('progressCategory');
const progressList = document.getElementById('progressList');
const progressListUl = document.getElementById('progressListUl');
const noProgress = document.getElementById('noProgress');
const submitBtn = document.querySelector('.submit-btn');
const btnText = document.querySelector('.btn-text');
const loadingSpinner = document.querySelector('.loading-spinner');

// Stats elements
const totalItemsElement = document.getElementById('totalItems');
const thisMonthElement = document.getElementById('thisMonth');
const thisWeekElement = document.getElementById('thisWeek');

// JWT token handling
let token, username;

// Fallback JWT decoder function
function decodeJWT(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error decoding JWT:', error);
        return null;
    }
}

// Initialize authentication
function initializeAuth() {
    try {
        token = localStorage.getItem('token');
        if (!token) {
            console.log('No token found, redirecting to login');
            window.location.href = '../index.html';
            return false;
        }
        
        let decoded;
        if (typeof jwtDecode !== 'undefined') {
            decoded = jwtDecode(token);
        } else if (typeof jwt_decode !== 'undefined') {
            decoded = jwt_decode(token);
        } else {
            console.log('Using fallback JWT decoder');
            decoded = decodeJWT(token);
        }
        
        if (!decoded || !decoded.username) {
            console.log('Invalid token, redirecting to login');
            localStorage.removeItem('token');
            window.location.href = '../index.html';
            return false;
        }
        
        username = decoded.username;
        return true;
    } catch (error) {
        console.error('Authentication error:', error);
        localStorage.removeItem('token');
        window.location.href = '../index.html';
        return false;
    }
}

// Initialize back button when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing back button...');
    
    // Initialize authentication
    if (!initializeAuth()) {
        console.log('Authentication failed');
        return;
    }
    
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
    
    // Initialize progress tracking
    syncProgressFromOtherFeatures();
    updateProgressList();
    updateProgressStats();
});

// Initialize authentication
if (!initializeAuth()) {
    console.log('Authentication failed');
}

// Progress items storage
let progressItems = JSON.parse(localStorage.getItem('progressItems')) || [];

// Real-time progress tracking from other features
function syncProgressFromOtherFeatures() {
    console.log('Syncing progress from other features...');
    
    // Sync from Mock Tests
    syncMockTestProgress();
    
    // Sync from Learning Goals
    syncLearningGoalsProgress();
    
    // Sync from Resume Analysis
    syncResumeAnalysisProgress();
    
    // Sync from AI Learning
    syncAILearningProgress();
    
    // Sync from Company Tests
    syncCompanyTestsProgress();
    
    // Sync from Interview Simulation
    syncInterviewProgress();
    
    // Update UI after syncing
    updateProgressList();
    updateProgressStats();
}

// Sync Mock Test Progress
function syncMockTestProgress() {
    const mockTestResults = JSON.parse(localStorage.getItem('mockTestResults')) || [];
    const mockTestProgress = JSON.parse(localStorage.getItem('mockTestProgress')) || [];
    
    mockTestResults.forEach(result => {
        if (result.score >= 70) {
            addAutoProgressItem(
                `Completed ${result.testName} with ${result.score}% score`,
                'Mock Tests',
                result.timestamp || Date.now(),
                '🎯'
            );
        }
    });
    
    // Track test attempts
    if (mockTestProgress.length > 0) {
        const recentTests = mockTestProgress.filter(test => 
            Date.now() - test.timestamp < 7 * 24 * 60 * 60 * 1000
        );
        if (recentTests.length > 0) {
            addAutoProgressItem(
                `Completed ${recentTests.length} mock tests this week`,
                'Mock Tests',
                Date.now(),
                '📊'
            );
        }
    }
}

// Sync Learning Goals Progress
function syncLearningGoalsProgress() {
    const learningGoals = JSON.parse(localStorage.getItem('learningGoals')) || [];
    const completedGoals = JSON.parse(localStorage.getItem('completedGoals')) || [];
    
    completedGoals.forEach(goal => {
        addAutoProgressItem(
            `Achieved learning goal: ${goal}`,
            'Learning Goals',
            goal.timestamp || Date.now(),
            '🎓'
        );
    });
    
    // Track active goals
    if (learningGoals.length > 0) {
        addAutoProgressItem(
            `Set ${learningGoals.length} learning goals`,
            'Learning Goals',
        Date.now(),
        '📝'
        );
    }
}

// Sync Resume Analysis Progress
function syncResumeAnalysisProgress() {
    const resumeAnalyses = JSON.parse(localStorage.getItem('resumeAnalyses')) || [];
    
    resumeAnalyses.forEach(analysis => {
        if (analysis.suitabilityScore >= 80) {
            addAutoProgressItem(
                `Resume analysis: ${analysis.suitabilityScore}% suitability score`,
                'Resume Analysis',
                analysis.timestamp || Date.now(),
                '📄'
            );
        }
        
        // Track skill improvements
        if (analysis.strengths && analysis.strengths.length > 0) {
            addAutoProgressItem(
                `Identified ${analysis.strengths.length} key strengths in resume`,
                'Resume Analysis',
                analysis.timestamp || Date.now(),
                '✅'
            );
        }
    });
}

// Sync AI Learning Progress
function syncAILearningProgress() {
    const aiChatSessions = JSON.parse(localStorage.getItem('aiChatSessions')) || [];
    
    aiChatSessions.forEach(session => {
        if (session.messages && session.messages.length > 5) {
            addAutoProgressItem(
                `Engaged in AI learning session: ${session.title}`,
                'AI Learning',
                session.timestamp || Date.now(),
                '🤖'
            );
        }
    });
    
    // Track learning sessions
    if (aiChatSessions.length > 0) {
        addAutoProgressItem(
            `Completed ${aiChatSessions.length} AI learning sessions`,
            'AI Learning',
            Date.now(),
            '💡'
        );
    }
}

// Sync Company Tests Progress
function syncCompanyTestsProgress() {
    const companyTestResults = JSON.parse(localStorage.getItem('companyTestResults')) || [];
    
    companyTestResults.forEach(result => {
        if (result.score >= 75) {
            addAutoProgressItem(
                `Completed ${result.companyName} test with ${result.score}%`,
                'Company Tests',
                result.timestamp || Date.now(),
                '🏢'
            );
        }
    });
}

// Sync Interview Progress
function syncInterviewProgress() {
    const interviewSessions = JSON.parse(localStorage.getItem('interviewSessions')) || [];
    
    interviewSessions.forEach(session => {
        addAutoProgressItem(
            `Completed interview simulation: ${session.type}`,
            'Interview Practice',
            session.timestamp || Date.now(),
            '🎤'
        );
    });
}

// Add automatic progress item (prevents duplicates)
function addAutoProgressItem(item, category, timestamp, icon = '📈') {
    const existingItem = progressItems.find(p => 
        p.item === item && p.category === category && 
        Math.abs(p.timestamp - timestamp) < 60000 // Within 1 minute
    );
    
    if (!existingItem) {
        const progressItem = {
            id: timestamp,
            item: item,
            category: category,
            date: new Date(timestamp).toISOString(),
            timestamp: timestamp,
            icon: icon,
            autoTracked: true
        };
        
        progressItems.unshift(progressItem);
        localStorage.setItem('progressItems', JSON.stringify(progressItems));
        
        console.log(`Auto-tracked progress: ${item}`);
    }
}

// Enhanced form validation
function validateProgressItem(item, category) {
    const errors = [];
    
    if (!item || item.trim().length < 5) {
        errors.push('Please enter a valid progress item (minimum 5 characters).');
    }
    
    if (!category || category.trim().length < 3) {
        errors.push('Please enter a valid category (minimum 3 characters).');
    }
    
    return errors;
}

// Enhanced form submission
progressForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const item = progressItemInput.value.trim();
    const category = progressCategoryInput.value.trim();
    
    // Validate form data
    const validationErrors = validateProgressItem(item, category);
    if (validationErrors.length > 0) {
        validationErrors.forEach(error => {
            showNotification(error, 'warning');
        });
        return;
    }
    
    // Set loading state
    setLoadingState(true);
    
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Create progress item with timestamp
        const progressItem = {
            id: Date.now(),
            item: item,
            category: category,
            date: new Date().toISOString(),
            timestamp: Date.now(),
            icon: '📝',
            autoTracked: false
        };
        
        // Add to progress items
        progressItems.unshift(progressItem);
        
        // Update localStorage
        localStorage.setItem('progressItems', JSON.stringify(progressItems));
        
        // Update UI
        updateProgressList();
        updateProgressStats();
        
        // Success animation and notification
        showNotification('Progress item added successfully! 🎉', 'success');
        
        // Reset form
        progressForm.reset();
        
    } catch (error) {
        console.error('Error adding progress item:', error);
        showNotification('Failed to add progress item. Please try again.', 'error');
    } finally {
        setLoadingState(false);
    }
});

// Enhanced progress list update
function updateProgressList() {
    if (!progressListUl) return;
    
    if (progressItems.length === 0) {
        noProgress.style.display = 'block';
        progressListUl.innerHTML = '';
        return;
    }
    
    noProgress.style.display = 'none';
    
    progressListUl.innerHTML = progressItems.map(item => `
        <li class="progress-item" data-id="${escapeHTML(item.id)}">
            <div class="progress-content">
                <div class="progress-header">
                    <span class="progress-icon">${escapeHTML(item.icon || '📈')}</span>
                    <span class="progress-category">${escapeHTML(item.category)}</span>
                    ${item.autoTracked ? '<span class="auto-tracked-badge">Auto</span>' : ''}
                </div>
                <div class="progress-text">${escapeHTML(item.item)}</div>
                <div class="progress-date">${formatDate(item.date)}</div>
            </div>
            <button class="delete-progress-btn" onclick="deleteProgressItem(${jsArg(item.id)})">×</button>
        </li>
    `).join('');
}

// Delete progress item
function deleteProgressItem(id) {
    progressItems = progressItems.filter(item => item.id !== id);
    localStorage.setItem('progressItems', JSON.stringify(progressItems));
    updateProgressList();
    updateProgressStats();
    showNotification('Progress item deleted successfully!', 'success');
}

// Update progress statistics
function updateProgressStats() {
    const now = new Date();
    const oneWeekAgo = now.getTime() - (7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = now.getTime() - (30 * 24 * 60 * 60 * 1000);
    
    const totalItems = progressItems.length;
    const thisWeek = progressItems.filter(item => item.timestamp >= oneWeekAgo).length;
    const thisMonth = progressItems.filter(item => item.timestamp >= oneMonthAgo).length;
    
    totalItemsElement.textContent = totalItems;
    thisWeekElement.textContent = thisWeek;
    thisMonthElement.textContent = thisMonth;
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        return 'Today';
    } else if (diffDays === 1) {
        return 'Yesterday';
    } else if (diffDays < 7) {
        return `${diffDays} days ago`;
    } else {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
}

// Loading state management
function setLoadingState(isLoading) {
    if (isLoading) {
        btnText.style.display = 'none';
        loadingSpinner.style.display = 'block';
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.7';
    } else {
        btnText.style.display = 'block';
        loadingSpinner.style.display = 'none';
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
    }
}

// Enhanced notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 10px;
        color: white;
        font-family: 'Inter', sans-serif;
        font-weight: 500;
        z-index: 1000;
        max-width: 400px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        animation: slideInRight 0.3s ease;
        backdrop-filter: blur(10px);
    `;
    
    // Set background color based on type
    switch (type) {
        case 'success':
            notification.style.background = 'rgba(34, 197, 94, 0.9)';
            break;
        case 'error':
            notification.style.background = 'rgba(239, 68, 68, 0.9)';
            break;
        case 'warning':
            notification.style.background = 'rgba(245, 158, 11, 0.9)';
            break;
        default:
            notification.style.background = 'rgba(59, 130, 246, 0.9)';
    }
    
    notification.textContent = message;
    
    // Add close button
    const closeBtn = document.createElement('span');
    closeBtn.innerHTML = '&times;';
    closeBtn.style.cssText = `
        margin-left: 10px;
        cursor: pointer;
        font-size: 18px;
        font-weight: bold;
        opacity: 0.8;
        transition: opacity 0.3s ease;
    `;
    
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    });
    
    notification.appendChild(closeBtn);
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
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

// Add enhanced CSS for animations and auto-tracked items
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
    
    .form-group input:focus {
        outline: none;
        border-color: rgba(255, 255, 255, 0.6);
        box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
        transform: translateY(-2px);
    }
    
    .form-group input:hover {
        background: rgba(255, 255, 255, 0.15);
    }
    
    .progress-item {
        animation: fadeInUp 0.4s ease-out;
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .auto-tracked-badge {
        background: rgba(59, 130, 246, 0.8);
        color: white;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 0.7rem;
        font-weight: 500;
        margin-left: 8px;
    }
    
    .progress-icon {
        font-size: 1.2rem;
        margin-right: 8px;
    }
    
    .progress-header {
        display: flex;
        align-items: center;
        margin-bottom: 5px;
    }
    
    .progress-category {
        font-weight: 600;
        color: rgba(255, 255, 255, 0.9);
    }
`;
document.head.appendChild(style);

// Initialize page with enhanced functionality and real-time tracking
document.addEventListener('DOMContentLoaded', () => {
    console.log('Progress Profile page loaded with real-time tracking');
    
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
    
    // Initialize progress list and stats
    updateProgressList();
    updateProgressStats();
    
    // Sync progress from other features
    syncProgressFromOtherFeatures();
    
    // Set up periodic sync (every 5 minutes)
    setInterval(syncProgressFromOtherFeatures, 5 * 60 * 1000);
    
    // Welcome notification
    showNotification('Welcome to Progress Profile! Now with real-time tracking from all your activities! 🚀', 'info');
});