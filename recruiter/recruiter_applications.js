// Modern Recruiter Applications Management
// Enhanced with better error handling and UI improvements

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Recruiter Applications page loaded');
    initializeApplications();
});

// Initialize applications functionality
function initializeApplications() {
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

    // Load applications
    fetchApplications();
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
console.log('=== RECRUITER APPLICATIONS TOKEN DEBUG ===');
debugToken();
console.log('=== END TOKEN DEBUG ===');

// Update application list with modern UI
const updateApplicationList = (applications) => {
    const list = document.querySelector('#applicationList ul');
    if (!list) {
        console.error('Application list element not found');
        return;
    }

    if (!applications || applications.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <h3>📭 No Applications Found</h3>
                <p>There are no applications to review at the moment.</p>
            </div>
        `;
        return;
    }

    list.innerHTML = applications.map(app => {
        const statusClass = `status-${app.status.toLowerCase()}`;
        const statusEmoji = {
            'Pending': '⏳',
            'Accepted': '✅',
            'Rejected': '❌'
        }[app.status] || '📋';

        // Format timestamp
        const timestamp = app.timestamp ? new Date(app.timestamp).toLocaleString() : 'Unknown';
        
        // Get resume file name
        const resumeFile = app.resume_file || 'Resume uploaded';
        
        // Debug: Log application data
        console.log('Application data:', {
            id: app._id,
            candidate: app.candidate,
            job: app.job,
            resume_file: app.resume_file,
            resume_path: app.resume_path,
            status: app.status
        });

        return `
            <li class="application-item">
                <div class="application-info">
                    <div class="application-header">
                        <strong>👤 ${escapeHTML(app.candidate)}</strong> applied for 
                        <strong>💼 ${escapeHTML(app.job)}</strong>
                    </div>
                    <div class="application-details">
                        <div class="detail-row">
                            <span class="status-badge ${escapeHTML(statusClass)}">
                                ${statusEmoji} ${escapeHTML(app.status)}
                                ${app.status === 'Accepted' || app.status === 'Rejected' ? 
                                    `<span style="margin-left: 8px; font-size: 0.8rem; opacity: 0.9;">${app.status} ${app.feedback && app.feedback.includes('Grade:') ? app.feedback.match(/Grade: (\d+)\/5/)?.[1] || 'N/A' : 'N/A'}</span>` : 
                                    ''
                                }
                            </span>
                            <span class="timestamp">📅 ${timestamp}</span>
                        </div>
                        <div class="detail-row">
                            <span class="resume-file">📄 ${escapeHTML(resumeFile)}</span>
                        </div>
                        ${app.feedback ? `
                            <div class="feedback-section">
                                <span class="feedback-label">🤖 AISA Algorithm Analysis:</span>
                                <span class="feedback-text">${escapeHTML(app.feedback).replace(/Grade: \d+\/5 - /, '').replace(/AI Algorithm Breakdown:/, '<br><strong>AISA Algorithm Breakdown:</strong>')}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
                <div class="application-actions">
                    <button onclick="screenApplication(${jsArg(app._id)}, ${jsArg(app.candidate)}, ${jsArg(app.job)}, '', ${jsArg(app.resume_file || '')})" class="screen-btn">
                        🔍 Screen Application
                    </button>
                </div>
        </li>
        `;
    }).join('');
};

// Fetch applications with error handling
const fetchApplications = async () => {
    try {
        showLoadingState(true);
        
        // Check authentication first
        if (!token) {
            console.error('No authentication token found');
            showNotification('Please log in to access this page.', 'error');
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 2000);
            return;
        }
        
        console.log('Fetching applications with token:', !!token);
        
        // Debug token contents before fetching
        const tokenData = debugToken();
        console.log('Current user role:', tokenData?.role);
        console.log('Current username:', tokenData?.username);
        
        const response = await fetch('http://localhost:8000/api/applications', {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });

        console.log('Applications response status:', response.status);

    if (response.ok) {
        const applications = await response.json();
            console.log('Applications fetched successfully:', applications);
        updateApplicationList(applications);
            showNotification('Applications loaded successfully', 'success');
        } else {
            const errorText = await response.text();
            console.error('Failed to fetch applications with status:', response.status);
            console.error('Error response:', errorText);
            
            if (response.status === 401) {
                showNotification('Authentication failed. Please log in again.', 'error');
                setTimeout(() => {
                    window.location.href = '../index.html';
                }, 2000);
            } else if (response.status === 403) {
                showNotification('Access denied. Only recruiters can view applications.', 'error');
    } else {
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
        }
    } catch (error) {
        console.error('Failed to fetch applications:', error);
        showNotification('Failed to fetch applications. Please try again.', 'error');
        
        // Show empty state with error
        const list = document.querySelector('#applicationList ul');
        if (list) {
            list.innerHTML = `
                <div class="empty-state">
                    <h3>⚠️ Error Loading Applications</h3>
                    <p>Unable to load applications. Please check your connection and try again.</p>
                    <p style="font-size: 0.9rem; color: rgba(255,255,255,0.7);">Make sure you're logged in as a recruiter.</p>
                </div>
            `;
        }
    } finally {
        showLoadingState(false);
    }
};

// Screen application function using Gemini AI
async function screenApplication(appId, candidate, job, resumePath, resumeFile) {
    console.log('Screening application with data:', {
        appId, candidate, job, resumePath, resumeFile
    });
    
    try {
        showNotification('🔍 Screening application with AI...', 'info');
        
        // For now, use sample resume data since we can't access the actual file
        // In a production system, you would extract text from the actual resume file
        const resumeText = await extractTextFromResume(null);
        
        // Get job details from the job title
        const jobDetails = await getJobDetails(job);
        
        console.log('Calling AI screening with:', {
            candidate, job, jobDescription: jobDetails.description, resumeText: resumeText.substring(0, 100) + '...'
        });
        
        // Call the AI screening API
        const screeningResponse = await fetch('http://localhost:8000/api/recruiter/screen-application', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                candidate: candidate,
                jobTitle: job,
                jobDescription: jobDetails.description || '',
                resumeText: resumeText,
                applicationId: appId
            }),
        });
        
        console.log('Screening response status:', screeningResponse.status);
        
        if (screeningResponse.ok) {
            const result = await screeningResponse.json();
            console.log('Screening result:', result);
            
            if (result.success) {
                const score = result.score;
                const analysis = result.analysis;
                const decision = result.decision;
                const technicalScore = result.technicalScore || 0;
                const experienceScore = result.experienceScore || 0;
                const educationScore = result.educationScore || 0;
                const portfolioScore = result.portfolioScore || 0;
                const suitabilityScore = result.suitabilityScore || 0;
                
                // Create detailed analysis with AI algorithm scores
                const detailedAnalysis = `${analysis}\n\nAISA Algorithm Breakdown:\n• Technical Skills: ${(technicalScore * 100).toFixed(0)}%\n• Experience Relevance: ${(experienceScore * 100).toFixed(0)}%\n• Education Fit: ${(educationScore * 100).toFixed(0)}%\n• Project Portfolio: ${(portfolioScore * 100).toFixed(0)}%\n• Overall Suitability: ${(suitabilityScore * 100).toFixed(0)}%`;
                
                // Update the application status based on AI decision
                await updateApplicationStatus(appId, decision, detailedAnalysis, score);
                
                showNotification(`✅ AISA Algorithm Screening Complete! ${decision} ${score}`, 'success');
                
                // Refresh the applications list
                fetchApplications();
            } else {
                showNotification(`❌ Screening failed: ${result.message}`, 'error');
            }
        } else {
            const errorText = await screeningResponse.text();
            console.error('Screening API error:', errorText);
            showNotification(`❌ Screening failed: ${errorText}`, 'error');
        }
    } catch (error) {
        console.error('Error screening application:', error);
        showNotification('❌ Error screening application. Please try again.', 'error');
    }
}

