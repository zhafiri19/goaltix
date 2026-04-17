// GOALTIX Frontend JavaScript
class GoalTixApp {
    constructor() {
        this.apiBase = 'http://localhost:3001/api';
        this.currentUser = null;
        this.websocket = null;
        this.matches = [];
        this.init();
    }

    init() {
        this.loadUserFromStorage();
        this.initWebSocket();
        this.loadMatches();
        this.setupEventListeners();
    }

    // User Management
    loadUserFromStorage() {
        const userData = localStorage.getItem('goaltix_user');
        if (userData) {
            this.currentUser = JSON.parse(userData);
            this.updateNavigation();
        }
    }

    saveUserToStorage(user) {
        localStorage.setItem('goaltix_user', JSON.stringify(user));
        this.currentUser = user;
        this.updateNavigation();
    }

    logout() {
        localStorage.removeItem('goaltix_user');
        this.currentUser = null;
        this.updateNavigation();
        if (this.websocket) {
            this.websocket.close();
        }
        window.location.href = '/';
    }

    updateNavigation() {
        const navButtons = document.querySelector('.hidden.md\\:flex');
        if (this.currentUser) {
            navButtons.innerHTML = `
                <a href="#home" class="hover:text-blue-400 transition">Home</a>
                <a href="#matches" class="hover:text-blue-400 transition">Matches</a>
                <a href="#tickets" class="hover:text-blue-400 transition">My Tickets</a>
                <div class="flex items-center space-x-4">
                    <span class="text-gray-300">Welcome, ${this.currentUser.name}</span>
                    <button onclick="app.logout()" class="text-red-400 hover:text-red-300 transition">
                        <i class="fas fa-sign-out-alt"></i>
                    </button>
                </div>
            `;
        }
    }

    // WebSocket
    initWebSocket() {
        if (!this.currentUser) return;

        const token = this.currentUser.token;
        this.websocket = new WebSocket(`ws://localhost:3001/ws?token=${token}`);

        this.websocket.onopen = () => {
            console.log('WebSocket connected');
            this.showNotification('Connected to real-time updates', 'success');
        };

        this.websocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleWebSocketMessage(data);
        };

        this.websocket.onclose = () => {
            console.log('WebSocket disconnected');
            setTimeout(() => this.initWebSocket(), 5000);
        };

