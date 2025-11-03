// Wishlist Application - Clean Version
// Dropbox Configuration - Replace with your own credentials
const DROPBOX_CONFIG = {
    CLIENT_ID: 'YOUR_CLIENT_ID',
    REDIRECT_URI: window.location.origin + window.location.pathname,
    FILE_PATH: '/wishlist.json'
};

let wishlistData = [];
let accessToken = null;
let isLoggedIn = false;
const SECRET_PIN = '1234'; // Change this to your actual PIN

// Initialize app on DOM load
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    loadThemePreference();
});

function initializeApp() {
    // Check if we have a stored access token
    accessToken = localStorage.getItem('dropbox_token');
    const loginStatus = localStorage.getItem('admin_logged_in');
    
    if (loginStatus === 'true') {
        isLoggedIn = true;
        updateUIForLoggedIn();
    }
    
    // Check URL for OAuth callback
    const urlParams = new URLSearchParams(window.location.hash.substring(1));
    const token = urlParams.get('access_token');
    
    if (token) {
        accessToken = token;
        localStorage.setItem('dropbox_token', token);
        // Clean URL
        window.location.hash = '';
        loadWishlistData();
    } else if (accessToken) {
        loadWishlistData();
    } else {
        displayNoItems();
    }
}

function setupEventListeners() {
    // Modal controls
    document.getElementById('loginBtn').addEventListener('click', () => openModal('loginModal'));
    document.getElementById('addBtn').addEventListener('click', () => openModal('addItemModal'));
    document.getElementById('sizesBtn').addEventListener('click', () => openModal('sizesModal'));
    
    document.getElementById('closeLogin').addEventListener('click', () => closeModal('loginModal'));
    document.getElementById('closeAddItem').addEventListener('click', () => closeModal('addItemModal'));
    document.getElementById('closeSizes').addEventListener('click', () => closeModal('sizesModal'));
    
    // Close modals on outside click
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
    
    // Login
    document.getElementById('submitLogin').addEventListener('click', handleLogin);
    document.getElementById('pin').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });
    
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    
    // Add item
    document.getElementById('submitItem').addEventListener('click', handleAddItem);
    
    // Image source toggle
    document.getElementById('imageSource').addEventListener('change', (e) => {
        const isUpload = e.target.value === 'upload';
        document.getElementById('imageUrlGroup').style.display = isUpload ? 'none' : 'block';
        document.getElementById('imageUploadGroup').style.display = isUpload ? 'block' : 'none';
    });
    
    // Image upload preview
    document.getElementById('imageUpload').addEventListener('change', handleImageUpload);
    
    // Search and filter
    document.getElementById('searchBar').addEventListener('input', filterItems);
    document.getElementById('filterSelect').addEventListener('change', filterItems);
    
    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
}

function openModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function handleLogin() {
    const pin = document.getElementById('pin').value;
    if (pin === SECRET_PIN) {
        isLoggedIn = true;
        localStorage.setItem('admin_logged_in', 'true');
        updateUIForLoggedIn();
        closeModal('loginModal');
        showStatus('Logged in successfully!', 'success');
        
        // Initiate Dropbox OAuth if not already authenticated
        if (!accessToken) {
            initiateDropboxAuth();
        }
    } else {
        showStatus('Invalid PIN!', 'error');
    }
}

function handleLogout() {
    isLoggedIn = false;
    localStorage.removeItem('admin_logged_in');
    updateUIForLoggedOut();
    showStatus('Logged out successfully!', 'success');
}

function updateUIForLoggedIn() {
    document.getElementById('loginBtn').style.display = 'none';
    document.getElementById('addBtn').style.display = 'block';
    document.getElementById('logoutBtn').style.display = 'block';
}

function updateUIForLoggedOut() {
    document.getElementById('loginBtn').style.display = 'block';
    document.getElementById('addBtn').style.display = 'none';
    document.getElementById('logoutBtn').style.display = 'none';
}

function initiateDropboxAuth() {
    const authUrl = `https://www.dropbox.com/oauth2/authorize?client_id=${DROPBOX_CONFIG.CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(DROPBOX_CONFIG.REDIRECT_URI)}`;
    window.location.href = authUrl;
}

async function loadWishlistData() {
    if (!accessToken) {
        displayNoItems();
        return;
    }
    
    try {
        const response = await fetch('https://api.dropboxapi.com/2/files/download', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Dropbox-API-Arg': JSON.stringify({ path: DROPBOX_CONFIG.FILE_PATH })
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load data');
        }
        
        wishlistData = await response.json();
        renderWishlist();
    } catch (error) {
        console.error('Error loading wishlist:', error);
        showStatus('Error loading: ' + error.message, 'error');
        displayNoItems();
    }
}

async function saveWishlistData() {
    if (!accessToken) return;
    
    try {
        const response = await fetch('https://content.dropboxapi.com/2/files/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Dropbox-API-Arg': JSON.stringify({
                    path: DROPBOX_CONFIG.FILE_PATH,
                    mode: 'overwrite',
                    autorename: false
                }),
                'Content-Type': 'application/octet-stream'
            },
            body: JSON.stringify(wishlistData, null, 2)
        });
        
        if (!response.ok) {
            throw new Error('Failed to save data');
        }
        
        showStatus('Item saved successfully!', 'success');
    } catch (error) {
        console.error('Error saving wishlist:', error);
        showStatus('Error saving: ' + error.message, 'error');
    }
}

