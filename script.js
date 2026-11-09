// Global JWT decoder fallback
window.decodeJWT = function(token) {
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
};

// Global JWT decode function that tries multiple methods
window.safeJWTDecode = function(token) {
    try {
        // Try to use the external library first
        if (typeof jwtDecode !== 'undefined') {
            return jwtDecode(token);
        } else if (typeof jwt_decode !== 'undefined') {
            // Fallback for older versions
            return jwt_decode(token);
        } else {
            // Fallback to manual decoder
            console.log('Using fallback JWT decoder');
            return window.decodeJWT(token);
        }
    } catch (error) {
        console.error('Error decoding JWT token:', error);
        throw error;
    }
};

// Configuration
const API_BASE_URL = 'http://localhost:8000'; // FastAPI default port

// Utility functions
function showAlert(message, type = 'error') {
    const alertContainer = document.getElementById('alert-container');
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    alertContainer.innerHTML = '';
    alertContainer.appendChild(alert);
    
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

function setLoading(button, isLoading) {
    const btnText = button.querySelector('.btn-text');
    if (isLoading) {
        button.disabled = true;
        btnText.innerHTML = '<span class="loading"></span>Processing...';
    } else {
        button.disabled = false;
        btnText.textContent = button.id === 'loginBtn' ? 'Login' : 'Register';
    }
}

function switchTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Update form containers
    document.querySelectorAll('.form-container').forEach(container => container.classList.remove('active'));
    document.getElementById(`${tab}-form`).classList.add('active');
    
    // Clear alerts
    document.getElementById('alert-container').innerHTML = '';
}

// Login form handler
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const loginBtn = document.getElementById('loginBtn');
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!username || !password) {
        showAlert('Please fill in all fields');
        return;
    }
    
    setLoading(loginBtn, true);
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('role', data.role);
            localStorage.setItem('username', username);
            
            showAlert('Login successful! Redirecting...', 'success');
            
            // Redirect based on role
            setTimeout(() => {
                const role = encodeURIComponent(data.role.toLowerCase());
                window.location.href = `${role}/${role}_dashboard.html`;
            }, 1500);
        } else {
            showAlert(data.detail || 'Login failed. Please check your credentials.');
        }
    } catch (error) {
        console.error('Login error:', error);
        showAlert('Connection error. Please check if the server is running.');
    } finally {
        setLoading(loginBtn, false);
    }
});

// Register form handler
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const registerBtn = document.getElementById('registerBtn');
    const username = document.getElementById('registerUsername').value.trim();
    const password = document.getElementById('registerPassword').value;
    const role = document.getElementById('registerRole').value;
    
    if (!username || !password || !role) {
        showAlert('Please fill in all fields');
        return;
    }
    
    if (password.length < 6) {
        showAlert('Password must be at least 6 characters long');
        return;
    }
    
    setLoading(registerBtn, true);
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password, role }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showAlert('Registration successful! Please login with your credentials.', 'success');
            
            // Clear form and switch to login
            document.getElementById('registerForm').reset();
            setTimeout(() => {
                switchTab('login');
                document.getElementById('loginUsername').value = username;
            }, 2000);
        } else {
            showAlert(data.detail || 'Registration failed. Please try again.');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showAlert('Connection error. Please check if the server is running.');
    } finally {
        setLoading(registerBtn, false);
    }
});

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (token && role) {
        // Verify token is still valid by making a test request
        fetch(`${API_BASE_URL}/api/jobs`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (response.ok) {
                // Token is valid, redirect to dashboard
                const page = encodeURIComponent(role.toLowerCase());
                window.location.href = `${page}/${page}_dashboard.html`;
            } else {
                // Token is invalid, clear storage silently
                localStorage.clear();
                console.log('Invalid token cleared');
            }
        })
        .catch((error) => {
            // Connection error or other issues, clear storage silently
            localStorage.clear();
            console.log('Token cleared due to connection error:', error.message);
        });
    }
});

// Make switchTab globally available
window.switchTab = switchTab;