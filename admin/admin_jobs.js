// Admin Jobs Management
document.addEventListener('DOMContentLoaded', function() {
    initializeJobsPage();
});

function initializeJobsPage() {
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

    // Initialize search form
    const searchForm = document.getElementById('searchJobForm');
    if (searchForm) {
        searchForm.addEventListener('submit', handleSearchSubmit);
    }

    // Initialize update form
    const updateForm = document.getElementById('updateJobForm');
    if (updateForm) {
        updateForm.addEventListener('submit', handleUpdateSubmit);
    }

    // Initialize delete button
    const deleteBtn = document.getElementById('deleteJob');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', handleDeleteJob);
    }

    // Load initial jobs
    fetchJobs();
}

const token = localStorage.getItem('token');

const showLoading = () => {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const jobListUl = document.getElementById('jobListUl');
    
    if (loadingIndicator) loadingIndicator.style.display = 'flex';
    if (jobListUl) jobListUl.style.display = 'none';
};

const hideLoading = () => {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const jobListUl = document.getElementById('jobListUl');
    
    if (loadingIndicator) loadingIndicator.style.display = 'none';
    if (jobListUl) jobListUl.style.display = 'block';
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

const updateJobList = (jobs) => {
    const list = document.getElementById('jobListUl');
    const totalJobs = document.getElementById('totalJobs');
    const activeJobs = document.getElementById('activeJobs');
    
    if (!list) return;
    
    // Update stats
    if (totalJobs) totalJobs.textContent = jobs.length;
    if (activeJobs) activeJobs.textContent = jobs.length; // Assuming all jobs are active
    
    if (jobs.length === 0) {
        list.innerHTML = `
            <li class="no-jobs">
                <div style="text-align: center; padding: 40px; color: rgba(255, 255, 255, 0.7);">
                    <h3>📭 No Jobs Available</h3>
                    <p>No jobs are currently posted in the system.</p>
                </div>
            </li>
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
            <li class="job-item" data-job-id="${escapeHTML(job._id)}">
                <div class="job-content">
                    <div class="job-header">
                        <div class="job-title">${escapeHTML(job.title)}</div>
                        <div class="job-type-badge ${escapeHTML(jobTypeClass)}">
                            ${jobTypeEmoji} ${escapeHTML(job.type || 'Full-time')}
                        </div>
                    </div>
                    <div class="job-details">
                        <span class="job-company">🏢 ${escapeHTML(job.company)}</span>
                        <span class="job-location">📍 ${escapeHTML(job.location)}</span>
                        ${job.salary ? `<span class="job-salary">💰 ${escapeHTML(job.salary)}</span>` : ''}
                    </div>
                    <div class="job-id">ID: ${escapeHTML(job._id)}</div>
                </div>
            </li>
        `;
    }).join('');
};

const fetchJobs = async () => {
    showLoading();
    
    try {
        const response = await fetch('http://localhost:8000/api/jobs', {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });
        
        if (response.ok) {
            const jobs = await response.json();
            updateJobList(jobs);
            showNotification(`✅ Loaded ${jobs.length} jobs`, 'success');
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
        console.error('Error fetching jobs:', error);
        showNotification('❌ Failed to load jobs. Please try again.', 'error');
        updateJobList([]);
    } finally {
        hideLoading();
    }
};

const handleSearchSubmit = async (e) => {
    e.preventDefault();
    const jobId = document.getElementById('jobId').value.trim();
    
    if (!jobId) {
        showNotification('❌ Please enter a Job ID', 'error');
        return;
    }
    
    showNotification(`🔍 Searching for job ID: ${jobId}`, 'info');
    
    try {
        const response = await fetch(`http://localhost:8000/api/jobs/${jobId}`, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });
        
        if (response.ok) {
            const job = await response.json();
            document.getElementById('jobDetails').style.display = 'block';
            document.getElementById('jobTitle').textContent = job.title;
            document.getElementById('jobCompany').textContent = job.company;
            document.getElementById('jobLocation').textContent = job.location;
            document.getElementById('updateTitle').value = job.title;
            document.getElementById('updateCompany').value = job.company;
            document.getElementById('updateLocation').value = job.location;
            document.getElementById('updateJobForm').dataset.jobId = job._id;
            showNotification(`✅ Found job: ${job.title}`, 'success');
        } else if (response.status === 404) {
            showNotification('❌ Job not found', 'error');
        } else {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.error('Error searching job:', error);
        showNotification('❌ Failed to search job. Please try again.', 'error');
    }
};

const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    const jobId = e.target.dataset.jobId;
    const title = document.getElementById('updateTitle').value.trim();
    const company = document.getElementById('updateCompany').value.trim();
    const location = document.getElementById('updateLocation').value.trim();
    
    if (!title || !company || !location) {
        showNotification('❌ Please fill in all fields', 'error');
        return;
    }
    
    showNotification('💾 Updating job...', 'info');
    
    try {
        const response = await fetch(`http://localhost:8000/api/jobs/${jobId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ title, company, location }),
        });
        
        if (response.ok) {
            showNotification('✅ Job updated successfully', 'success');
            document.getElementById('jobDetails').style.display = 'none';
            fetchJobs();
        } else {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.error('Error updating job:', error);
        showNotification('❌ Failed to update job. Please try again.', 'error');
    }
};

const handleDeleteJob = async () => {
    const jobId = document.getElementById('updateJobForm').dataset.jobId;
    
    if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
        return;
    }
    
    showNotification('🗑️ Deleting job...', 'info');
    
    try {
        const response = await fetch(`http://localhost:8000/api/jobs/${jobId}`, {
            method: 'DELETE',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });
        
        if (response.ok) {
            showNotification('✅ Job deleted successfully', 'success');
            document.getElementById('jobDetails').style.display = 'none';
            fetchJobs();
        } else {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.error('Error deleting job:', error);
        showNotification('❌ Failed to delete job. Please try again.', 'error');
    }
};