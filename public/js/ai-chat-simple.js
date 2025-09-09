/**
 * Simple AI Chat Widget for Andrew Cares Village
 * Works across all pages with built-in responses
 */

(function() {
    'use strict';
    
    // Prevent multiple instances
    if (window.aiChatWidgetLoaded) return;
    window.aiChatWidgetLoaded = true;
    
    function createChatWidget() {
        // Check if widget already exists
        if (document.getElementById('ai-chat-widget')) return;
        
        const chatHTML = `
            <div id="ai-chat-widget" style="position: fixed; bottom: 20px; right: 20px; z-index: 10000;">
                <button id="chat-toggle" style="width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #6366f1, #0f172a); border: none; color: white; font-size: 24px; cursor: pointer; box-shadow: 0 4px 20px rgba(0,0,0,0.15); transition: transform 0.2s;">💬</button>
                <div id="chat-window" style="display: none; width: 350px; height: 500px; background: white; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.12); position: absolute; bottom: 70px; right: 0; border: 1px solid #e5e7eb; flex-direction: column;">
                    <div style="background: linear-gradient(135deg, #6366f1, #0f172a); color: white; padding: 16px; border-radius: 12px 12px 0 0; display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-weight: 600;">Andrew Cares Assistant</span>
                        <button id="chat-close" style="background: none; border: none; color: white; font-size: 18px; cursor: pointer; padding: 4px; border-radius: 4px;">×</button>
                    </div>
                    <div id="chat-messages" style="flex: 1; padding: 16px; overflow-y: auto; background: #f8fafc; height: 350px;">
                        <div style="background: white; padding: 10px 14px; border-radius: 18px; border: 1px solid #e5e7eb; margin-bottom: 12px;">
                            Hello! I'm your AI assistant for Andrew Cares Village. Ask me anything about our platform!
                        </div>
                        <div style="display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap;">
                            <button class="quick-btn" style="background: white; border: 1px solid #e5e7eb; border-radius: 16px; padding: 6px 12px; font-size: 12px; cursor: pointer; color: #6b7280;">What is Andrew Cares Village?</button>
                            <button class="quick-btn" style="background: white; border: 1px solid #e5e7eb; border-radius: 16px; padding: 6px 12px; font-size: 12px; cursor: pointer; color: #6b7280;">How much do courses cost?</button>
                            <button class="quick-btn" style="background: white; border: 1px solid #e5e7eb; border-radius: 16px; padding: 6px 12px; font-size: 12px; cursor: pointer; color: #6b7280;">How to become instructor?</button>
                        </div>
                    </div>
                    <div style="padding: 16px; background: white; border-top: 1px solid #e5e7eb; border-radius: 0 0 12px 12px;">
                        <div style="display: flex; gap: 8px;">
                            <input id="chat-input" type="text" placeholder="Type your message..." style="flex: 1; border: 1px solid #d1d5db; border-radius: 20px; padding: 10px 16px; font-size: 14px; outline: none;">
                            <button id="chat-send" style="background: #6366f1; color: white; border: none; border-radius: 50%; width: 40px; height: 40px; cursor: pointer; display: flex; align-items: center; justify-content: center;">→</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', chatHTML);
        
        // Get elements
        const toggle = document.getElementById('chat-toggle');
        const chatWindow = document.getElementById('chat-window');
        const close = document.getElementById('chat-close');
        const input = document.getElementById('chat-input');
        const send = document.getElementById('chat-send');
        const messages = document.getElementById('chat-messages');
        const quickBtns = document.querySelectorAll('.quick-btn');
        
        // Event listeners
        toggle.addEventListener('click', () => {
            chatWindow.style.display = chatWindow.style.display === 'none' ? 'flex' : 'none';
        });
        
        close.addEventListener('click', () => {
            chatWindow.style.display = 'none';
        });
        
        // Quick action buttons
        quickBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                sendMessage(btn.textContent);
            });
        });
        
        function addMessage(text, isUser = false) {
            const messageDiv = document.createElement('div');
            messageDiv.style.cssText = `
                background: ${isUser ? '#6366f1' : 'white'};
                color: ${isUser ? 'white' : '#374151'};
                padding: 10px 14px;
                border-radius: 18px;
                margin-bottom: 12px;
                ${isUser ? 'margin-left: 20%; text-align: right;' : 'border: 1px solid #e5e7eb; margin-right: 20%;'}
                word-wrap: break-word;
            `;
            messageDiv.textContent = text;
            messages.appendChild(messageDiv);
            messages.scrollTop = messages.scrollHeight;
        }
        
        function getResponse(message) {
            const lowerMessage = message.toLowerCase();
            
            // Platform Overview
            if (lowerMessage.includes('about') || lowerMessage.includes('what is')) {
                return 'Andrew Cares Village is a completely FREE learning platform dedicated to empowering individuals through education, mentorship connections, and personal development. Everything on our platform is free - we operate on voluntary donations and serve as a marketplace connecting mentors with students.';
            }
            
            // Free Courses & Learning
            if (lowerMessage.includes('course') || lowerMessage.includes('learn') || lowerMessage.includes('class') || lowerMessage.includes('resource')) {
                return 'All courses and learning resources are completely FREE! Visit "The Village Library" for educational resources and "The Dojo" for training content. No payments required - just sign up and start learning!';
            }
            
            // Mentorship
            if (lowerMessage.includes('mentor') || lowerMessage.includes('guidance') || lowerMessage.includes('advice')) {
                return 'Our mentorship marketplace connects students with mentors. While platform resources are FREE, individual mentors set their own rates for personalized 1-on-1 sessions. We take a 10% commission to maintain the platform.';
            }
            
            // Becoming Instructor
            if (lowerMessage.includes('instructor') || lowerMessage.includes('teach') || lowerMessage.includes('become') || lowerMessage.includes('apply')) {
                return 'Anyone with sufficient experience can become an instructor! Requirements include demonstrated expertise, professional background, and ability to teach effectively. Complete our application form, provide credentials and portfolio, then undergo our review process. Once approved, set your own rates and earn income sharing knowledge!';
            }
            
            // Pricing
            if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('fee') || lowerMessage.includes('free') || lowerMessage.includes('money')) {
                return 'Andrew Cares Village is 100% FREE to use! All platform features, resources, community access, and learning materials are completely free. The only costs are optional: 1) Voluntary donations to support the platform, and 2) Individual mentor sessions (mentors set their own rates).';
            }
            
            // Donations
            if (lowerMessage.includes('donate') || lowerMessage.includes('donation') || lowerMessage.includes('support')) {
                return 'Donations are completely voluntary and help us maintain this free platform for everyone. Visit our Donate page to contribute any amount you\'re comfortable with. Every donation helps us keep the platform running and maintain our mission of free education for all!';
            }
            
            // Registration
            if (lowerMessage.includes('sign up') || lowerMessage.includes('register') || lowerMessage.includes('join') || lowerMessage.includes('account')) {
                return 'Joining Andrew Cares Village is completely FREE! Simply create an account to access all our courses, community features, and resources. No credit card required, no hidden fees, no subscription costs. Click "Sign Up" to get started!';
            }
            
            // Default response
            return 'I\'m here to help with questions about Andrew Cares Village - our free courses, mentorship marketplace, community features, instructor applications, and how to get started! Feel free to ask me anything.';
        }
        
        function sendMessage(text = null) {
            const messageText = text || input.value.trim();
            if (!messageText) return;
            
            addMessage(messageText, true);
            if (!text) input.value = '';
            
            // Show typing indicator
            setTimeout(() => {
                const response = getResponse(messageText);
                addMessage(response);
            }, 800);
        }
        
        send.addEventListener('click', () => sendMessage());
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
        
        // Hover effects
        toggle.addEventListener('mouseenter', () => {
            toggle.style.transform = 'scale(1.1)';
        });
        toggle.addEventListener('mouseleave', () => {
            toggle.style.transform = 'scale(1)';
        });
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createChatWidget);
    } else {
        createChatWidget();
    }
})();
