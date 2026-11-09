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

    // Load assigned company tests
    loadAssignedCompanyTests();
});

// Load assigned company tests from the server
async function loadAssignedCompanyTests() {
    const loadingIndicator = document.getElementById('loadingAssignedTests');
    const testsList = document.getElementById('assignedTestsList');
    
    if (!loadingIndicator || !testsList) {
        console.error('Assigned tests containers not found');
        return;
    }

    try {
        const response = await fetch('http://localhost:8000/api/candidate/company-tests', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            displayAssignedTests(data.tests || []);
        } else {
            console.error('Failed to load assigned tests');
            testsList.innerHTML = '<p style="color: rgba(255, 255, 255, 0.7);">Failed to load assigned tests.</p>';
        }
    } catch (error) {
        console.error('Error loading assigned tests:', error);
        testsList.innerHTML = '<p style="color: rgba(255, 255, 255, 0.7);">Error loading assigned tests.</p>';
    } finally {
        loadingIndicator.style.display = 'none';
    }
}

// Display assigned company tests
function displayAssignedTests(tests) {
    const testsList = document.getElementById('assignedTestsList');
    
    if (!testsList) {
        console.error('Assigned tests list container not found');
        return;
    }

    if (!tests || tests.length === 0) {
        testsList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: rgba(255, 255, 255, 0.7);">
                <h3>📭 No Assigned Tests</h3>
                <p>You don't have any company tests assigned to you at the moment.</p>
                <p>Recruiters can assign tests through their dashboard.</p>
            </div>
        `;
        return;
    }

    let testsHTML = '';
    tests.forEach((test, index) => {
        testsHTML += `
            <div class="assigned-test-item" style="background: rgba(255, 255, 255, 0.1); border-radius: 15px; padding: 20px; margin-bottom: 15px; border: 1px solid rgba(255, 255, 255, 0.2);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h3 style="margin: 0; color: #ffffff;">🏢 ${escapeHTML(test.companyName)}</h3>
                    <span style="background: rgba(102, 126, 234, 0.3); padding: 5px 12px; border-radius: 20px; font-size: 0.9rem; color: #667eea;">
                        ${escapeHTML(test.testType)}
                    </span>
                </div>
                <div style="margin-bottom: 15px;">
                    <p style="margin: 5px 0; color: rgba(255, 255, 255, 0.8);">
                        <strong>Duration:</strong> ${escapeHTML(test.duration)} minutes
                    </p>
                    <p style="margin: 5px 0; color: rgba(255, 255, 255, 0.8);">
                        <strong>Questions:</strong> ${test.questions.length} questions
                    </p>
                    <p style="margin: 5px 0; color: rgba(255, 255, 255, 0.8);">
                        <strong>Assigned by:</strong> ${escapeHTML(test.assignedBy)}
                    </p>
                </div>
                <button onclick="startCompanyTest(${jsArg(test._id)}, ${jsArg(test.companyName)}, ${jsArg(test.testType)})" 
                        style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 12px 24px; border-radius: 10px; cursor: pointer; font-weight: 600; transition: all 0.3s ease;">
                    🚀 Start Test
                </button>
            </div>
        `;
    });

    testsList.innerHTML = testsHTML;
}

// Start a company test
function startCompanyTest(testId, companyName, testType) {
    // Store test info for the test interface
    localStorage.setItem('currentCompanyTest', JSON.stringify({
        testId: testId,
        companyName: companyName,
        testType: testType
    }));
    
    // Navigate to test interface (you can create a separate test page or use a modal)
    showCompanyTestInterface(testId, companyName, testType);
}

// Show company test interface (modal or new page)
function showCompanyTestInterface(testId, companyName, testType) {
    // Create a modal for the test
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;
    
    modal.innerHTML = `
        <div style="background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(20px); border-radius: 20px; padding: 30px; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto; border: 1px solid rgba(255, 255, 255, 0.2);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="color: #ffffff; margin: 0;">🏢 ${escapeHTML(companyName)} - ${escapeHTML(testType)}</h2>
                <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                        style="background: rgba(239, 68, 68, 0.8); color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer;">
                    ✕
                </button>
            </div>
            <div id="testQuestionsContainer">
                <p style="color: rgba(255, 255, 255, 0.8);">Loading test questions...</p>
            </div>
            <div style="margin-top: 20px; text-align: center;">
                <button onclick="submitCompanyTest(${jsArg(testId)})" 
                        style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; border: none; padding: 12px 24px; border-radius: 10px; cursor: pointer; font-weight: 600;">
                    📤 Submit Test
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Load test questions
    loadTestQuestions(testId, modal);
}

// Load test questions
async function loadTestQuestions(testId, modal) {
    try {
        console.log('Loading test questions for testId:', testId);
        const response = await fetch(`http://localhost:8000/api/candidate/company-tests/${testId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);

        if (response.ok) {
            const data = await response.json();
            console.log('Test data received:', data);
            displayTestQuestions(data.test, modal);
        } else {
            const errorText = await response.text();
            console.error('Failed to load test questions. Status:', response.status, 'Error:', errorText);
            
            // Show error in modal
            const container = modal.querySelector('#testQuestionsContainer');
            container.innerHTML = `
                <div style="color: #ef4444; text-align: center; padding: 20px;">
                    <h3>❌ Error Loading Test</h3>
                    <p>Failed to load test questions. Please try again.</p>
                    <p>Status: ${response.status}</p>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                            style="background: rgba(239, 68, 68, 0.8); color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; margin-top: 10px;">
                        Close
                    </button>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading test questions:', error);
        
        // Show error in modal
        const container = modal.querySelector('#testQuestionsContainer');
        container.innerHTML = `
            <div style="color: #ef4444; text-align: center; padding: 20px;">
                <h3>❌ Network Error</h3>
                <p>Failed to connect to server. Please check your connection and try again.</p>
                <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                        style="background: rgba(239, 68, 68, 0.8); color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; margin-top: 10px;">
                    Close
                </button>
            </div>
        `;
    }
}

// Display test questions
function displayTestQuestions(test, modal) {
    const container = modal.querySelector('#testQuestionsContainer');
    
    let questionsHTML = '';
    test.questions.forEach((question, index) => {
        questionsHTML += `
            <div style="margin-bottom: 20px; padding: 15px; background: rgba(255, 255, 255, 0.1); border-radius: 10px;">
                <h4 style="color: #ffffff; margin-bottom: 10px;">Question ${index + 1}</h4>
                <p style="color: rgba(255, 255, 255, 0.9); margin-bottom: 15px;">${escapeHTML(question.question)}</p>
                <textarea 
                    id="answer_${index}" 
                    placeholder="Enter your answer here..."
                    style="width: 100%; padding: 12px; border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 8px; background: rgba(255, 255, 255, 0.1); color: #ffffff; font-family: 'Inter', sans-serif; resize: vertical; min-height: 80px;"
                ></textarea>
            </div>
        `;
    });
    
    container.innerHTML = questionsHTML;
}

// Submit company test
async function submitCompanyTest(testId) {
    const answers = [];
    const answerElements = document.querySelectorAll('[id^="answer_"]');
    
    answerElements.forEach((element, index) => {
        answers.push({
            questionIndex: index,
            answer: element.value.trim()
        });
    });

    try {
        const response = await fetch(`http://localhost:8000/api/candidate/submit-company-test/${testId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                answers: answers
            })
        });

        if (response.ok) {
            const result = await response.json();
            showNotification('Test submitted successfully!', 'success');
            // Close modal and refresh assigned tests
            document.querySelector('[style*="position: fixed"]').remove();
            loadAssignedCompanyTests();
        } else {
            showNotification('Failed to submit test. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Error submitting test:', error);
        showNotification('Error submitting test. Please try again.', 'error');
    }
}

const companyTestForm = document.getElementById('companyTestForm');
const companyNameInput = document.getElementById('companyName');
const testScoreInput = document.getElementById('testScore');
const testTypeInput = document.getElementById('testType');
const testResult = document.getElementById('testResult');
const resultText = document.getElementById('resultText');
const submitBtn = document.querySelector('.submit-btn');
const btnText = document.querySelector('.btn-text');
const loadingSpinner = document.querySelector('.loading-spinner');

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

// Enhanced form validation
function validateCompanyTest(companyName, testScore, testType) {
    const errors = [];
    
    if (!companyName || companyName.trim().length < 2) {
        errors.push('Please enter a valid company name (minimum 2 characters).');
    }
    
    if (!testScore || testScore < 0 || testScore > 100) {
        errors.push('Please enter a valid test score between 0 and 100.');
    }
    
    if (!testType || testType.trim().length < 5) {
        errors.push('Please enter a valid test type (minimum 5 characters).');
    }
    
    return errors;
}

// Enhanced form submission
companyTestForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const companyName = companyNameInput.value.trim();
    const testScore = parseInt(testScoreInput.value);
    const testType = testTypeInput.value.trim();
    
    // Validate form data
    const validationErrors = validateCompanyTest(companyName, testScore, testType);
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
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Generate comprehensive result analysis
        const resultAnalysis = generateTestResultAnalysis(companyName, testScore, testType);
        
        // Display result with enhanced styling
        displayTestResult(resultAnalysis);
        
        // Success animation and notification
        testResult.classList.add('success-animation');
        showNotification('Company test result submitted successfully! Review your analysis below.', 'success');
        
        // Reset form
        companyTestForm.reset();
        
    } catch (error) {
        console.error('Error submitting company test:', error);
        showNotification('Failed to submit company test. Please try again.', 'error');
    } finally {
        setLoadingState(false);
    }
});

// Generate comprehensive test result analysis
function generateTestResultAnalysis(companyName, testScore, testType) {
    let analysis = `📊 COMPANY TEST RESULT ANALYSIS\n\n`;
    
    // Company and test information
    analysis += `🏢 COMPANY: ${companyName.toUpperCase()}\n`;
    analysis += `📝 TEST TYPE: ${testType}\n`;
    analysis += `📊 SCORE: ${testScore}/100\n\n`;
    
    // Score analysis
    analysis += `📈 SCORE ANALYSIS:\n`;
    
    let scoreClass, scoreMessage, resultClass;
    
    if (testScore >= 90) {
        scoreClass = 'score-excellent';
        scoreMessage = '🎉 EXCELLENT PERFORMANCE!';
        resultClass = 'result-excellent';
        analysis += `✅ Outstanding! Your score of ${testScore} demonstrates exceptional proficiency.\n`;
        analysis += `🏆 This performance is in the top tier of candidates.\n`;
    } else if (testScore >= 80) {
        scoreClass = 'score-good';
        scoreMessage = '👍 VERY GOOD PERFORMANCE!';
        resultClass = 'result-good';
        analysis += `✅ Very good! Your score of ${testScore} shows strong capabilities.\n`;
        analysis += `📈 You're well above the average performance level.\n`;
    } else if (testScore >= 70) {
        scoreClass = 'score-good';
        scoreMessage = '👍 GOOD PERFORMANCE!';
        resultClass = 'result-good';
        analysis += `✅ Good! Your score of ${testScore} indicates solid performance.\n`;
        analysis += `📊 You're performing above average in this assessment.\n`;
    } else if (testScore >= 60) {
        scoreClass = 'score-needs-improvement';
        scoreMessage = '⚠️ NEEDS IMPROVEMENT';
        resultClass = 'result-needs-improvement';
        analysis += `⚠️ Your score of ${testScore} shows room for improvement.\n`;
        analysis += `📚 Focus on strengthening your skills in this area.\n`;
    } else {
        scoreClass = 'score-poor';
        scoreMessage = '❌ NEEDS SIGNIFICANT IMPROVEMENT';
        resultClass = 'result-poor';
        analysis += `❌ Your score of ${testScore} indicates significant improvement needed.\n`;
        analysis += `🔄 Consider additional preparation and practice.\n`;
    }
    
    analysis += `\n${scoreMessage}\n\n`;
    
    // Performance insights
    analysis += `💡 PERFORMANCE INSIGHTS:\n`;
    
    if (testScore >= 80) {
        analysis += `• You demonstrate strong technical/professional skills\n`;
        analysis += `• Your approach to problem-solving is effective\n`;
        analysis += `• You're well-prepared for similar assessments\n`;
        analysis += `• Consider applying to similar roles at ${companyName}\n`;
    } else if (testScore >= 60) {
        analysis += `• You have a solid foundation in this area\n`;
        analysis += `• Focus on specific weak points for improvement\n`;
        analysis += `• Practice similar test formats regularly\n`;
        analysis += `• Consider additional training or certification\n`;
    } else {
        analysis += `• Identify specific areas that need improvement\n`;
        analysis += `• Seek additional resources and training\n`;
        analysis += `• Practice with similar test formats\n`;
        analysis += `• Consider mentorship or coaching\n`;
    }
    
    // Recommendations
    analysis += `\n🎯 RECOMMENDATIONS:\n`;
    
    if (testScore >= 80) {
        analysis += `• Apply to similar positions at ${companyName}\n`;
        analysis += `• Network with professionals in this field\n`;
        analysis += `• Continue building on your strengths\n`;
        analysis += `• Consider advanced certifications\n`;
    } else if (testScore >= 60) {
        analysis += `• Review the test content and identify weak areas\n`;
        analysis += `• Practice similar assessments regularly\n`;
        analysis += `• Seek feedback from mentors or peers\n`;
        analysis += `• Consider additional training programs\n`;
    } else {
        analysis += `• Take time to thoroughly review the test content\n`;
        analysis += `• Enroll in relevant training courses\n`;
        analysis += `• Practice with similar test formats\n`;
        analysis += `• Seek guidance from experienced professionals\n`;
    }
    
    // Next steps
    analysis += `\n📋 NEXT STEPS:\n`;
    analysis += `• Track your progress over time\n`;
    analysis += `• Set specific improvement goals\n`;
    analysis += `• Practice regularly with similar assessments\n`;
    analysis += `• Consider retaking the test after preparation\n`;
    
    return {
        analysis: analysis,
        scoreClass: scoreClass,
        resultClass: resultClass,
        score: testScore
    };
}

// Display test result with enhanced styling
function displayTestResult(resultData) {
    resultText.textContent = resultData.analysis;
    resultText.className = `result-content ${resultData.resultClass}`;
    
    // Show result section with animation
    testResult.style.display = 'block';
    testResult.style.animation = 'fadeInUp 0.6s ease-out';
    
    // Scroll to result
    testResult.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
`;
document.head.appendChild(style);

// Initialize page with enhanced functionality
document.addEventListener('DOMContentLoaded', () => {
    console.log('Company-Based Tests page loaded');
    
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
    
    // Welcome notification
    showNotification('Welcome to Company-Based Tests! Submit your test results to track your performance.', 'info');
}); 