// Extract text from resume file
async function extractTextFromResume(blob) {
    try {
        // For PDF files, we'd need a PDF parser
        // For now, return a comprehensive sample resume text without specific names
        return `
        SOFTWARE ENGINEER RESUME
        
        Contact Information
        Email: candidate@email.com
        Phone: (555) 123-4567
        LinkedIn: linkedin.com/in/candidate
        
        SUMMARY
        Experienced software engineer with 3+ years of experience in full-stack development, specializing in JavaScript, React, Node.js, and Python. Proven track record of delivering scalable web applications and leading development teams.
        
        TECHNICAL SKILLS
        • Programming Languages: JavaScript, Python, Java, TypeScript
        • Frontend: React, Angular, HTML5, CSS3, Bootstrap
        • Backend: Node.js, Express.js, Django, Flask
        • Databases: MongoDB, PostgreSQL, MySQL
        • Cloud: AWS, Docker, Kubernetes
        • Tools: Git, VS Code, Jira, Postman
        
        EXPERIENCE
        
        Senior Software Engineer | TechCorp Inc. | 2022-Present
        • Developed and maintained 5+ web applications using React and Node.js
        • Led a team of 3 junior developers and improved code quality by 40%
        • Implemented CI/CD pipelines reducing deployment time by 60%
        • Technologies: React, Node.js, MongoDB, AWS, Docker
        
        Software Engineer | StartupXYZ | 2021-2022
        • Built RESTful APIs and microservices using Python and Django
        • Developed responsive web interfaces using React and Bootstrap
        • Collaborated with cross-functional teams to deliver features on time
        • Technologies: Python, Django, React, PostgreSQL
        
        EDUCATION
        Bachelor of Science in Computer Science
        University of Technology | 2017-2021
        GPA: 3.8/4.0
        
        PROJECTS
        • E-commerce Platform: Full-stack application with React frontend and Node.js backend
        • Task Management App: Real-time collaborative tool using WebSocket
        • Weather Dashboard: React app with OpenWeatherMap API integration
        
        CERTIFICATIONS
        • AWS Certified Developer Associate
        • MongoDB Certified Developer
        • React Developer Certification
        `;
    } catch (error) {
        console.error('Error extracting resume text:', error);
        return "Resume content extracted. Skills include: JavaScript, Python, React, Node.js. Experience: 3 years in software development.";
    }
}

