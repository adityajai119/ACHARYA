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
    
    // Set up refresh jobs button
    const refreshJobsButton = document.getElementById('refreshJobs');
    if (refreshJobsButton) {
        refreshJobsButton.addEventListener('click', () => {
            console.log('Refresh jobs button clicked');
            showNotification('🔄 Refreshing jobs...', 'info');
            fetchJobs();
        });
    }
    
    // Load jobs data
    fetchJobs();
});

const jobListUl = document.getElementById('jobListUl');
const loadingMessage = document.querySelector('.loading-message');
const applyJobForm = document.getElementById('applyJobForm');
const submitBtn = document.querySelector('.submit-btn');
const btnText = document.querySelector('.btn-text');
const loadingSpinner = document.querySelector('.loading-spinner');

// Get token
const token = localStorage.getItem('token');

// Update job list with modern styling and enhanced details
const updateJobList = (jobs) => {
    if (jobs.length === 0) {
        jobListUl.innerHTML = `
            <div class="no-jobs">
                <h3>📭 No Jobs Available</h3>
                <p>No jobs are currently posted. Check back later for new opportunities!</p>
            </div>
        `;
        return;
    }
    
    jobListUl.innerHTML = jobs.map(job => {
        const jobTypeClass = `job-type-${job.type ? job.type.toLowerCase().replace('-', '') : 'fulltime'}`;
        const jobTypeEmoji = {
            'Full-time': '⏰',
            'Part-time': '⏱️',
            'Contract': '📋',
            'Internship': '🎓',
            'Remote': '🏠'
        }[job.type] || '💼';

        return `
            <li class="job-item" data-job-title="${escapeHTML(job.title)}" data-job-company="${escapeHTML(job.company)}" data-job-location="${escapeHTML(job.location)}">
                <div class="job-info">
                    <div class="job-title">${escapeHTML(job.title)}</div>
                    <div class="job-details">
                        <span class="job-company">🏢 ${escapeHTML(job.company)}</span> • 
                        <span class="job-location">📍 ${escapeHTML(job.location)}</span>
                        ${job.salary ? `• 💰 ${escapeHTML(job.salary)}` : ''}
                        <span class="job-type-badge ${escapeHTML(jobTypeClass)}">
                            ${jobTypeEmoji} ${escapeHTML(job.type || 'Full-time')}
                        </span>
                    </div>
                    ${job.description ? `
                        <div class="job-description">
                            📄 ${escapeHTML(job.description.substring(0, 150))}${job.description.length > 150 ? '...' : ''}
                        </div>
                    ` : ''}
                </div>
                <div class="job-action">
                    <span class="select-hint">Click to select</span>
                </div>
            </li>
        `;
    }).join('');
    
    // Add click handlers for job selection
    document.querySelectorAll('.job-item').forEach(item => {
        item.addEventListener('click', () => {
            // Remove previous selection
            document.querySelectorAll('.job-item').forEach(job => job.classList.remove('selected'));
            
            // Add selection to clicked item
            item.classList.add('selected');
            
            // Auto-fill the job title in the form
            const jobTitle = item.dataset.jobTitle;
            document.getElementById('jobApply').value = jobTitle;
            
            // Show success feedback
            showNotification(`Selected: ${jobTitle}`, 'success');
        });
    });
};

// Fetch jobs with enhanced error handling
const fetchJobs = async () => {
    try {
        console.log('Fetching available jobs...');
        
        // Show loading state
        if (loadingMessage) {
            loadingMessage.style.display = 'block';
            loadingMessage.textContent = '🔄 Loading available jobs...';
            loadingMessage.style.color = '#ffffff';
        }
        
        const response = await fetch('http://localhost:8000/api/jobs', {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });
        
        console.log('Jobs response status:', response.status);
        
        if (response.ok) {
            const jobs = await response.json();
            console.log('Jobs received:', jobs);
            
            // Hide loading message
            if (loadingMessage) {
                loadingMessage.style.display = 'none';
            }
            
            updateJobList(jobs);
            showNotification(`✅ Loaded ${jobs.length} available jobs`, 'success');
        } else {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.error('Error fetching jobs:', error);
        
        // Show error state
        if (loadingMessage) {
            loadingMessage.textContent = '❌ Failed to load jobs. Please try again.';
            loadingMessage.style.color = '#ef4444';
        }
        
        showNotification('❌ Failed to load jobs. Please try again.', 'error');
    }
};

// Form submission with enhanced UX
applyJobForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const jobTitle = document.getElementById('jobApply').value.trim();
    const resumeFile = document.getElementById('resumeUpload').files[0];
    
    // Validation
    if (!jobTitle) {
        showNotification('Please select a job to apply for.', 'error');
        return;
    }
    
    if (!resumeFile) {
        showNotification('Please upload your resume.', 'error');
        return;
    }
    
    // File size validation (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (resumeFile.size > maxSize) {
        showNotification('Resume file size should be less than 5MB.', 'error');
        return;
    }
    
    // File type validation
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(resumeFile.type)) {
        showNotification('Please upload a PDF, DOC, or DOCX file.', 'error');
        return;
    }
    
    // Show loading state
    setLoadingState(true);
    
    try {
        console.log('Submitting application for job:', jobTitle);
        
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('job', jobTitle);
        formData.append('resume', resumeFile);
        formData.append('status', 'Pending');
        
        const response = await fetch('http://localhost:8000/api/applications', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData
        });
        
        console.log('Application response status:', response.status);
        
        if (response.ok) {
            const result = await response.json();
            console.log('Application result:', result);
            
            showNotification('Application submitted successfully!', 'success');
            
            // Reset form
            applyJobForm.reset();
            document.querySelectorAll('.job-item').forEach(job => job.classList.remove('selected'));
            
            // Add success animation
            const applyCard = document.querySelector('.apply-card');
            applyCard.classList.add('success-animation');
            setTimeout(() => {
                applyCard.classList.remove('success-animation');
            }, 600);
            
        } else {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.error('Error submitting application:', error);
        showNotification('Failed to submit application. Please try again.', 'error');
    } finally {
        setLoadingState(false);
    }
});

