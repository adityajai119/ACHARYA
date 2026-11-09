// DOM elements
const backButton = document.getElementById('back');
const updateProfileForm = document.getElementById('updateProfileForm');
const submitBtn = document.querySelector('.submit-btn');
const btnText = document.querySelector('.btn-text');
const loadingSpinner = document.querySelector('.loading-spinner');

// Get token and username
const token = localStorage.getItem('token');
let username = '';

// Profile progress tracking
let profileProgress = {
    skills: 0,
    experience: 0,
    education: 0,
    projects: 0,
    overall: 0
};

// Fallback JWT decoder function
function decodeJWT(token) {
    try {
        // Simple JWT decoder (for basic tokens)
        const parts = token.split('.');
        if (parts.length !== 3) {
            throw new Error('Invalid JWT format');
        }
        
        // Decode the payload (second part)
        const payload = parts[1];
        // Add padding if needed
        const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
        const decodedPayload = atob(paddedPayload.replace(/-/g, '+').replace(/_/g, '/'));
        
        return JSON.parse(decodedPayload);
    } catch (error) {
        console.error('Error in fallback JWT decoder:', error);
        throw error;
    }
}

// Initialize authentication
function initializeAuth() {
    try {
        if (!token) {
            console.error('No token found in localStorage');
            showNotification('Please log in to access this page.', 'error');
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 2000);
            return false;
        }
        
        let decoded;
        
        // Try to use the external library first
        if (typeof jwtDecode !== 'undefined') {
            decoded = jwtDecode(token);
        } else if (typeof jwt_decode !== 'undefined') {
            // Fallback for older versions
            decoded = jwt_decode(token);
        } else {
            // Fallback to manual decoder
            console.log('Using fallback JWT decoder');
            decoded = decodeJWT(token);
        }
        
        username = decoded.username;
        
        if (!username) {
            console.error('No username found in token');
            showNotification('Invalid authentication token. Please log in again.', 'error');
            localStorage.clear();
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 2000);
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Error decoding token:', error);
        showNotification('Authentication error. Please log in again.', 'error');
        localStorage.clear();
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 2000);
        return false;
    }
}

// Calculate profile completion percentage
function calculateProfileProgress(userData) {
    let completed = 0;
    const total = 4; // skills, experience, education, projects
    
    if (userData.skills && userData.skills.trim() !== '') {
        completed++;
        profileProgress.skills = 100;
    } else {
        profileProgress.skills = 0;
    }
    
    if (userData.experience && userData.experience.trim() !== '') {
        completed++;
        profileProgress.experience = 100;
    } else {
        profileProgress.experience = 0;
    }
    
    if (userData.education && userData.education.trim() !== '') {
        completed++;
        profileProgress.education = 100;
    } else {
        profileProgress.education = 0;
    }
    
    if (userData.projects && userData.projects.trim() !== '') {
        completed++;
        profileProgress.projects = 100;
    } else {
        profileProgress.projects = 0;
    }
    
    profileProgress.overall = Math.round((completed / total) * 100);
    return profileProgress;
}

