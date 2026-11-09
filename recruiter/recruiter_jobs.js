// Modern Recruiter Jobs Management
// Enhanced with better error handling and UI improvements

// Debug: Log the API URL being used
console.log('Recruiter Jobs JS loaded - API URL will be: http://localhost:8000/api/jobs');

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Recruiter Jobs page loaded');
    initializeJobs();
});

// Initialize jobs functionality
function initializeJobs() {
    // Check authentication first
    if (!token) {
        console.error('No authentication token found');
        showNotification('Please log in to access this page.', 'error');
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 2000);
        return;
    }
    
    console.log('Initializing jobs with token:', !!token);
    
    // Set up back button
    const backButton = document.getElementById('back');
    if (backButton) {
        backButton.addEventListener('click', () => {
            console.log('Back button clicked, navigating to dashboard...');
            try {
                window.location.href = 'recruiter_dashboard.html';
            } catch (error) {
                console.error('Navigation error:', error);
                window.location.replace('recruiter_dashboard.html');
            }
        });
    }

    // Set up form submission
    const postJobForm = document.getElementById('postJobForm');
    if (postJobForm) {
        postJobForm.addEventListener('submit', handlePostJob);
    }

    // Set up test API button
    const testAPIButton = document.getElementById('testAPI');
    if (testAPIButton) {
        testAPIButton.addEventListener('click', testAPIConnection);
    }

    // Load jobs
    fetchJobs();
}

