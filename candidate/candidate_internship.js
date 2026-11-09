// JWT token handling
let token, username;

// Fallback JWT decode function
function decodeJWT(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('JWT decode error:', error);
        return { username: 'Anonymous User' };
    }
}

try {
    token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No token found');
    }
    
    // Try different JWT decode methods
    if (typeof jwtDecode !== 'undefined') {
        username = jwtDecode(token).username;
    } else if (typeof window.safeJWTDecode !== 'undefined') {
        username = window.safeJWTDecode(token).username;
    } else {
        username = decodeJWT(token).username;
    }
    
    console.log('Username extracted:', username);
} catch (error) {
    console.error('Authentication error:', error);
    username = 'Anonymous User';
}

// Project data
let projects = JSON.parse(localStorage.getItem('opensource_projects')) || [];

// Refresh projects from localStorage
function refreshProjectsFromStorage() {
    console.log('Refreshing projects from localStorage...');
    const storedProjects = localStorage.getItem('opensource_projects');
    console.log('Raw localStorage data:', storedProjects);
    
    if (storedProjects) {
        try {
            projects = JSON.parse(storedProjects);
            console.log('Parsed projects:', projects);
        } catch (error) {
            console.error('Error parsing projects from localStorage:', error);
            projects = [];
        }
    } else {
        console.log('No projects found in localStorage');
        projects = [];
    }
}

// Load projects from localStorage
function loadProjects() {
    console.log('Loading projects...');
    
    // Refresh from localStorage first
    refreshProjectsFromStorage();
    
    const container = document.getElementById('projectListContainer');
    const noProjects = document.getElementById('noProjects');
    
    if (!container || !noProjects) {
        console.error('Project containers not found');
        return;
    }

    console.log('Current projects from localStorage:', projects);
    console.log('Projects length:', projects.length);

    if (projects.length === 0) {
        console.log('No projects found, showing no projects message');
        noProjects.style.display = 'block';
        container.innerHTML = '';
        return;
    }

    console.log('Projects found, displaying them...');
    noProjects.style.display = 'none';
    displayProjects(projects);
}

// Display projects
function displayProjects(projectList) {
    const container = document.getElementById('projectListContainer');
    
    if (!container) {
        console.error('Project container not found');
        return;
    }

    let projectsHTML = '';
    projectList.forEach((project, index) => {
        const statusClass = project.status === 'Planning' ? 'status-open' : 'status-in-progress';
        
        projectsHTML += `
            <div class="project-item">
                <div class="project-header">
                    <div class="project-name">${escapeHTML(project.name)}</div>
                    <span class="project-status ${statusClass}">${escapeHTML(project.status)}</span>
                </div>
                <div class="project-details">
                    <p><strong>📝 Description:</strong> ${escapeHTML(project.description)}</p>
                    <p><strong>🛠️ Technologies:</strong> ${escapeHTML(project.technologies)}</p>
                    <p><strong>👥 Contributors Needed:</strong> ${escapeHTML(project.contributorsNeeded)}</p>
                    <p><strong>👤 Posted by:</strong> ${escapeHTML(project.postedBy)}</p>
                    <p><strong>📅 Posted on:</strong> ${new Date(project.postedAt).toLocaleDateString()}</p>
                </div>
                <div class="project-actions">
                    <button class="btn btn-primary" onclick="contactProjectOwner(${jsArg(project.postedBy)}, ${jsArg(project.contactEmail)}, ${jsArg(project.contactPhone || '')})">
                        📞 Contact Owner
                    </button>
                    <button class="btn btn-success" onclick="joinProject(${jsArg(project.name)}, ${index})">
                        🤝 Join Project
                    </button>
                </div>
            </div>
        `;
    });

    container.innerHTML = projectsHTML;
}