        this.websocket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }

    handleWebSocketMessage(data) {
        switch (data.type) {
            case 'ticket_update':
                this.updateTicketStock(data.data.ticketId, data.data.stock);
                break;
            case 'transaction_success':
                this.showNotification('Purchase successful! Check your email for confirmation.', 'success');
                break;
            case 'match_update':
                this.updateMatchInUI(data.data);
                break;
            default:
                console.log('Unknown WebSocket message:', data);
        }
    }

    // API Calls
    async apiCall(endpoint, options = {}) {
        const url = `${this.apiBase}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        if (this.currentUser && this.currentUser.token) {
            config.headers.Authorization = `Bearer ${this.currentUser.token}`;
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'API request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            this.showNotification(error.message || 'Network error occurred', 'error');
            throw error;
        }
    }

    // Authentication
    async login(email, password) {
        try {
            const response = await this.apiCall('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });

            this.saveUserToStorage(response.data);
            this.closeLoginModal();
            this.showNotification('Login successful!', 'success');
            this.initWebSocket();
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async register(name, email, password) {
        try {
            const response = await this.apiCall('/auth/register', {
                method: 'POST',
                body: JSON.stringify({ name, email, password })
            });

            this.saveUserToStorage(response.data);
            this.showNotification('Registration successful!', 'success');
            this.initWebSocket();
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Matches
    async loadMatches() {
        try {
            const response = await this.apiCall('/matches/upcoming');
            this.matches = response.data;
            this.renderMatches();
        } catch (error) {
            console.error('Failed to load matches:', error);
        }
    }

    renderMatches() {
        const container = document.getElementById('matchesContainer');
        if (!container) return;

        if (this.matches.length === 0) {
            container.innerHTML = '<p class="text-center text-gray-400 col-span-full">No upcoming matches available</p>';
            return;
        }

        container.innerHTML = this.matches.map(match => this.createMatchCard(match)).join('');
    }

    createMatchCard(match) {
        const matchDate = new Date(match.match_date);
        const formattedDate = matchDate.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
            <div class="glass-effect rounded-xl p-6 card-hover">
                <div class="flex justify-between items-center mb-4">
                    <div class="text-sm text-gray-400">${formattedDate}</div>
                    <div class="text-xs px-2 py-1 bg-green-500 bg-opacity-20 text-green-400 rounded-full">
                        ${match.status.toUpperCase()}
                    </div>
                </div>
                
                <div class="flex items-center justify-between mb-6">
                    <div class="flex items-center space-x-3">
                        <img src="https://flagcdn.com/w40/${match.home_team_code.toLowerCase()}.png" 
                             alt="${match.home_team_code}" 
                             class="flag-icon"
                             onerror="this.src='https://via.placeholder.com/40x24/cccccc/000000?text=${match.home_team_code}'">
                        <span class="text-lg font-semibold">${match.home_team_code.toUpperCase()}</span>
                    </div>
                    
                    <div class="text-gray-400">VS</div>
                    
                    <div class="flex items-center space-x-3">
                        <span class="text-lg font-semibold">${match.away_team_code.toUpperCase()}</span>
                        <img src="https://flagcdn.com/w40/${match.away_team_code.toLowerCase()}.png" 
                             alt="${match.away_team_code}" 
                             class="flag-icon"
                             onerror="this.src='https://via.placeholder.com/40x24/cccccc/000000?text=${match.away_team_code}'">
                    </div>
                </div>
                
                <div class="text-sm text-gray-400 mb-4 text-center">
                    <i class="fas fa-map-marker-alt mr-1"></i>
                    ${match.stadium?.name || 'Stadium'}, ${match.stadium?.city || 'City'}
                </div>
                
                <div class="space-y-2 mb-4">
                    ${match.tickets ? match.tickets.slice(0, 2).map(ticket => `
                        <div class="flex justify-between items-center text-sm">
                            <span class="text-gray-300">${ticket.category}</span>
                            <span class="text-green-400 font-semibold">$${ticket.price}</span>
                        </div>
                    `).join('') : ''}
                </div>
                
                <button onclick="app.selectMatch(${match.id})" class="btn-primary w-full">
                    <i class="fas fa-ticket-alt mr-2"></i>
                    Buy Tickets
                </button>
            </div>
        `;
    }

    selectMatch(matchId) {
        if (!this.currentUser) {
            this.showLoginModal();
            return;
        }
        window.location.href = `/checkout?match=${matchId}`;
    }

    // UI Helpers
    showNotification(message, type = 'info') {
        const container = document.getElementById('notificationContainer');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification glass-effect rounded-lg p-4 mb-4 max-w-sm ${
            type === 'success' ? 'border-green-400' : 
            type === 'error' ? 'border-red-400' : 
            'border-blue-400'
        } border`;
        
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas ${
                    type === 'success' ? 'fa-check-circle text-green-400' : 
                    type === 'error' ? 'fa-exclamation-circle text-red-400' : 
                    'fa-info-circle text-blue-400'
                } mr-3"></i>
                <span>${message}</span>
            </div>
        `;

        container.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    // Event Listeners
    setupEventListeners() {
        // Form submissions
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', this.handleLogin.bind(this));
        }
    }

    async handleLogin(event) {
        event.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            await this.login(email, password);
        } catch (error) {
            // Error already shown by apiCall
        }
    }

    // Modal Management
    showLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }
    }

    closeLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    }

    // Navigation
    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    }

    toggleMobileMenu() {
        const menu = document.getElementById('mobileMenu');
        if (menu) {
            menu.classList.toggle('hidden');
        }
    }

    // Real-time Updates
    updateTicketStock(ticketId, newStock) {
        // Update UI elements showing ticket stock
        const stockElements = document.querySelectorAll(`[data-ticket-id="${ticketId}"]`);
        stockElements.forEach(element => {
            element.textContent = newStock;
            if (newStock === 0) {
                element.classList.add('text-red-400');
            } else if (newStock < 10) {
                element.classList.add('text-yellow-400');
            }
        });
    }

    updateMatchInUI(matchData) {
        // Update match information in real-time
        const matchElements = document.querySelectorAll(`[data-match-id="${matchData.matchId}"]`);
        matchElements.forEach(element => {
            // Update match status, scores, etc.
            if (matchData.status) {
                const statusElement = element.querySelector('.match-status');
                if (statusElement) {
                    statusElement.textContent = matchData.status.toUpperCase();
                }
            }
        });
    }
}

// Global functions for inline event handlers
function showLoginModal() {
    app.showLoginModal();
}

function closeLoginModal() {
    app.closeLoginModal();
}

function scrollToSection(sectionId) {
    app.scrollToSection(sectionId);
}

function toggleMobileMenu() {
    app.toggleMobileMenu();
}

function handleLogin(event) {
    app.handleLogin(event);
}

// Initialize app
const app = new GoalTixApp();

// Add slide out animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
