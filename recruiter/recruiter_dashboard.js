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

// Check if Chart.js is available (graceful check)
function isChartAvailable() {
    return typeof Chart !== 'undefined';
}

// Base URL for API requests
const API_BASE_URL = 'http://localhost:8000';

// Retrieve the token from localStorage
const token = localStorage.getItem('token');

// Debug: Log the token to inspect its value
console.log('Token retrieved from localStorage:', token);

// Initialize authentication
function initializeAuth() {
    console.log('Initializing authentication...');
    console.log('Token from localStorage:', token ? 'Present' : 'Missing');
    
    // Check if the token exists and is a non-empty string
    if (!token || typeof token !== 'string' || token.trim() === '') {
        console.warn('No valid token found in localStorage.');
        alert('Please log in to access the dashboard.');
        localStorage.removeItem('token');
        console.log('Redirecting to login page...');
        window.location.href = '../index.html';
        return false;
    }
    
    console.log('Token validation passed');
    return true;
}

let username = '';
let suitabilityChartInstance = null;
let testScoreChartInstance = null;

// Utility function to show a loading state on a button
function showLoading(button, originalText) {
    button.disabled = true;
    button.innerHTML = `${originalText} <span class="spinner"></span>`;
}

// Utility function to hide the loading state on a button
function hideLoading(button, originalText) {
    button.disabled = false;
    button.innerHTML = originalText;
}

// Global logout function that can be called directly
function logoutUser() {
    console.log('Global logout function called');
    
    try {
        // Clear all stored data
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        
        // Show logout message
        alert('Logging out successfully. Redirecting to login page...');
        
        // Redirect to login page
        window.location.href = '../index.html';
    } catch (error) {
        console.error('Error during logout:', error);
        alert('Error during logout. Please try again.');
        
        // Force redirect even if there's an error
        try {
            window.location.replace('../index.html');
        } catch (redirectError) {
            console.error('Error redirecting:', redirectError);
            // Last resort - try to navigate
            window.location = '../index.html';
        }
    }
}

// Add logout functionality
function setupLogout() {
    console.log('Setting up logout functionality...');
    const logoutButton = document.getElementById('logout');
    
    if (logoutButton) {
        console.log('Logout button found, adding event listener...');
        
        logoutButton.addEventListener('click', logoutUser);
        
        console.log('Logout event listener added successfully');
    } else {
        console.error('Logout button not found in the DOM');
        
        // Try to find the button with a different approach
        setTimeout(() => {
            const retryLogoutButton = document.getElementById('logout');
            if (retryLogoutButton) {
                console.log('Found logout button on retry, setting up...');
                setupLogout();
            } else {
                console.error('Logout button still not found after retry');
                alert('Logout functionality unavailable. Please refresh the page.');
            }
        }, 1000);
    }
}

// Initialize the dashboard
async function initializeDashboard() {
    try {
        // Initialize authentication first
        if (!initializeAuth()) {
            return;
        }
        
        // Decode the JWT token with fallback
        let decoded;
        try {
            // Try to use the external library first
            if (typeof jwtDecode !== 'undefined') {
                decoded = jwtDecode(token);
            } else {
                // Use fallback decoder
                console.log('Using fallback JWT decoder');
                decoded = decodeJWT(token);
            }
        } catch (decodeError) {
            console.error('Error decoding token:', decodeError);
            alert('Invalid authentication token. Please log in again.');
            localStorage.removeItem('token');
            window.location.href = '../index.html';
            return;
        }
        
        console.log('Decoded token:', decoded);

        // Extract username and role
        username = decoded.username;
        const role = decoded.role;

        // Verify the user is a recruiter
        if (role !== 'Recruiter') {
            console.warn('User role is not Recruiter:', role);
            alert('Unauthorized access. Recruiters only.');
            localStorage.removeItem('token');
            window.location.href = '../index.html';
            return;
        }

        // Check if the token is expired
        const currentTime = Math.floor(Date.now() / 1000);
        if (decoded.exp && decoded.exp < currentTime) {
            console.warn('Token has expired:', decoded.exp);
            alert('Your session has expired. Please log in again.');
            localStorage.removeItem('token');
            window.location.href = '../index.html';
            return;
        }

        // Display the username on the dashboard
        const usernameElement = document.getElementById('username');
        if (usernameElement) {
            usernameElement.textContent = username;
        } else {
            console.error('Username element not found in the DOM.');
            alert('Failed to load dashboard. Please try again.');
        }
    } catch (error) {
        console.error('Error initializing dashboard:', error.message, error.stack);
        alert('Invalid token. Please log in again.');
        localStorage.removeItem('token');
        window.location.href = '../index.html';
    }
}