// Contact project owner
function contactProjectOwner(ownerName, email, phone) {
    const modal = document.getElementById('contactModal');
    const contactInfo = document.getElementById('contactInfo');
    
    if (!modal || !contactInfo) {
        console.error('Contact modal elements not found');
        return;
    }

    let contactHTML = `
        <div class="contact-item">
            <div class="contact-label">👤 Project Owner</div>
            <div class="contact-value">${escapeHTML(ownerName)}</div>
        </div>
        <div class="contact-item">
            <div class="contact-label">📧 Email</div>
            <div class="contact-value">${escapeHTML(email)}</div>
        </div>
    `;
    
    if (phone) {
        contactHTML += `
            <div class="contact-item">
                <div class="contact-label">📱 Phone</div>
                <div class="contact-value">${escapeHTML(phone)}</div>
            </div>
        `;
    }

    contactHTML += `
        <div class="contact-item">
            <div class="contact-label">💡 Next Steps</div>
            <div class="contact-value">Reach out to discuss collaboration opportunities and how you can contribute to this project!</div>
        </div>
    `;

    contactInfo.innerHTML = contactHTML;
    modal.style.display = 'flex';
}

// Close contact modal
function closeContactModal() {
    const modal = document.getElementById('contactModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Join project
function joinProject(projectName, projectIndex) {
    showNotification(`🎉 You've joined ${projectName}! The project owner will be notified.`, 'success');
    
    // Update project to show you've joined
    if (projects[projectIndex]) {
        if (!projects[projectIndex].contributors) {
            projects[projectIndex].contributors = [];
        }
        projects[projectIndex].contributors.push(username);
        localStorage.setItem('opensource_projects', JSON.stringify(projects));
        
        // Refresh the display
        loadProjects();
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 10px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        max-width: 400px;
        word-wrap: break-word;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        animation: slideIn 0.3s ease;
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
    document.body.appendChild(notification);

    // Remove notification after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize when DOM is ready
function initializePage() {
    console.log('DOM loaded, initializing open source contribution page...');
    
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

    // Form handling
    const projectForm = document.getElementById('projectForm');
    if (projectForm) {
        projectForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            console.log('Form submitted, checking data...');
            
            const projectName = document.getElementById('projectName').value;
            const projectDescription = document.getElementById('projectDescription').value;
            const technologies = document.getElementById('technologies').value;
            const contributorsNeeded = document.getElementById('contributorsNeeded').value;
            const projectStatus = document.getElementById('projectStatus').value;
            const contactEmail = document.getElementById('contactEmail').value;
            const contactPhone = document.getElementById('contactPhone').value;

            console.log('Form data:', {
                projectName,
                projectDescription,
                technologies,
                contributorsNeeded,
                projectStatus,
                contactEmail,
                contactPhone,
                username
            });

            if (!projectName || !projectDescription || !technologies || !contributorsNeeded || !projectStatus || !contactEmail) {
                showNotification('Please fill in all required fields.', 'error');
                return;
            }

            // Use a fallback username if JWT decoding fails
            const currentUser = username || 'Anonymous User';

            // Create new project
            const newProject = {
                name: projectName,
                description: projectDescription,
                technologies: technologies,
                contributorsNeeded: contributorsNeeded,
                status: projectStatus,
                contactEmail: contactEmail,
                contactPhone: contactPhone,
                postedBy: currentUser,
                postedAt: new Date().toISOString(),
                contributors: []
            };

            console.log('New project created:', newProject);

            // Add to projects array
            projects.unshift(newProject); // Add to beginning
            
            console.log('Updated projects array:', projects);
            
            // Save to localStorage
            localStorage.setItem('opensource_projects', JSON.stringify(projects));
            
            console.log('Projects saved to localStorage');

            // Reset form
            projectForm.reset();

            // Small delay to ensure localStorage is saved, then refresh display
            setTimeout(() => {
                loadProjects();
            }, 100);

            // Show success message
            showNotification('🚀 Your open source project has been posted successfully! Other developers can now discover and join your project.', 'success');
        });
    } else {
        console.error('Project form not found in DOM');
    }

    // Load existing projects
    loadProjects();
}

// Check if DOM is already loaded
if (document.readyState === 'loading') {
    // DOM is still loading, wait for it
    document.addEventListener('DOMContentLoaded', initializePage);
} else {
    // DOM is already loaded, initialize immediately
    initializePage();
}

// Welcome notification
showNotification('Welcome to OpenSource Contribution! Share your projects and connect with other developers.', 'info');