/**
 * AI Chat Widget for Andrew Cares Village
 * A modern, responsive chat widget that can integrate with various AI services
 */

class AIChatWidget {
    constructor(options = {}) {
        this.options = {
            position: 'bottom-right',
            primaryColor: '#6366f1',
            secondaryColor: '#0f172a',
            apiEndpoint: options.apiEndpoint || null,
            welcomeMessage: 'Hi! I\'m here to help you with any questions about Andrew Cares Village. How can I assist you today?',
            placeholder: 'Type your message...',
            title: 'AI Assistant',
            ...options
        };
        
        this.isOpen = false;
        this.messages = [];
        this.isTyping = false;
        
        this.init();
    }
    
    init() {
        this.createWidget();
        this.attachEventListeners();
        this.addWelcomeMessage();
    }
    
    createWidget() {
        // Create widget container
        this.widget = document.createElement('div');
        this.widget.className = 'ai-chat-widget';
        this.widget.innerHTML = this.getWidgetHTML();
        
        // Add styles
        this.addStyles();
        
        // Append to body
        document.body.appendChild(this.widget);
        
        // Cache DOM elements
        this.chatButton = this.widget.querySelector('.chat-toggle-btn');
        this.chatWindow = this.widget.querySelector('.chat-window');
        this.messagesContainer = this.widget.querySelector('.chat-messages');
        this.messageInput = this.widget.querySelector('.message-input');
        this.sendButton = this.widget.querySelector('.send-btn');
        this.closeButton = this.widget.querySelector('.chat-close-btn');
    }
    
