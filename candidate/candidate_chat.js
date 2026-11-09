// DOM elements
const backButton = document.getElementById('back');
const chatForm = document.getElementById('chatForm');
const chatMessage = document.getElementById('chatMessage');
const chatMessagesUl = document.getElementById('chatMessagesUl');
const noMessages = document.querySelector('.no-messages');
const submitBtn = document.querySelector('.submit-btn');
const btnText = document.querySelector('.btn-text');
const loadingSpinner = document.querySelector('.loading-spinner');

// Get token and username
const token = localStorage.getItem('token');
let username = '';

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
});

// Enhanced form validation
function validateMessage(message) {
    if (!message || message.trim().length < 1) {
        showNotification('Please enter a message.', 'error');
        return false;
    }
    
    if (message.trim().length > 500) {
        showNotification('Message is too long. Please keep it under 500 characters.', 'error');
        return false;
    }
    
    return true;
}

// Update chat messages with modern styling
const updateChatMessages = (messages) => {
    if (!chatMessagesUl) return;
    
    if (messages.length === 0) {
        if (noMessages) noMessages.style.display = 'block';
        chatMessagesUl.innerHTML = '';
        return;
    }
    
    if (noMessages) noMessages.style.display = 'none';
    
    chatMessagesUl.innerHTML = messages.map(msg => {
        const isOwnMessage = msg.sender === username;
        const messageTime = new Date(msg.timestamp).toLocaleString();
        
        return `
            <li class="message-item ${isOwnMessage ? 'own-message' : ''}">
                <div class="message-header">
                    <span class="message-sender">${escapeHTML(msg.sender)}</span>
                    <span class="message-time">${messageTime}</span>
                </div>
                <div class="message-content">${escapeHTML(msg.message)}</div>
            </li>
        `;
    }).join('');
    
    // Auto-scroll to bottom
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
};

// Enhanced fetch messages with better error handling
const fetchMessages = async () => {
    try {
        console.log('Fetching chat messages...');
        
        const response = await fetch('http://localhost:8000/api/chat-messages', {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });
        
        console.log('Chat messages response status:', response.status);
        
        if (response.ok) {
            const messages = await response.json();
            console.log('Chat messages received:', messages);
            updateChatMessages(messages);
        } else {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.error('Error fetching chat messages:', error);
        
        // Show mock messages for demo purposes
        const mockMessages = [
            {
                sender: 'Alice',
                message: 'Hello everyone! How is the job search going?',
                timestamp: new Date(Date.now() - 300000).toISOString()
            },
            {
                sender: 'Bob',
                message: 'Hi Alice! It\'s going well. I just had an interview yesterday.',
                timestamp: new Date(Date.now() - 180000).toISOString()
            },
            {
                sender: 'Charlie',
                message: 'That\'s great Bob! What role were you interviewing for?',
                timestamp: new Date(Date.now() - 60000).toISOString()
            }
        ];
        
        updateChatMessages(mockMessages);
        showNotification('Using demo messages. Real chat will be available when connected to server.', 'info');
    }
};

// Enhanced send message functionality
const sendMessage = async (message) => {
    try {
        console.log('Sending message:', message);
        
        const response = await fetch('http://localhost:8000/api/chat-messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ 
                user: username, 
                message 
            }),
        });
        
        console.log('Send message response status:', response.status);
        
        if (response.ok) {
            const result = await response.json();
            console.log('Message sent successfully:', result);
            
            // Refresh messages
            await fetchMessages();
            
            // Show success message
            showNotification('Message sent successfully!', 'success');
            
        } else {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.error('Error sending message:', error);
        showNotification('Failed to send message. Please try again.', 'error');
    }
};

// Form submission with enhanced UX
if (chatForm) {
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const message = chatMessage.value.trim();
        
        // Enhanced validation
        if (!validateMessage(message)) {
            return;
        }
        
        // Show loading state
        setLoadingState(true);
        
        try {
            await sendMessage(message);
            
            // Reset form
            chatMessage.value = '';
            
            // Add success animation
            const chatCard = document.querySelector('.chat-card');
            if (chatCard) {
                chatCard.classList.add('success-animation');
                setTimeout(() => {
                    chatCard.classList.remove('success-animation');
                }, 600);
            }
            
        } catch (error) {
            console.error('Error in form submission:', error);
            showNotification('Failed to send message. Please try again.', 'error');
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
    
    /* Enhanced form input styling */
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
    console.log('Chat page loaded for user:', username);
    
    // Fetch initial messages
    fetchMessages();
    
    // Show welcome message
    showNotification('Welcome to the Chat Room! Connect with other candidates.', 'info');
    
    // Add input focus effects
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.style.transform = 'translateY(-2px)';
        });
        
        input.addEventListener('blur', () => {
            input.parentElement.style.transform = 'translateY(0)';
        });
    });
});