// Handle company test assignment form submission
function setupCompanyTestAssignment() {
    const companyTestForm = document.getElementById('companyTestForm');
    const assignButton = companyTestForm?.querySelector('button[type="submit"]');
    const originalButtonText = assignButton?.textContent || 'Assign Company Test';

    if (!companyTestForm || !assignButton) {
        console.error('Company test form or submit button not found in the DOM.');
        return;
    }

    companyTestForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Show loading state
        showLoading(assignButton, originalButtonText);

        try {
            const candidate = document.getElementById('companyCandidate').value;
            const companyName = document.getElementById('companyName').value;
            const testType = document.getElementById('companyTestType').value;
            const duration = parseInt(document.getElementById('companyDuration').value);
            const questionsInput = document.getElementById('companyQuestions').value;

            if (!candidate || !companyName || !testType || !duration || !questionsInput) {
                alert('Please fill in all fields.');
                hideLoading(assignButton, originalButtonText);
                return;
            }

            if (isNaN(duration) || duration <= 0) {
                alert('Duration must be a positive number.');
                hideLoading(assignButton, originalButtonText);
                return;
            }

            let questions;
            try {
                questions = JSON.parse(questionsInput);
                if (!Array.isArray(questions) || questions.length === 0) {
                    throw new Error('Questions must be a non-empty array.');
                }
                for (const q of questions) {
                    if (!q.question || !q.correctAnswer) {
                        throw new Error('Each question must have a "question" and "correctAnswer" field.');
                    }
                }
            } catch (parseError) {
                console.error('Invalid questions JSON:', parseError.message);
                alert('Invalid questions format. Please provide a valid JSON array with "question" and "correctAnswer" fields.');
                hideLoading(assignButton, originalButtonText);
                return;
            }

            const data = {
                candidate,
                companyName,
                testType,
                duration,
                questions,
            };

            const response = await fetch(`${API_BASE_URL}/api/recruiter/assign-company-test`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();
            hideLoading(assignButton, originalButtonText);

            if (result.success) {
                alert('Company test assigned successfully!');
                companyTestForm.reset();
            } else {
                console.error('Company test assignment failed:', result.message);
                alert(`Failed to assign company test: ${result.message}`);
            }
        } catch (error) {
            console.error('Error assigning company test:', error.message, error.stack);
            alert('An error occurred while assigning the company test. Please try again.');
            hideLoading(assignButton, originalButtonText);
        }
    });
}

