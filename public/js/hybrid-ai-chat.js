/**
 * Hybrid AI Chat System for Andrew Cares Village
 */

// Simple chat widget that works across all pages
(function() {
    'use strict';
    
    // Create and initialize chat widget
    function createChatWidget() {
        // Prevent multiple instances
        if (document.getElementById('ai-chat-widget')) {
            return;
        }
        
        console.log('Creating AI chat widget...');
        
        const chatHTML = `
            <div id="ai-chat-widget" style="position: fixed; bottom: 20px; right: 20px; z-index: 10000;">
                <button id="chat-toggle" style="width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #6366f1, #0f172a); border: none; color: white; font-size: 24px; cursor: pointer; box-shadow: 0 4px 20px rgba(0,0,0,0.15);">💬</button>
                <div id="chat-window" style="display: none; width: 350px; height: 500px; background: white; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.12); position: absolute; bottom: 70px; right: 0; border: 1px solid #e5e7eb; flex-direction: column;">
                    <div style="background: linear-gradient(135deg, #6366f1, #0f172a); color: white; padding: 16px; border-radius: 12px 12px 0 0; display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-weight: 600;">Andrew Cares Assistant</span>
                        <button id="chat-close" style="background: none; border: none; color: white; font-size: 18px; cursor: pointer;">×</button>
                    </div>
                    <div id="chat-messages" style="flex: 1; padding: 16px; overflow-y: auto; background: #f8fafc; height: 350px;">
                        <div style="background: white; padding: 10px 14px; border-radius: 18px; border: 1px solid #e5e7eb; margin-bottom: 12px;">
                            Hello! I'm your AI assistant for Andrew Cares Village. Ask me anything about our platform!
                        </div>
                    </div>
                    <div style="padding: 16px; background: white; border-top: 1px solid #e5e7eb; border-radius: 0 0 12px 12px;">
                        <div style="display: flex; gap: 8px;">
                            <input id="chat-input" type="text" placeholder="Type your message..." style="flex: 1; border: 1px solid #d1d5db; border-radius: 20px; padding: 10px 16px; font-size: 14px; outline: none;">
                            <button id="chat-send" style="background: #6366f1; color: white; border: none; border-radius: 50%; width: 40px; height: 40px; cursor: pointer;">→</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', chatHTML);
        
        console.log('Chat widget HTML inserted');
        
        // Add event listeners
        const toggle = document.getElementById('chat-toggle');
        const window = document.getElementById('chat-window');
        const close = document.getElementById('chat-close');
        const input = document.getElementById('chat-input');
        const send = document.getElementById('chat-send');
        const messages = document.getElementById('chat-messages');
        
        toggle.onclick = () => {
            window.style.display = window.style.display === 'none' ? 'flex' : 'none';
        };
        
        close.onclick = () => {
            window.style.display = 'none';
        };
        
        function addMessage(text, isUser = false) {
            const messageDiv = document.createElement('div');
            messageDiv.style.cssText = `
                background: ${isUser ? '#6366f1' : 'white'};
                color: ${isUser ? 'white' : '#374151'};
                padding: 10px 14px;
                border-radius: 18px;
                margin-bottom: 12px;
                ${isUser ? 'margin-left: 20%; text-align: right;' : 'border: 1px solid #e5e7eb; margin-right: 20%;'}
            `;
            messageDiv.textContent = text;
            messages.appendChild(messageDiv);
            messages.scrollTop = messages.scrollHeight;
        }
        
        function getResponse(message) {
            const lowerMessage = message.toLowerCase();
            
            if (lowerMessage.includes('about') || lowerMessage.includes('what is')) {
                return 'Andrew Cares Village is a completely FREE learning platform with courses, mentorship, and community features. Everything is free except optional mentorship sessions.';
            }
            if (lowerMessage.includes('course') || lowerMessage.includes('learn')) {
                return 'All courses and learning resources are completely FREE! Visit our library and dojo for educational content.';
            }
            if (lowerMessage.includes('mentor') || lowerMessage.includes('guidance')) {
                return 'Our mentorship marketplace connects you with experts. Mentors set their own rates, and we take a 10% commission to maintain the platform.';
            }
            if (lowerMessage.includes('instructor') || lowerMessage.includes('teach')) {
                return 'You can become an instructor! Apply with your credentials and expertise. Set your own rates and earn income sharing knowledge.';
            }
            if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('free')) {
                return 'Andrew Cares Village is 100% FREE! Only optional mentorship sessions have costs (set by mentors). No subscriptions or hidden fees.';
            }
            if (lowerMessage.includes('donate') || lowerMessage.includes('support')) {
                return 'Donations are voluntary and help maintain our free platform. Visit our donate page to contribute any amount you\'re comfortable with.';
            }
            
            return 'I\'m here to help with questions about Andrew Cares Village - our free courses, mentorship marketplace, community features, and how to get started!';
        }
        
        function sendMessage() {
            const text = input.value.trim();
            if (!text) return;
            
            addMessage(text, true);
            input.value = '';
            
            setTimeout(() => {
                const response = getResponse(text);
                addMessage(response);
            }, 500);
        }
        
        send.onclick = sendMessage;
        input.onkeypress = (e) => {
            if (e.key === 'Enter') sendMessage();
        };
    }
    
    // Initialize when DOM is ready
    console.log('AI Chat Widget script loaded, DOM state:', document.readyState);
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createChatWidget);
    } else {
        createChatWidget();
    }
})();