// Test API connection function
async function testAPIConnection() {
    console.log('Testing API connection...');
    showNotification('Testing API connection...', 'info');
    
    try {
        const response = await fetch('http://localhost:8000/api/jobs', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Test API response status:', response.status);
        
        if (response.ok) {
            const jobs = await response.json();
            showNotification(`✅ API connection successful! Found ${jobs.length} jobs.`, 'success');
        } else {
            const errorText = await response.text();
            showNotification(`❌ API test failed: ${response.status} - ${errorText}`, 'error');
        }
    } catch (error) {
        console.error('API test error:', error);
        showNotification(`❌ API test failed: ${error.message}`, 'error');
    }
}

// Get token from localStorage
const token = localStorage.getItem('token');

// Debug function to check token contents
function debugToken() {
    if (!token) {
        console.error('No token found');
        return;
    }
    
    try {
        // Simple JWT decode (for debugging)
        const parts = token.split('.');
        if (parts.length === 3) {
            const payload = parts[1];
            const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
            const decodedPayload = atob(paddedPayload.replace(/-/g, '+').replace(/_/g, '/'));
            const tokenData = JSON.parse(decodedPayload);
            
            console.log('Token contents:', tokenData);
            console.log('User role:', tokenData.role);
            console.log('Username:', tokenData.username);
            
            return tokenData;
        }
    } catch (error) {
        console.error('Error decoding token:', error);
    }
}

// Debug token on page load
console.log('=== TOKEN DEBUG ===');
debugToken();
console.log('=== END TOKEN DEBUG ===');

// Update job list with modern UI
const updateJobList = (jobs) => {
    const list = document.querySelector('#jobList ul');
    if (!list) {
        console.error('Job list element not found');
        return;
    }

    if (!jobs || jobs.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <h3>📭 No Jobs Posted</h3>
                <p>You haven't posted any jobs yet. Start by creating your first job posting!</p>
            </div>
        `;
        return;
    }

    list.innerHTML = jobs.map(job => {
        const jobTypeClass = `job-type-${job.type ? job.type.toLowerCase().replace('-', '') : 'fulltime'}`;
        const jobTypeEmoji = {
            'Full-time': '⏰',
            'Part-time': '⏱️',
            'Contract': '📋',
            'Internship': '🎓',
            'Remote': '🏠'
        }[job.type] || '💼';

        return `
            <li class="job-item">
                <div class="job-info">
                    <div class="job-title">${escapeHTML(job.title)}</div>
                    <div class="job-details">
                        🏢 ${escapeHTML(job.company)} • 📍 ${escapeHTML(job.location)}
                        ${job.salary ? `• 💰 ${escapeHTML(job.salary)}` : ''}
                        <span class="job-type-badge ${escapeHTML(jobTypeClass)}">
                            ${jobTypeEmoji} ${escapeHTML(job.type || 'Full-time')}
                        </span>
                    </div>
                    ${job.description ? `<div style="color: rgba(255,255,255,0.7); font-size: 0.9rem; margin-top: 8px;">📄 ${escapeHTML(job.description.substring(0, 100))}${job.description.length > 100 ? '...' : ''}</div>` : ''}
                </div>
                <div class="job-actions">
                    <button onclick="editJob(${jsArg(job._id)}, ${jsArg(job.title)}, ${jsArg(job.company)}, ${jsArg(job.location)}, ${jsArg(job.description || '')}, ${jsArg(job.salary || '')}, ${jsArg(job.type || 'Full-time')})" class="edit-btn">
                        ✏️ Edit
                    </button>
                    <button onclick="deleteJob(${jsArg(job._id)})" class="delete-btn">
                        🗑️ Delete
                    </button>
                </div>
            </li>
        `;
    }).join('');
};

// Fetch jobs with error handling
const fetchJobs = async () => {
    try {
        showLoadingState(true);
        
        // Check authentication
        if (!token) {
            console.error('No token available for fetching jobs');
            showNotification('Authentication required. Please log in again.', 'error');
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 2000);
            return;
        }
        
        console.log('Fetching jobs with token:', !!token);
        
        const apiUrl = 'http://localhost:8000/api/jobs';
        console.log('Making request to:', apiUrl);
        
        const response = await fetch(apiUrl, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });

        console.log('Jobs response status:', response.status);
        console.log('Jobs response headers:', response.headers);

        if (response.ok) {
            const jobs = await response.json();
            console.log('Jobs fetched successfully:', jobs);
            updateJobList(jobs);
            showNotification('Jobs loaded successfully', 'success');
        } else {
            const errorText = await response.text();
            console.error('Failed to fetch jobs with status:', response.status);
            console.error('Error response:', errorText);
            
            if (response.status === 401) {
                showNotification('Authentication failed. Please log in again.', 'error');
                setTimeout(() => {
                    window.location.href = '../index.html';
                }, 2000);
            } else {
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
        }
    } catch (error) {
        console.error('Failed to fetch jobs:', error);
        showNotification('Failed to fetch jobs. Please try again.', 'error');
        
        // Show empty state with error
        const list = document.querySelector('#jobList ul');
        if (list) {
            list.innerHTML = `
                <div class="empty-state">
                    <h3>⚠️ Error Loading Jobs</h3>
                    <p>Unable to load jobs. Please check your connection and try again.</p>
                </div>
            `;
        }
    } finally {
        showLoadingState(false);
    }
};

// Handle job posting
const handlePostJob = async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('jobTitle').value.trim();
    const company = document.getElementById('jobCompany').value.trim();
    const location = document.getElementById('jobLocation').value.trim();
    const description = document.getElementById('jobDescription').value.trim();
    const salary = document.getElementById('jobSalary').value.trim();
    const type = document.getElementById('jobType').value;

    // Basic validation
    if (!title || !company || !location) {
        showNotification('Please fill in all required fields (Title, Company, Location)', 'error');
        return;
    }

    // Check authentication
    if (!token) {
        showNotification('Authentication required. Please log in again.', 'error');
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 2000);
        return;
    }

    try {
        showLoadingState(true);
        
        const jobData = {
            title,
            company,
            location,
            description,
            salary,
            type
        };

        console.log('Posting job with data:', jobData);
        console.log('Token available:', !!token);
        
        // Debug token contents before posting
        const tokenData = debugToken();
        console.log('Current user role:', tokenData?.role);
        console.log('Current username:', tokenData?.username);

        const response = await fetch('http://localhost:8000/api/jobs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(jobData),
        });

        console.log('Job posting response status:', response.status);
        console.log('Job posting response headers:', response.headers);

        if (response.ok) {
            const result = await response.json();
            console.log('Job posted successfully:', result);
            showNotification('Job posted successfully!', 'success');
            
            // Reset form
            e.target.reset();
            
            // Refresh jobs list
            await fetchJobs();
        } else {
            const errorText = await response.text();
            console.error('Job posting failed with status:', response.status);
            console.error('Error response:', errorText);
            
            if (response.status === 401) {
                showNotification('Authentication failed. Please log in again.', 'error');
                setTimeout(() => {
                    window.location.href = '../index.html';
                }, 2000);
            } else if (response.status === 403) {
                showNotification('Access denied. Only recruiters can post jobs.', 'error');
            } else {
                showNotification(`Failed to post job: ${errorText}`, 'error');
            }
        }
    } catch (error) {
        console.error('Failed to post job:', error);
        showNotification('Failed to post job. Please check your connection and try again.', 'error');
    } finally {
        showLoadingState(false);
    }
};

// Edit job function
window.editJob = (id, title, company, location, description, salary, type) => {
    // Populate form with job data
    document.getElementById('jobTitle').value = title;
    document.getElementById('jobCompany').value = company;
    document.getElementById('jobLocation').value = location;
    document.getElementById('jobDescription').value = description;
    document.getElementById('jobSalary').value = salary;
    document.getElementById('jobType').value = type;
    
    // Change form to update mode
    const form = document.getElementById('postJobForm');
    const submitButton = form.querySelector('button[type="submit"]');
    
    form.dataset.editId = id;
    submitButton.textContent = '💾 Update Job';
    
    // Scroll to form
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    showNotification('Job loaded for editing. Update the details and click "Update Job"', 'info');
};

// Delete job function
window.deleteJob = async (id) => {
    if (!confirm('Are you sure you want to delete this job?')) {
        return;
    }

    try {
        showLoadingState(true);
        
        const response = await fetch(`http://localhost:8000/api/jobs/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (response.ok) {
            console.log('Job deleted successfully');
            showNotification('Job deleted successfully!', 'success');
            await fetchJobs();
        } else {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.error('Failed to delete job:', error);
        showNotification('Failed to delete job. Please try again.', 'error');
    } finally {
        showLoadingState(false);
    }
};

// Show/hide loading state
function showLoadingState(isLoading) {
    const submitButton = document.querySelector('button[type="submit"]');
    const jobButtons = document.querySelectorAll('.job-item button');
    
    if (isLoading) {
        if (submitButton) {
            submitButton.disabled = true;
            const originalText = submitButton.textContent;
            submitButton.innerHTML = '⏳ Processing... <span class="spinner"></span>';
            submitButton.dataset.originalText = originalText;
        }
        jobButtons.forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.6';
        });
    } else {
        if (submitButton) {
            submitButton.disabled = false;
            const originalText = submitButton.dataset.originalText || '🚀 Post Job';
            submitButton.innerHTML = originalText;
        }
        jobButtons.forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '1';
        });
    }
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(n => n.remove());

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Auto-hide after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease forwards';
        notification.addEventListener('animationend', () => {
            notification.remove();
        });
    }, 4000);
}

// Add CSS for slideOutRight animation if not already present
if (!document.querySelector('#notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}