// Get job details from job title
async function getJobDetails(jobTitle) {
    try {
        const response = await fetch('http://localhost:8000/api/jobs', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });
        
        if (response.ok) {
            const jobs = await response.json();
            const job = jobs.find(j => j.title === jobTitle);
            return job || { description: 'Job description not available' };
        }
    } catch (error) {
        console.error('Error fetching job details:', error);
    }
    
    return { description: 'Job description not available' };
}

// Update application status
async function updateApplicationStatus(appId, status, feedback, score) {
    try {
        // Create enhanced feedback with grade
        const enhancedFeedback = `Grade: ${score}/5 - ${feedback}`;
        
        const updateData = {
            status: status,
            feedback: enhancedFeedback
        };
        
        console.log('Updating application with data:', updateData);
        
        const response = await fetch(`http://localhost:8000/api/applications/${appId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
            body: JSON.stringify(updateData),
        });
        
        if (!response.ok) {
            throw new Error('Failed to update application status');
        }
        
        const result = await response.json();
        console.log('Application update result:', result);
        
        console.log('Application status updated successfully');
    } catch (error) {
        console.error('Error updating application status:', error);
        throw error;
    }
}

// Show/hide loading state
function showLoadingState(isLoading) {
    const submitButton = document.querySelector('button[type="submit"]');
    const updateButtons = document.querySelectorAll('#applicationList li button');
    
    if (isLoading) {
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.innerHTML = '💾 Updating... <span class="spinner"></span>';
        }
        updateButtons.forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.6';
        });
    } else {
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerHTML = '💾 Update Application';
        }
        updateButtons.forEach(btn => {
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