    getWidgetHTML() {
        return `
            <!-- Chat Toggle Button -->
            <div class="chat-toggle-btn" title="Chat with AI Assistant">
                <i class="fas fa-comments"></i>
                <div class="notification-badge">1</div>
            </div>
            
            <!-- Chat Window -->
            <div class="chat-window">
                <div class="chat-header">
                    <div class="chat-header-info">
                        <div class="ai-avatar">
                            <i class="fas fa-robot"></i>
                        </div>
                        <div class="chat-title">
                            <h3>${this.options.title}</h3>
                            <span class="status">Online</span>
                        </div>
                    </div>
                    <button class="chat-close-btn" title="Close chat">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="chat-messages" id="chatMessages">
                    <!-- Messages will be inserted here -->
                </div>
                
                <div class="typing-indicator" style="display: none;">
                    <div class="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                    <span class="typing-text">AI is typing...</span>
                </div>
                
                <div class="chat-input-container">
                    <div class="input-wrapper">
                        <input 
                            type="text" 
                            class="message-input" 
                            placeholder="${this.options.placeholder}"
                            maxlength="500"
                        >
                        <button class="send-btn" title="Send message">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                    <div class="quick-actions">
                        <button class="quick-btn" data-message="Tell me about Andrew Cares Village">
                            About Us
                        </button>
                        <button class="quick-btn" data-message="How do I sign up for courses?">
                            Sign Up Help
                        </button>
                        <button class="quick-btn" data-message="What mentorship options are available?">
                            Mentorship
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    addStyles() {
        const styles = `
            <style>
            .ai-chat-widget {
                position: fixed;
                ${this.options.position.includes('right') ? 'right: 20px;' : 'left: 20px;'}
                ${this.options.position.includes('bottom') ? 'bottom: 20px;' : 'top: 20px;'}
                z-index: 10000;
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            }
            
            .chat-toggle-btn {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: linear-gradient(135deg, ${this.options.primaryColor}, ${this.options.secondaryColor});
                color: white;
                border: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                position: relative;
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0% { box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3); }
                50% { box-shadow: 0 4px 25px rgba(99, 102, 241, 0.5); }
                100% { box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3); }
            }
            
            .chat-toggle-btn:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 25px rgba(99, 102, 241, 0.4);
            }
            
            .notification-badge {
                position: absolute;
                top: -5px;
                right: -5px;
                background: #ef4444;
                color: white;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                font-size: 12px;
                font-weight: 600;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: bounce 1s infinite;
            }
            
            @keyframes bounce {
                0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                40% { transform: translateY(-5px); }
                60% { transform: translateY(-3px); }
            }
            
            .chat-window {
                position: absolute;
                bottom: 80px;
                right: 0;
                width: 380px;
                height: 500px;
                background: white;
                border-radius: 16px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
                display: none;
                flex-direction: column;
                overflow: hidden;
                transform: scale(0.8) translateY(20px);
                opacity: 0;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                border: 1px solid rgba(0, 0, 0, 0.1);
            }
            
            .chat-window.open {
                display: flex;
                transform: scale(1) translateY(0);
                opacity: 1;
            }
            
            .chat-header {
                background: linear-gradient(135deg, ${this.options.primaryColor}, ${this.options.secondaryColor});
                color: white;
                padding: 16px 20px;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            
            .chat-header-info {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .ai-avatar {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.2);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
            }
            
            .chat-title h3 {
                margin: 0;
                font-size: 16px;
                font-weight: 600;
            }
            
            .status {
                font-size: 12px;
                opacity: 0.9;
                display: flex;
                align-items: center;
                gap: 6px;
            }
            
            .status::before {
                content: '';
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #10b981;
                display: inline-block;
            }
            
            .chat-close-btn {
                background: none;
                border: none;
                color: white;
                font-size: 18px;
                cursor: pointer;
                padding: 8px;
                border-radius: 6px;
                transition: background 0.2s;
            }
            
            .chat-close-btn:hover {
                background: rgba(255, 255, 255, 0.1);
            }
            
            .chat-messages {
                flex: 1;
                overflow-y: auto;
                padding: 20px;
                background: #f8fafc;
                display: flex;
                flex-direction: column;
                gap: 16px;
            }
            
            .message {
                max-width: 80%;
                padding: 12px 16px;
                border-radius: 18px;
                font-size: 14px;
                line-height: 1.4;
                animation: slideIn 0.3s ease-out;
            }
            
            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .message.user {
                background: ${this.options.primaryColor};
                color: white;
                align-self: flex-end;
                border-bottom-right-radius: 4px;
            }
            
            .message.ai {
                background: white;
                color: #374151;
                align-self: flex-start;
                border-bottom-left-radius: 4px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            
            .typing-indicator {
                padding: 12px 20px;
                display: flex;
                align-items: center;
                gap: 10px;
                background: #f8fafc;
                border-top: 1px solid #e5e7eb;
            }
            
            .typing-dots {
                display: flex;
                gap: 4px;
            }
            
            .typing-dots span {
                width: 6px;
                height: 6px;
                border-radius: 50%;
                background: ${this.options.primaryColor};
                animation: typingDot 1.4s infinite ease-in-out;
            }
            
            .typing-dots span:nth-child(1) { animation-delay: -0.32s; }
            .typing-dots span:nth-child(2) { animation-delay: -0.16s; }
            
            @keyframes typingDot {
                0%, 80%, 100% {
                    transform: scale(0.8);
                    opacity: 0.5;
                }
                40% {
                    transform: scale(1);
                    opacity: 1;
                }
            }
            
            .typing-text {
                font-size: 12px;
                color: #6b7280;
                font-style: italic;
            }
            
            .chat-input-container {
                padding: 16px 20px;
                background: white;
                border-top: 1px solid #e5e7eb;
            }
            
            .input-wrapper {
                display: flex;
                gap: 8px;
                margin-bottom: 12px;
            }
            
            .message-input {
                flex: 1;
                padding: 12px 16px;
                border: 2px solid #e5e7eb;
                border-radius: 24px;
                font-size: 14px;
                outline: none;
                transition: border-color 0.2s;
                font-family: inherit;
            }
            
            .message-input:focus {
                border-color: ${this.options.primaryColor};
            }
            
            .send-btn {
                width: 44px;
                height: 44px;
                border-radius: 50%;
                background: ${this.options.primaryColor};
                color: white;
                border: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
                font-size: 16px;
            }
            
            .send-btn:hover {
                background: ${this.options.secondaryColor};
                transform: scale(1.05);
            }
            
            .send-btn:disabled {
                background: #d1d5db;
                cursor: not-allowed;
                transform: none;
            }
            
            .quick-actions {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
            }
            
            .quick-btn {
                padding: 6px 12px;
                background: #f3f4f6;
                border: 1px solid #e5e7eb;
                border-radius: 16px;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s;
                color: #374151;
            }
            
            .quick-btn:hover {
                background: ${this.options.primaryColor};
                color: white;
                border-color: ${this.options.primaryColor};
            }
            
            /* Mobile Responsive */
            @media (max-width: 480px) {
                .chat-window {
                    width: calc(100vw - 40px);
                    height: calc(100vh - 100px);
                    right: 20px;
                    bottom: 80px;
                }
                
                .ai-chat-widget {
                    right: 20px;
                    bottom: 20px;
                }
            }
            
            /* Scrollbar Styling */
            .chat-messages::-webkit-scrollbar {
                width: 4px;
            }
            
            .chat-messages::-webkit-scrollbar-track {
                background: transparent;
            }
            
            .chat-messages::-webkit-scrollbar-thumb {
                background: #d1d5db;
                border-radius: 2px;
            }
            
            .chat-messages::-webkit-scrollbar-thumb:hover {
                background: #9ca3af;
            }
            </style>
        `;
        
        // Add styles to head
        const styleSheet = document.createElement('div');
        styleSheet.innerHTML = styles;
        document.head.appendChild(styleSheet.firstElementChild);
    }
    
    attachEventListeners() {
        // Toggle chat window
        this.chatButton.addEventListener('click', () => this.toggleChat());
        this.closeButton.addEventListener('click', () => this.closeChat());
        
        // Send message
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Quick action buttons
        this.widget.addEventListener('click', (e) => {
            if (e.target.classList.contains('quick-btn')) {
                const message = e.target.getAttribute('data-message');
                this.messageInput.value = message;
                this.sendMessage();
            }
        });
        
        // Auto-resize input
        this.messageInput.addEventListener('input', () => {
            this.updateSendButton();
        });
        
        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!this.widget.contains(e.target) && this.isOpen) {
                this.closeChat();
            }
        });
    }
    
    toggleChat() {
        if (this.isOpen) {
            this.closeChat();
        } else {
            this.openChat();
        }
    }
    
    openChat() {
        this.isOpen = true;
        this.chatWindow.classList.add('open');
        this.hideNotificationBadge();
        this.messageInput.focus();
        
        // Track analytics
        this.trackEvent('chat_opened');
    }
    
    closeChat() {
        this.isOpen = false;
        this.chatWindow.classList.remove('open');
        
        // Track analytics
        this.trackEvent('chat_closed');
    }
    
    addWelcomeMessage() {
        this.addMessage(this.options.welcomeMessage, 'ai');
    }
    
    sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;
        
        // Add user message
        this.addMessage(message, 'user');
        this.messageInput.value = '';
        this.updateSendButton();
        
        // Show typing indicator
        this.showTyping();
        
        // Process AI response
        this.processAIResponse(message);
        
        // Track analytics
        this.trackEvent('message_sent', { message_length: message.length });
    }
    
    addMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        messageDiv.textContent = content;
        
        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
        
        // Store message
        this.messages.push({ content, sender, timestamp: Date.now() });
    }
    
    showTyping() {
        this.isTyping = true;
        this.widget.querySelector('.typing-indicator').style.display = 'flex';
        this.scrollToBottom();
    }
    
    hideTyping() {
        this.isTyping = false;
        this.widget.querySelector('.typing-indicator').style.display = 'none';
    }
    
    async processAIResponse(userMessage) {
        try {
            // Simulate AI thinking time
            await this.delay(1000 + Math.random() * 2000);
            
            let response;
            
            if (this.options.apiEndpoint) {
                // Use custom API endpoint
                response = await this.callAIAPI(userMessage);
            } else {
                // Use built-in responses
                response = this.getBuiltInResponse(userMessage);
            }
            
            this.hideTyping();
            this.addMessage(response, 'ai');
            
        } catch (error) {
            console.error('AI Response Error:', error);
            this.hideTyping();
            this.addMessage('I apologize, but I\'m having trouble processing your request right now. Please try again later or contact our support team.', 'ai');
        }
    }
    
    async callAIAPI(message) {
        const response = await fetch(this.options.apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                conversation_history: this.messages.slice(-5) // Send last 5 messages for context
            })
        });
        
        if (!response.ok) {
            throw new Error('API request failed');
        }
        
        const data = await response.json();
        return data.response || data.message || 'I apologize, but I couldn\'t generate a response.';
    }
    
    getBuiltInResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // Andrew Cares Village specific responses
        if (lowerMessage.includes('about') || lowerMessage.includes('what is')) {
            return 'Andrew Cares Village is a comprehensive learning and mentorship platform dedicated to empowering individuals through education, community support, and personal development. We offer courses, mentorship programs, and a supportive community environment.';
        }
        
        if (lowerMessage.includes('sign up') || lowerMessage.includes('register') || lowerMessage.includes('join')) {
            return 'To sign up for Andrew Cares Village, click the "Sign Up" button in the top navigation. You can create a free account and immediately access our community features. Premium courses and mentorship programs are available after registration.';
        }
        
        if (lowerMessage.includes('course') || lowerMessage.includes('learn') || lowerMessage.includes('class')) {
            return 'We offer a wide variety of courses covering personal development, professional skills, and academic subjects. You can browse our course catalog after signing up. Many courses are free, while premium courses offer additional features and certification.';
        }
        
        if (lowerMessage.includes('mentor') || lowerMessage.includes('guidance') || lowerMessage.includes('advice')) {
            return 'Our mentorship program connects you with experienced professionals and educators. You can browse available mentors, book sessions, and receive personalized guidance for your goals. Visit our Mentorship page to learn more and find the right mentor for you.';
        }
        
        if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('fee') || lowerMessage.includes('payment')) {
            return 'Andrew Cares Village offers both free and premium features. Basic community access is free, while premium courses and one-on-one mentorship sessions have associated costs. You can view specific pricing on each course or mentor profile page.';
        }
        
        if (lowerMessage.includes('contact') || lowerMessage.includes('support') || lowerMessage.includes('help')) {
            return 'You can reach our support team through the Contact page, or send us a message directly. We typically respond within 24 hours. For immediate assistance, you can also check our FAQ section or browse our community forums.';
        }
        
        if (lowerMessage.includes('donate') || lowerMessage.includes('donation') || lowerMessage.includes('contribute')) {
            return 'Thank you for your interest in supporting Andrew Cares Village! You can make a donation through our Donate page. Your contributions help us maintain the platform and provide scholarships to learners in need.';
        }
        
        // General helpful responses
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
            return 'Hello! Welcome to Andrew Cares Village. I\'m here to help you navigate our platform and answer any questions you might have. What would you like to know?';
        }
        
        if (lowerMessage.includes('thank')) {
            return 'You\'re very welcome! I\'m happy to help. Is there anything else you\'d like to know about Andrew Cares Village?';
        }
        
        // Default response
        return 'I understand you\'re asking about "' + message + '". While I don\'t have a specific answer for that, I\'d be happy to help you with information about our courses, mentorship programs, or how to get started with Andrew Cares Village. You can also contact our support team for more detailed assistance.';
    }
    
    updateSendButton() {
        const hasText = this.messageInput.value.trim().length > 0;
        this.sendButton.disabled = !hasText;
    }
    
    scrollToBottom() {
        setTimeout(() => {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }, 100);
    }
    
    hideNotificationBadge() {
        const badge = this.widget.querySelector('.notification-badge');
        if (badge) {
            badge.style.display = 'none';
        }
    }
    
    showNotificationBadge(count = 1) {
        const badge = this.widget.querySelector('.notification-badge');
        if (badge) {
            badge.textContent = count;
            badge.style.display = 'flex';
        }
    }
    
    trackEvent(eventName, properties = {}) {
        // Integration with analytics (Google Analytics, Firebase Analytics, etc.)
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                event_category: 'AI_Chat',
                ...properties
            });
        }
        
        // Console log for debugging
        console.log('Chat Event:', eventName, properties);
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // Public methods for external integration
    sendCustomMessage(message, sender = 'ai') {
        this.addMessage(message, sender);
    }
    
    clearChat() {
        this.messagesContainer.innerHTML = '';
        this.messages = [];
        this.addWelcomeMessage();
    }
    
    setApiEndpoint(endpoint) {
        this.options.apiEndpoint = endpoint;
    }
    
    destroy() {
        if (this.widget && this.widget.parentNode) {
            this.widget.parentNode.removeChild(this.widget);
        }
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the AI chat widget
    window.aiChatWidget = new AIChatWidget({
        // You can customize these options
        title: 'Andrew Cares Assistant',
        welcomeMessage: 'Hello! Welcome to Andrew Cares Village. I\'m here to help you with any questions about our courses, mentorship programs, or community. How can I assist you today?',
        primaryColor: '#6366f1',
        secondaryColor: '#0f172a',
        // apiEndpoint: 'https://your-api-endpoint.com/chat' // Uncomment and set your API endpoint
    });
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIChatWidget;
}
