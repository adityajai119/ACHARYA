// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js`;

// DOM elements
const backButton = document.getElementById('back');
const analyzerForm = document.getElementById('analyzerForm');
const fileInput = document.getElementById('resumeFile');
const fileLabel = document.querySelector('.file-upload-label');
const fileNameSpan = document.getElementById('fileName');
const analysisContainer = document.getElementById('analysisContainer');
const analysisResultDiv = document.getElementById('analysisResult');
const loader = document.getElementById('loader');
const submitBtn = document.querySelector('.submit-btn');
const btnText = document.querySelector('.btn-text');
const loadingSpinner = document.querySelector('.loading-spinner');

// Error handling for back button
if (backButton) {
    backButton.addEventListener('click', () => {
        try {
            window.location.href = 'candidate_dashboard.html';
        } catch (error) {
            console.error('Navigation error:', error);
            // Fallback navigation
            window.location.replace('candidate_dashboard.html');
        }
    });
} else {
    console.error('Back button not found');
}

// File upload handling with modern UI
if (fileInput) {
    fileInput.addEventListener('change', function() {
        const file = fileInput.files[0];
        if (file) {
            fileNameSpan.textContent = file.name;
            fileNameSpan.classList.add('show');
            
            // Add visual feedback
            fileLabel.style.borderColor = '#22c55e';
            fileLabel.style.background = 'rgba(34, 197, 94, 0.1)';
            
            // Reset after animation
            setTimeout(() => {
                fileLabel.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                fileLabel.style.background = 'rgba(255, 255, 255, 0.1)';
            }, 2000);
        } else {
            fileNameSpan.textContent = '';
            fileNameSpan.classList.remove('show');
        }
    });
}

if (fileLabel) {
    fileLabel.addEventListener('keydown', function(e) {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fileInput.click();
        }
    });

    fileLabel.addEventListener('click', function() {
        fileInput.click();
    });
}

// Form submission with enhanced UX
if (analyzerForm) {
    analyzerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get form data
        const jobRole = document.getElementById('jobRole').value.trim();
        const jobDescription = document.getElementById('jobDescription').value.trim();
        const resumeFile = fileInput.files[0];

        if (!resumeFile) {
            showNotification('Please upload a resume file.', 'error');
            return;
        }

        if (!jobRole || !jobDescription) {
            showNotification('Please fill in all required fields.', 'error');
            return;
        }

        // Show loading state
        setLoadingState(true);
        analysisContainer.style.display = 'block';
        analysisResultDiv.innerHTML = '';
        loader.style.display = 'flex';

        // Scroll to results
        analysisContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });

        try {
            // Get authentication token
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication required. Please log in again.');
            }

            // Create FormData for file upload
            const formData = new FormData();
            formData.append('jobRole', jobRole);
            formData.append('jobDescription', jobDescription);
            formData.append('resume', resumeFile);

            // Call backend API
            const response = await fetch('http://localhost:8000/api/candidate/analyze-resume', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.success) {
                displayAnalysis(data.analysis);
                showNotification('Analysis completed successfully!', 'success');
            } else {
                throw new Error('Analysis failed. Please try again.');
            }

        } catch (error) {
            console.error('Analysis failed:', error);
            analysisResultDiv.innerHTML = `
                <div class="error-message">
                    <h3>❌ Analysis Failed</h3>
                    <p>An error occurred during analysis. Please try again.</p>
                    <p class="error-details">${escapeHTML(error.message)}</p>
                </div>
            `;
            showNotification('Analysis failed. Please try again.', 'error');
        } finally {
            setLoadingState(false);
            loader.style.display = 'none';
        }
    });
}

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

// Add CSS for notification animation
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
    
    .error-message {
        text-align: center;
        padding: 20px;
    }
    
    .error-message h3 {
        color: #ef4444;
        margin-bottom: 10px;
    }
    
    .error-details {
        font-size: 0.9rem;
        color: rgba(255, 255, 255, 0.7);
        margin-top: 10px;
    }
`;
document.head.appendChild(style);





/**
 * Renders the analysis data into the HTML with new styling classes.
 * @param {object} data The parsed JSON data from the backend.
 */
function displayAnalysis(data) {
    const suitabilityScore = data.suitabilityScore ?? 0;
    const matchColor = suitabilityScore >= 80 ? '#22c55e' : 
                      suitabilityScore >= 60 ? '#f59e0b' : '#ef4444';
    
    analysisResultDiv.innerHTML = `
        <h2>🎯 Analysis Complete</h2>
        
        <div class="match-score" style="text-align: center; margin: 20px 0;">
            <div class="score-circle" style="
                width: 120px; 
                height: 120px; 
                border-radius: 50%; 
                background: linear-gradient(135deg, ${matchColor}, ${matchColor}80);
                display: flex; 
                align-items: center; 
                justify-content: center; 
                margin: 0 auto 15px;
                font-size: 2rem;
                font-weight: bold;
                color: white;
                box-shadow: 0 10px 30px ${matchColor}40;
            ">
                ${escapeHTML(suitabilityScore)}%
            </div>
            <p style="color: ${matchColor}; font-weight: 600; margin: 0;">Suitability Score</p>
        </div>

        <h3 class="summary">📊 Capability Analysis</h3>
        <p>${escapeHTML(data.capabilityAnalysis ?? 'No analysis provided.')}</p>

        <h3 class="strengths">✅ Key Strengths</h3>
        <ul>${(data.strengths ?? []).map(item => `<li>${escapeHTML(item)}</li>`).join('')}</ul>

        <h3 class="weaknesses">⚠️ Areas for Improvement</h3>
        <ul>${(data.weaknesses ?? []).map(item => `<li>${escapeHTML(item)}</li>`).join('')}</ul>

        <h3 class="missing-skills">❌ Missing Skills</h3>
        <ul>${(data.missingSkills ?? []).map(item => `<li>${escapeHTML(item)}</li>`).join('')}</ul>

        <h3 class="recommendations">💡 Recommendations</h3>
        <ul>${(data.recommendations ?? []).map(item => `<li>${escapeHTML(item)}</li>`).join('')}</ul>

        <h3 class="resume-text">📄 Resume Text Preview</h3>
        <div style="
            background: rgba(0, 0, 0, 0.3); 
            padding: 15px; 
            border-radius: 10px; 
            border-left: 4px solid #667eea;
            font-family: 'Fira Code', 'Courier New', monospace;
            font-size: 0.9rem;
            max-height: 200px;
            overflow-y: auto;
            color: #e0e0e0;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        ">
            ${escapeHTML(data.resumeText ?? 'No resume text available.')}
        </div>
    `;
}