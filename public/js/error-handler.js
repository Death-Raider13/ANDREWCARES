// Universal Error Handler for Andrew Cares Village
// Provides consistent error handling, retry logic, and offline support across all pages

class ErrorHandler {
    constructor() {
        this.retryAttempts = new Map();
        this.maxRetries = 3;
        this.baseDelay = 1000;
        this.queuedActions = [];
        this.isOnline = navigator.onLine;
        this.connectionListeners = [];
        
        this.init();
    }

    init() {
        // Listen for online/offline events
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.notifyConnectionChange(true);
            this.processQueuedActions();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.notifyConnectionChange(false);
        });

        // Register service worker
        this.registerServiceWorker();
    }

    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('✅ Service Worker registered:', registration.scope);
                
                // Listen for updates
                registration.addEventListener('updatefound', () => {
                    console.log('🔄 Service Worker update found');
                });
            } catch (error) {
                console.warn('⚠️ Service Worker registration failed:', error);
            }
        }
    }

    // Universal Firebase operation wrapper with retry logic
    async executeFirebaseOperation(operation, operationName = 'Firebase operation') {
        const operationId = `${operationName}_${Date.now()}`;
        
        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                const result = await operation();
                
                // Reset retry count on success
                this.retryAttempts.delete(operationId);
                return result;
                
            } catch (error) {
                console.warn(`❌ ${operationName} failed (attempt ${attempt}/${this.maxRetries}):`, error);
                
                // Check if it's a connection error
                if (this.isConnectionError(error)) {
                    if (!this.isOnline) {
                        throw new Error('OFFLINE_MODE');
                    }
                    
                    // Wait before retry with exponential backoff
                    if (attempt < this.maxRetries) {
                        const delay = this.baseDelay * Math.pow(2, attempt - 1);
                        await this.delay(delay);
                        continue;
                    }
                }
                
                // Non-retryable error or max retries reached
                throw error;
            }
        }
    }

    // Check if error is connection-related
    isConnectionError(error) {
        const connectionErrors = [
            'unavailable',
            'deadline-exceeded',
            'network-error',
            'offline',
            'timeout'
        ];
        
        return connectionErrors.some(errorType => 
            error.code === errorType || 
            error.message.toLowerCase().includes(errorType)
        );
    }

    // Queue action for later execution when online
    queueAction(actionType, data, callback = null) {
        const action = {
            id: Date.now() + Math.random(),
            type: actionType,
            data: data,
            callback: callback,
            timestamp: Date.now()
        };
        
        this.queuedActions.push(action);
        localStorage.setItem('queuedActions', JSON.stringify(this.queuedActions));
        
        console.log(`📋 Queued ${actionType} for later execution`);
        this.showNotification(`${actionType} queued - will sync when online`, 'info');
    }

    // Process all queued actions when connection is restored
    async processQueuedActions() {
        if (!this.isOnline || this.queuedActions.length === 0) return;
        
        console.log(`🔄 Processing ${this.queuedActions.length} queued actions`);
        
        const actionsToProcess = [...this.queuedActions];
        this.queuedActions = [];
        
        for (const action of actionsToProcess) {
            try {
                if (action.callback && typeof action.callback === 'function') {
                    await action.callback(action.data);
                }
                console.log(`✅ Processed queued ${action.type}`);
            } catch (error) {
                console.error(`❌ Failed to process queued ${action.type}:`, error);
                // Re-queue failed actions
                this.queuedActions.push(action);
            }
        }
        
        localStorage.setItem('queuedActions', JSON.stringify(this.queuedActions));
        
        if (actionsToProcess.length > 0) {
            this.showNotification('Synced queued actions', 'success');
        }
    }

    // Add connection status listener
    onConnectionChange(callback) {
        this.connectionListeners.push(callback);
    }

    // Notify all listeners of connection changes
    notifyConnectionChange(isOnline) {
        this.connectionListeners.forEach(callback => {
            try {
                callback(isOnline);
            } catch (error) {
                console.error('Connection listener error:', error);
            }
        });
        
        const status = isOnline ? 'online' : 'offline';
        this.showNotification(`Connection ${status}`, isOnline ? 'success' : 'warning');
    }

    // Universal notification system
    showNotification(message, type = 'info', duration = 4000) {
        // Remove existing notifications
        const existing = document.querySelector('.error-handler-notification');
        if (existing) existing.remove();
        
        const notification = document.createElement('div');
        notification.className = `error-handler-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${this.getNotificationIcon(type)}</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        // Add styles if not already present
        if (!document.querySelector('#error-handler-styles')) {
            this.addNotificationStyles();
        }
        
        document.body.appendChild(notification);
        
        // Auto-remove after duration
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, duration);
    }

    getNotificationIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || 'ℹ️';
    }

    addNotificationStyles() {
        const styles = document.createElement('style');
        styles.id = 'error-handler-styles';
        styles.textContent = `
            .error-handler-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 400px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                animation: slideIn 0.3s ease-out;
            }
            
            .error-handler-notification.success {
                background: linear-gradient(135deg, #4caf50, #45a049);
                color: white;
            }
            
            .error-handler-notification.error {
                background: linear-gradient(135deg, #f44336, #d32f2f);
                color: white;
            }
            
            .error-handler-notification.warning {
                background: linear-gradient(135deg, #ff9800, #f57c00);
                color: white;
            }
            
            .error-handler-notification.info {
                background: linear-gradient(135deg, #2196f3, #1976d2);
                color: white;
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                padding: 12px 16px;
                gap: 8px;
            }
            
            .notification-icon {
                font-size: 16px;
                flex-shrink: 0;
            }
            
            .notification-message {
                flex: 1;
                font-size: 14px;
                line-height: 1.4;
            }
            
            .notification-close {
                background: none;
                border: none;
                color: inherit;
                font-size: 18px;
                cursor: pointer;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: background-color 0.2s;
            }
            
            .notification-close:hover {
                background-color: rgba(255,255,255,0.2);
            }
            
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
            
            @media (max-width: 480px) {
                .error-handler-notification {
                    left: 10px;
                    right: 10px;
                    max-width: none;
                }
            }
        `;
        document.head.appendChild(styles);
    }

    // Utility function for delays
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Cache data for offline use
    cacheData(key, data) {
        try {
            localStorage.setItem(`cache_${key}`, JSON.stringify({
                data: data,
                timestamp: Date.now()
            }));
        } catch (error) {
            console.warn('Failed to cache data:', error);
        }
    }

    // Retrieve cached data
    getCachedData(key, maxAge = 24 * 60 * 60 * 1000) { // 24 hours default
        try {
            const cached = localStorage.getItem(`cache_${key}`);
            if (!cached) return null;
            
            const parsed = JSON.parse(cached);
            const age = Date.now() - parsed.timestamp;
            
            if (age > maxAge) {
                localStorage.removeItem(`cache_${key}`);
                return null;
            }
            
            return parsed.data;
        } catch (error) {
            console.warn('Failed to retrieve cached data:', error);
            return null;
        }
    }
}

// Create global instance
window.errorHandler = new ErrorHandler();

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ErrorHandler;
}