// Update progress bar in real-time
function updateProgressBar() {
    // Create progress bar if it doesn't exist
    let progressContainer = document.getElementById('profileProgressContainer');
    if (!progressContainer) {
        progressContainer = document.createElement('div');
        progressContainer.id = 'profileProgressContainer';
        progressContainer.style.cssText = `
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            padding: 20px;
            margin-bottom: 20px;
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        `;
        
        const profileCard = document.querySelector('.profile-card');
        if (profileCard) {
            profileCard.parentNode.insertBefore(progressContainer, profileCard);
        }
    }
    
    const progressHTML = `
        <h3 style="color: #ffffff; margin-bottom: 15px; font-family: 'Orbitron', sans-serif;">📊 Profile Completion</h3>
        <div style="margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <span style="color: rgba(255, 255, 255, 0.9); font-weight: 500;">Overall Progress</span>
                <span style="color: #22c55e; font-weight: 600;">${profileProgress.overall}%</span>
            </div>
            <div style="background: rgba(255, 255, 255, 0.2); border-radius: 10px; height: 8px; overflow: hidden;">
                <div style="background: linear-gradient(90deg, #22c55e 0%, #16a34a 100%); height: 100%; width: ${profileProgress.overall}%; transition: width 0.5s ease;"></div>
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span style="color: rgba(255, 255, 255, 0.8); font-size: 0.9rem;">🛠️ Skills</span>
                    <span style="color: ${profileProgress.skills > 0 ? '#22c55e' : '#ef4444'}; font-size: 0.9rem;">${profileProgress.skills}%</span>
                </div>
                <div style="background: rgba(255, 255, 255, 0.1); border-radius: 5px; height: 4px;">
                    <div style="background: ${profileProgress.skills > 0 ? '#22c55e' : '#ef4444'}; height: 100%; width: ${profileProgress.skills}%; transition: width 0.3s ease;"></div>
                </div>
            </div>
            
            <div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span style="color: rgba(255, 255, 255, 0.8); font-size: 0.9rem;">💼 Experience</span>
                    <span style="color: ${profileProgress.experience > 0 ? '#22c55e' : '#ef4444'}; font-size: 0.9rem;">${profileProgress.experience}%</span>
                </div>
                <div style="background: rgba(255, 255, 255, 0.1); border-radius: 5px; height: 4px;">
                    <div style="background: ${profileProgress.experience > 0 ? '#22c55e' : '#ef4444'}; height: 100%; width: ${profileProgress.experience}%; transition: width 0.3s ease;"></div>
                </div>
            </div>
            
            <div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span style="color: rgba(255, 255, 255, 0.8); font-size: 0.9rem;">🎓 Education</span>
                    <span style="color: ${profileProgress.education > 0 ? '#22c55e' : '#ef4444'}; font-size: 0.9rem;">${profileProgress.education}%</span>
                </div>
                <div style="background: rgba(255, 255, 255, 0.1); border-radius: 5px; height: 4px;">
                    <div style="background: ${profileProgress.education > 0 ? '#22c55e' : '#ef4444'}; height: 100%; width: ${profileProgress.education}%; transition: width 0.3s ease;"></div>
                </div>
            </div>
            
            <div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span style="color: rgba(255, 255, 255, 0.8); font-size: 0.9rem;">🚀 Projects</span>
                    <span style="color: ${profileProgress.projects > 0 ? '#22c55e' : '#ef4444'}; font-size: 0.9rem;">${profileProgress.projects}%</span>
                </div>
                <div style="background: rgba(255, 255, 255, 0.1); border-radius: 5px; height: 4px;">
                    <div style="background: ${profileProgress.projects > 0 ? '#22c55e' : '#ef4444'}; height: 100%; width: ${profileProgress.projects}%; transition: width 0.3s ease;"></div>
                </div>
            </div>
        </div>
        
        <div style="margin-top: 15px; padding: 10px; background: rgba(255, 255, 255, 0.05); border-radius: 8px; border-left: 3px solid #22c55e;">
            <p style="margin: 0; color: rgba(255, 255, 255, 0.8); font-size: 0.9rem;">
                ${profileProgress.overall === 100 ? '🎉 Profile Complete! Your profile is fully optimized for job matching.' : 
                  profileProgress.overall >= 75 ? '👍 Great progress! Complete the remaining sections for better job matching.' :
                  profileProgress.overall >= 50 ? '📈 Good start! Keep adding more details to improve your profile.' :
                  '📝 Get started! Add your skills, experience, education, and projects to create a complete profile.'}
            </p>
        </div>
    `;
    
    progressContainer.innerHTML = progressHTML;
}

// Real-time input tracking
function setupRealTimeTracking() {
    const inputs = ['updateSkills', 'updateExperience', 'updateEducation', 'updateProjects'];
    
    inputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', () => {
                updateRealTimeProgress();
            });
        }
    });
}

// Update progress in real-time as user types
function updateRealTimeProgress() {
    const skills = document.getElementById('updateSkills')?.value.trim() || '';
    const experience = document.getElementById('updateExperience')?.value.trim() || '';
    const education = document.getElementById('updateEducation')?.value.trim() || '';
    const projects = document.getElementById('updateProjects')?.value.trim() || '';
    
    // Calculate real-time progress
    let completed = 0;
    const total = 4;
    
    if (skills !== '') {
        completed++;
        profileProgress.skills = 100;
    } else {
        profileProgress.skills = 0;
    }
    
    if (experience !== '') {
        completed++;
        profileProgress.experience = 100;
    } else {
        profileProgress.experience = 0;
    }
    
    if (education !== '') {
        completed++;
        profileProgress.education = 100;
    } else {
        profileProgress.education = 0;
    }
    
    if (projects !== '') {
        completed++;
        profileProgress.projects = 100;
    } else {
        profileProgress.projects = 0;
    }
    
    profileProgress.overall = Math.round((completed / total) * 100);
    
    // Update progress bar
    updateProgressBar();
    
    // Show real-time feedback
    if (profileProgress.overall === 100) {
        showNotification('🎉 Profile Complete! Your profile is fully optimized!', 'success');
    } else if (profileProgress.overall >= 75) {
        showNotification('👍 Great progress! Almost there!', 'info');
    }
}