// Handle fetching and displaying company test results
function setupCompanyTestResults() {
    const fetchCompanyResultsButton = document.getElementById('fetchCompanyResults');
    const originalButtonText = fetchCompanyResultsButton?.textContent || 'Fetch Company Results';

    if (!fetchCompanyResultsButton) {
        console.error('Fetch company results button not found in the DOM.');
        return;
    }

    fetchCompanyResultsButton.addEventListener('click', async () => {
        // Show loading state
        showLoading(fetchCompanyResultsButton, originalButtonText);

        try {
            const candidate = document.getElementById('companyResultsCandidate').value;

            if (!candidate) {
                alert('Please enter a candidate username.');
                hideLoading(fetchCompanyResultsButton, originalButtonText);
                return;
            }

            const response = await fetch(`${API_BASE_URL}/api/recruiter/company-test-results/${candidate}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const result = await response.json();
            hideLoading(fetchCompanyResultsButton, originalButtonText);

            if (result.success) {
                displayCompanyTestResults(result.tests);
            } else {
                console.error('Failed to fetch company test results:', result.message);
                alert(`Failed to fetch company test results: ${result.message}`);
            }
        } catch (error) {
            console.error('Error fetching company test results:', error.message, error.stack);
            alert('An error occurred while fetching company test results. Please try again.');
            hideLoading(fetchCompanyResultsButton, originalButtonText);
        }
    });
}

// Display company test results
function displayCompanyTestResults(tests) {
    const resultsContainer = document.getElementById('companyTestResults');
    const chartCanvas = document.getElementById('companyTestScoreChart');
    const detailsContainer = document.getElementById('companyTestDetails');

    if (!resultsContainer || !chartCanvas || !detailsContainer) {
        console.error('Company test results containers not found in the DOM.');
        return;
    }

    if (!tests || tests.length === 0) {
        resultsContainer.style.display = 'block';
        detailsContainer.innerHTML = '<p>No company test results found for this candidate.</p>';
        return;
    }

    // Display results
    resultsContainer.style.display = 'block';

    // Create chart if Chart.js is available
    if (isChartAvailable()) {
        const scores = tests.map(test => test.score || 0);
        const labels = tests.map(test => `${test.companyName} - ${test.testType}`);

        // Destroy previous chart instance if it exists
        if (window.companyTestScoreChartInstance) {
            window.companyTestScoreChartInstance.destroy();
        }

        const ctx = chartCanvas.getContext('2d');
        window.companyTestScoreChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Test Score',
                    data: scores,
                    backgroundColor: 'rgba(102, 126, 234, 0.2)',
                    borderColor: 'rgba(102, 126, 234, 1)',
                    borderWidth: 1,
                }],
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Score (%)',
                        },
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Company Tests',
                        },
                    },
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Company Test Performance',
                        color: '#ffffff',
                    },
                    legend: {
                        labels: {
                            color: '#ffffff',
                        },
                    },
                },
            },
        });
    }

    // Display detailed results
    let detailsHTML = '<h3>Company Test Results</h3>';
    tests.forEach((test, index) => {
        const score = test.score || 0;
        const scoreClass = score >= 80 ? 'excellent' : score >= 60 ? 'good' : score >= 40 ? 'needs-improvement' : 'poor';
        
        detailsHTML += `
            <div class="test-result" style="margin-bottom: 20px; padding: 15px; background: rgba(255, 255, 255, 0.1); border-radius: 10px;">
                <h4>${escapeHTML(test.companyName)} - ${escapeHTML(test.testType)}</h4>
                <p><strong>Score:</strong> <span class="score-${scoreClass}">${escapeHTML(score)}%</span></p>
                <p><strong>Duration:</strong> ${escapeHTML(test.duration)} minutes</p>
                <p><strong>Status:</strong> ${escapeHTML(test.status)}</p>
                <p><strong>Submitted:</strong> ${new Date(test.submittedAt).toLocaleString()}</p>
                ${test.evaluation ? `<p><strong>Evaluation:</strong> ${escapeHTML(test.evaluation)}</p>` : ''}
            </div>
        `;
    });

    detailsContainer.innerHTML = detailsHTML;
}

// Initialize the dashboard and setup event listeners
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded, initializing recruiter dashboard...');
    
    try {
        // Initialize dashboard first
        await initializeDashboard();
        console.log('Dashboard initialized successfully');
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        // Even if dashboard init fails, still set up logout
    }
    
    // Always set up logout functionality
    setupLogout();
    
    // Set up other functionality
    setupCompanyTestAssignment();
    setupCompanyTestResults();
    
    console.log('All event listeners set up successfully');
});