async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        const preview = document.getElementById('imagePreview');
        preview.innerHTML = `<img src="${event.target.result}" alt="Preview">`;
    };
    reader.readAsDataURL(file);
}

async function handleAddItem() {
    const imageSource = document.getElementById('imageSource').value;
    let imageUrl = '';
    
    if (imageSource === 'url') {
        imageUrl = document.getElementById('imageUrl').value;
    } else {
        const fileInput = document.getElementById('imageUpload');
        if (fileInput.files[0]) {
            // For upload, we would need to upload to Dropbox first
            // This is a simplified version - you'd need to implement Dropbox file upload
            const reader = new FileReader();
            reader.onload = async (e) => {
                imageUrl = e.target.result; // Base64 for now
                await addItemToList(imageUrl);
            };
            reader.readAsDataURL(fileInput.files[0]);
            return;
        }
    }
    
    await addItemToList(imageUrl);
}

async function addItemToList(imageUrl) {
    const newItem = {
        id: Date.now().toString(),
        image: imageUrl,
        link: document.getElementById('itemLink').value,
        description: document.getElementById('itemDescription').value,
        price: parseFloat(document.getElementById('itemPrice').value) || 0,
        category: document.getElementById('itemCategory').value,
        dateAdded: new Date().toISOString()
    };
    
    wishlistData.push(newItem);
    await saveWishlistData();
    renderWishlist();
    closeModal('addItemModal');
    
    // Reset form
    document.getElementById('imageUrl').value = '';
    document.getElementById('itemLink').value = '';
    document.getElementById('itemDescription').value = '';
    document.getElementById('itemPrice').value = '';
    document.getElementById('imageUpload').value = '';
    document.getElementById('imagePreview').innerHTML = '<span>Preview will appear here</span>';
}

async function deleteItem(itemId) {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    wishlistData = wishlistData.filter(item => item.id !== itemId);
    await saveWishlistData();
    renderWishlist();
}

function renderWishlist() {
    const grid = document.getElementById('wishlistGrid');
    
    if (!wishlistData || wishlistData.length === 0) {
        displayNoItems();
        return;
    }
    
    grid.innerHTML = wishlistData.map(item => `
        <div class="wishlist-item" data-category="${item.category}">
            ${isLoggedIn ? `<button class="delete-btn" onclick="deleteItem('${item.id}')">×</button>` : ''}
            <div class="item-image">
                <img src="${item.image}" alt="${item.description}">
            </div>
            <div class="item-details">
                <div class="item-date">${new Date(item.dateAdded).toLocaleDateString()}</div>
                <div class="item-description">${item.description}</div>
                <div class="item-price">$${item.price.toFixed(2)}</div>
                <span class="category-badge cat-${item.category}">${item.category}</span>
                <a href="${item.link}" target="_blank" class="item-link">View Item</a>
            </div>
        </div>
    `).join('');
    
    filterItems(); // Apply any active filters
}

function displayNoItems() {
    const grid = document.getElementById('wishlistGrid');
    grid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; padding: 40px;">No matching items found.</p>';
}

function filterItems() {
    const searchTerm = document.getElementById('searchBar').value.toLowerCase();
    const filterCategory = document.getElementById('filterSelect').value;
    const items = document.querySelectorAll('.wishlist-item');
    
    let visibleCount = 0;
    items.forEach(item => {
        const description = item.querySelector('.item-description').textContent.toLowerCase();
        const category = item.dataset.category;
        
        const matchesSearch = description.includes(searchTerm);
        const matchesFilter = filterCategory === 'all' || category === filterCategory;
        
        if (matchesSearch && matchesFilter) {
            item.style.display = 'block';
            visibleCount++;
        } else {
            item.style.display = 'none';
        }
    });
    
    // Show "no items" message if nothing matches
    if (visibleCount === 0 && items.length > 0) {
        const grid = document.getElementById('wishlistGrid');
        if (!grid.querySelector('.no-results')) {
            const noResults = document.createElement('p');
            noResults.className = 'no-results';
            noResults.style.cssText = 'grid-column: 1 / -1; text-align: center; padding: 40px;';
            noResults.textContent = 'No matching items found.';
            grid.appendChild(noResults);
        }
    } else {
        const noResults = document.querySelector('.no-results');
        if (noResults) noResults.remove();
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

function loadThemePreference() {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
    }
}

function showStatus(message, type) {
    const statusDiv = document.getElementById('statusMessage');
    statusDiv.textContent = message;
    statusDiv.className = `status-message status-${type}`;
    statusDiv.style.display = 'block';
    
    setTimeout(() => {
        statusDiv.style.display = 'none';
    }, 3000);
}

// Make deleteItem available globally for inline onclick handlers
window.deleteItem = deleteItem;