// Initialize back button when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing back button...');
    
    // Initialize authentication
    if (!initializeAuth()) {
        return;
    }
    
    // Error handling for back button
    const backButton = document.getElementById('back');
    if (backButton) {
        console.log('Back button found, adding event listener...');
        backButton.addEventListener('click', () => {
            console.log('Back button clicked, navigating to dashboard...');
            console.log('Current URL:', window.location.href);
            console.log('Target URL: /static/candidate/candidate_dashboard.html');
            try {
                window.location.href = '/static/candidate/candidate_dashboard.html';
            } catch (error) {
                console.error('Navigation error:', error);
                // Fallback navigation
                window.location.replace('/static/candidate/candidate_dashboard.html');
            }
        });
        console.log('Back button event listener added successfully');
    } else {
        console.error('Back button not found in DOM');
    }
    
    // Load profile data
    fetchProfile();
});

// Fetch and display profile data
const fetchProfile = async () => {
    try {
        console.log('Fetching profile for user:', username);
        
        const response = await fetch(`http://localhost:8000/api/users/${username}`, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const user = await response.json();
        console.log('User data received:', user);
        
        // Update profile display
        document.getElementById('username').textContent = user.username || 'Not available';
        document.getElementById('skills').textContent = user.skills || 'Not set';
        document.getElementById('experience').textContent = user.experience || 'Not set';
        document.getElementById('education').textContent = user.education || 'Not set';
        document.getElementById('projects').textContent = user.projects || 'Not set';
        
        // Pre-fill form fields with current values
        document.getElementById('updateSkills').value = user.skills || '';
        document.getElementById('updateExperience').value = user.experience || '';
        document.getElementById('updateEducation').value = user.education || '';
        document.getElementById('updateProjects').value = user.projects || '';
        
        // Calculate and display progress
        calculateProfileProgress(user);
        updateProgressBar();
        
        // Setup real-time tracking
        setupRealTimeTracking();
        
        showNotification('Profile loaded successfully!', 'success');
        
    } catch (error) {
        console.error('Error fetching profile:', error);
        
        // Set default values if API fails
        document.getElementById('username').textContent = username || 'Not available';
        document.getElementById('skills').textContent = 'Not set';
        document.getElementById('experience').textContent = 'Not set';
        document.getElementById('education').textContent = 'Not set';
        document.getElementById('projects').textContent = 'Not set';
        
        // Calculate progress with empty data
        calculateProfileProgress({});
        updateProgressBar();
        setupRealTimeTracking();
        
        showNotification('Failed to load profile data. Using default values.', 'error');
    }
};

// Form submission with enhanced UX
if (updateProfileForm) {
    updateProfileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get form data
        const skills = document.getElementById('updateSkills').value.trim();
        const experience = document.getElementById('updateExperience').value.trim();
        const education = document.getElementById('updateEducation').value.trim();
        const projects = document.getElementById('updateProjects').value.trim();
        
        // Basic validation
        if (!skills && !experience && !education && !projects) {
            showNotification('Please fill in at least one field to update.', 'error');
            return;
        }
        
        // Show loading state
        setLoadingState(true);
        
        try {
            console.log('Updating profile for user:', username);
            console.log('Update data:', { skills, experience, education, projects });
            
            const response = await fetch(`http://localhost:8000/api/users/${username}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    skills,
                    experience,
                    education,
                    projects
                }),
            });
            
            console.log('Update response status:', response.status);
            
            if (response.ok) {
                const result = await response.json();
                console.log('Profile update result:', result);
                
                // Update display with new values
                document.getElementById('skills').textContent = skills || 'Not set';
                document.getElementById('experience').textContent = experience || 'Not set';
                document.getElementById('education').textContent = education || 'Not set';
                document.getElementById('projects').textContent = projects || 'Not set';
                
                // Update progress with new data
                calculateProfileProgress({ skills, experience, education, projects });
                updateProgressBar();
                
                // Show success message
                showNotification('Profile updated successfully!', 'success');
                
                // Reset form
                updateProfileForm.reset();
                
                // Re-setup real-time tracking after form reset
                setTimeout(() => {
                    setupRealTimeTracking();
                }, 100);
                
                // Add success animation
                const updateCard = document.querySelector('.update-card');
                if (updateCard) {
                    updateCard.classList.add('success-animation');
                    setTimeout(() => {
                        updateCard.classList.remove('success-animation');
                    }, 600);
                }
                
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            showNotification('Failed to update profile. Please try again.', 'error');
        } finally {
            setLoadingState(false);
        }
    });
}

// Loading state management with enhanced UX
function setLoadingState(isLoading) {
    if (submitBtn && btnText && loadingSpinner) {
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
    
    .success-animation {
        animation: successPulse 0.6s ease;
    }
    
    @keyframes successPulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.02); }
        100% { transform: scale(1); }
    }
`;
document.head.appendChild(style);