// Loading state management
function setLoadingState(isLoading) {
    if (isLoading) {
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        loadingSpinner.style.display = 'block';
        submitBtn.style.cursor = 'not-allowed';
    } else {
        submitBtn.disabled = false;
        btnText.style.display = 'block';
        loadingSpinner.style.display = 'none';
        submitBtn.style.cursor = 'pointer';
    }
}

// Notification system
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

    // Add styles
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
    `;

    if (type === 'success') {
        notification.style.background = 'rgba(34, 197, 94, 0.9)';
    } else if (type === 'error') {
        notification.style.background = 'rgba(239, 68, 68, 0.9)';
    } else {
        notification.style.background = 'rgba(59, 130, 246, 0.9)';
    }

    document.body.appendChild(notification);

    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.remove();
    });

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Add CSS for notification animation and job styling
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
    
    .no-jobs {
        text-align: center;
        color: rgba(255, 255, 255, 0.7);
        padding: 30px;
        font-family: 'Inter', sans-serif;
        font-size: 1.1rem;
    }
    
    .no-jobs h3 {
        font-family: 'Orbitron', sans-serif;
        font-size: 1.5rem;
        margin-bottom: 10px;
        color: #ffffff;
    }
    
    .no-jobs p {
        font-size: 1rem;
        opacity: 0.8;
    }
    
    .job-action {
        font-size: 0.8rem;
        color: rgba(255, 255, 255, 0.6);
        font-family: 'Inter', sans-serif;
    }
    
    .job-info {
        flex: 1;
    }
    
    .job-description {
        margin-top: 8px;
        color: rgba(255, 255, 255, 0.7);
        font-size: 0.9rem;
        line-height: 1.4;
    }
    
    .job-type-badge {
        display: inline-block;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 600;
        text-transform: uppercase;
        margin-left: 10px;
    }
    
    .job-type-fulltime {
        background: rgba(76, 175, 80, 0.2);
        color: #4caf50;
        border: 1px solid rgba(76, 175, 80, 0.3);
    }
    
    .job-type-parttime {
        background: rgba(255, 193, 7, 0.2);
        color: #ffc107;
        border: 1px solid rgba(255, 193, 7, 0.3);
    }
    
    .job-type-contract {
        background: rgba(156, 39, 176, 0.2);
        color: #9c27b0;
        border: 1px solid rgba(156, 39, 176, 0.3);
    }
    
    .job-type-internship {
        background: rgba(33, 150, 243, 0.2);
        color: #2196f3;
        border: 1px solid rgba(33, 150, 243, 0.3);
    }
    
    .job-type-remote {
        background: rgba(255, 152, 0, 0.2);
        color: #ff9800;
        border: 1px solid rgba(255, 152, 0, 0.3);
    }
    
    .job-item.selected {
        background: rgba(76, 175, 80, 0.2);
        border-color: rgba(76, 175, 80, 0.5);
        transform: translateX(10px);
    }
    
    .job-item.selected .select-hint {
        color: #4caf50;
        font-weight: 600;
    }
    
    .job-item:hover {
        background: rgba(255, 255, 255, 0.15);
        transform: translateX(5px);
    }
    
    .job-item.selected:hover {
        background: rgba(76, 175, 80, 0.3);
    }
`;
document.head.appendChild(style);

// Initialize jobs data
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, fetching jobs...');
    fetchJobs();
});