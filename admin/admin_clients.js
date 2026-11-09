// Admin Clients Management
document.addEventListener('DOMContentLoaded', function() {
    initializeClientsPage();
});

function initializeClientsPage() {
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

    // Initialize add client form
    const addClientForm = document.getElementById('addClientForm');
    if (addClientForm) {
        addClientForm.addEventListener('submit', handleAddClient);
    }

    // Load initial clients
    fetchClients();
}

const token = localStorage.getItem('token');

const showLoading = () => {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const clientListUl = document.getElementById('clientListUl');
    
    if (loadingIndicator) loadingIndicator.style.display = 'flex';
    if (clientListUl) clientListUl.style.display = 'none';
};

const hideLoading = () => {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const clientListUl = document.getElementById('clientListUl');
    
    if (loadingIndicator) loadingIndicator.style.display = 'none';
    if (clientListUl) clientListUl.style.display = 'block';
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

const updateClientList = (clients) => {
    const list = document.getElementById('clientListUl');
    const totalClients = document.getElementById('totalClients');
    const activeClients = document.getElementById('activeClients');
    
    if (!list) return;
    
    // Update stats
    if (totalClients) totalClients.textContent = clients.length;
    if (activeClients) activeClients.textContent = clients.length; // Assuming all clients are active
    
    if (clients.length === 0) {
        list.innerHTML = `
            <li class="no-clients">
                <div style="text-align: center; padding: 40px; color: rgba(255, 255, 255, 0.7);">
                    <h3>📭 No Clients Available</h3>
                    <p>No clients are currently registered in the system.</p>
                </div>
            </li>
        `;
        return;
    }
    
    list.innerHTML = clients.map(client => {
        return `
            <li class="client-item" data-client-id="${escapeHTML(client._id)}">
                <div class="client-info">
                    <div class="client-details">
                        <div class="client-name">${escapeHTML(client.name)}</div>
                        <div class="client-contact">${escapeHTML(client.contact)}</div>
                    </div>
                    <div class="client-actions">
                        <button class="btn btn-primary btn-sm" onclick="editClient(${jsArg(client._id)})">✏️ Edit</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteClient(${jsArg(client._id)})">🗑️ Delete</button>
                    </div>
                </div>
            </li>
        `;
    }).join('');
};

const fetchClients = async () => {
    showLoading();
    
    try {
        const response = await fetch('http://localhost:8000/api/clients', {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });
        
        if (response.ok) {
            const clients = await response.json();
            updateClientList(clients);
            showNotification(`✅ Loaded ${clients.length} clients`, 'success');
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
        console.error('Error fetching clients:', error);
        showNotification('❌ Failed to load clients. Please try again.', 'error');
        updateClientList([]);
    } finally {
        hideLoading();
    }
};

const handleAddClient = async (e) => {
    e.preventDefault();
    const name = document.getElementById('clientName').value.trim();
    const contact = document.getElementById('clientContact').value.trim();
    
    if (!name || !contact) {
        showNotification('❌ Please fill in all fields', 'error');
        return;
    }
    
    showNotification('➕ Adding new client...', 'info');
    
    try {
        const response = await fetch('http://localhost:8000/api/clients', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ name, contact }),
        });
        
        if (response.ok) {
            showNotification('✅ Client added successfully', 'success');
            document.getElementById('addClientForm').reset();
            fetchClients();
        } else if (response.status === 409) {
            showNotification('❌ Client already exists', 'error');
        } else {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.error('Error adding client:', error);
        showNotification('❌ Failed to add client. Please try again.', 'error');
    }
};

// Global functions for edit and delete (called from HTML)
window.editClient = async (clientId) => {
    showNotification('✏️ Edit functionality coming soon...', 'info');
    // TODO: Implement edit functionality
};

window.deleteClient = async (clientId) => {
    if (!confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
        return;
    }
    
    showNotification('🗑️ Deleting client...', 'info');
    
    try {
        const response = await fetch(`http://localhost:8000/api/clients/${clientId}`, {
            method: 'DELETE',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });
        
        if (response.ok) {
            showNotification('✅ Client deleted successfully', 'success');
            fetchClients();
        } else {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.error('Error deleting client:', error);
        showNotification('❌ Failed to delete client. Please try again.', 'error');
    }
};