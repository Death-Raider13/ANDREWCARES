/**
 * Advanced Hybrid AI Chat System for Andrew Cares Village
 * Features: OpenAI API integration, learning mechanism, seamless AI switching
 */

class HybridAIChatWidget {
    constructor(options = {}) {
        this.options = {
            openaiApiKey: options.openaiApiKey || '',
            monthlyLimit: options.monthlyLimit || 50,
            openaiModel: options.openaiModel || 'gpt-3.5-turbo',
            ...options
        };
        
        this.smartAIUsage = this.getUsageCount();
        this.learningDatabase = this.loadLearningDatabase();
        this.conversationHistory = this.loadConversationHistory();
        
        this.init();
    }
    
    init() {
        if (document.getElementById('ai-chat-widget')) return;
        this.createWidget();
        this.attachEventListeners();
        console.log('🚀 Advanced Hybrid AI Chat System Active!');
    }
    
    createWidget() {
        const widgetHTML = `
            <div id="ai-chat-widget" style="position: fixed; bottom: 20px; right: 20px; z-index: 10000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                <div id="chat-notification" style="position: absolute; top: -8px; right: -8px; width: 20px; height: 20px; background: #ef4444; border-radius: 50%; display: none; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: bold; animation: pulse 2s infinite;">1</div>
                <button id="chat-toggle" style="width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #6366f1, #0f172a); border: none; color: white; font-size: 24px; cursor: pointer; box-shadow: 0 4px 20px rgba(0,0,0,0.15); transition: all 0.3s ease; display: flex; align-items: center; justify-content: center;">
                    💬
                </button>
                
                <div id="chat-window" style="display: none; width: 380px; height: 550px; background: white; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); position: absolute; bottom: 70px; right: 0; border: 1px solid #e5e7eb; flex-direction: column; overflow: hidden;">
                    <div id="chat-header" style="background: linear-gradient(135deg, #6366f1, #0f172a); color: white; padding: 20px; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: 600; font-size: 16px;">Andrew Cares Assistant</div>
                            <div style="font-size: 12px; opacity: 0.8;">Always here to help</div>
                        </div>
                        <button id="chat-close" style="background: rgba(255,255,255,0.2); border: none; color: white; font-size: 18px; cursor: pointer; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: background 0.2s;">×</button>
                    </div>
                    
                    <div id="chat-messages" style="flex: 1; padding: 20px; overflow-y: auto; background: #f8fafc; max-height: 380px;">
                        <div class="ai-message" style="background: white; padding: 12px 16px; border-radius: 18px; border: 1px solid #e5e7eb; margin-bottom: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                            Hello! I'm your AI assistant for Andrew Cares Village. I can help you with information about our free platform, courses, mentorship, and more. What would you like to know?
                        </div>
                        
                        <div id="quick-actions" style="display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap;">
                            <button class="quick-btn" data-message="What is Andrew Cares Village?" style="background: white; border: 1px solid #e5e7eb; border-radius: 16px; padding: 8px 12px; font-size: 12px; cursor: pointer; color: #6b7280; transition: all 0.2s;">About Platform</button>
                            <button class="quick-btn" data-message="How much do courses cost?" style="background: white; border: 1px solid #e5e7eb; border-radius: 16px; padding: 8px 12px; font-size: 12px; cursor: pointer; color: #6b7280; transition: all 0.2s;">Course Pricing</button>
                            <button class="quick-btn" data-message="How can I become an instructor?" style="background: white; border: 1px solid #e5e7eb; border-radius: 16px; padding: 8px 12px; font-size: 12px; cursor: pointer; color: #6b7280; transition: all 0.2s;">Become Instructor</button>
                        </div>
                    </div>
                    
                    <div id="typing-indicator" style="display: none; padding: 0 20px 10px; color: #6b7280; font-size: 14px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <div class="typing-dots" style="display: flex; gap: 4px;">
                                <div style="width: 6px; height: 6px; background: #6b7280; border-radius: 50%; animation: typing 1.4s infinite;"></div>
                                <div style="width: 6px; height: 6px; background: #6b7280; border-radius: 50%; animation: typing 1.4s infinite 0.2s;"></div>
                                <div style="width: 6px; height: 6px; background: #6b7280; border-radius: 50%; animation: typing 1.4s infinite 0.4s;"></div>
                            </div>
                            <span>AI is thinking...</span>
                        </div>
                    </div>
                    
                    <div id="chat-input-container" style="padding: 20px; background: white; border-top: 1px solid #e5e7eb;">
                        <div style="display: flex; gap: 12px; align-items: flex-end;">
                            <input id="chat-input" type="text" placeholder="Ask me anything about Andrew Cares Village..." style="flex: 1; border: 1px solid #d1d5db; border-radius: 24px; padding: 12px 16px; font-size: 14px; outline: none; resize: none; min-height: 20px; max-height: 100px; transition: border-color 0.2s;">
                            <button id="chat-send" style="background: #6366f1; color: white; border: none; border-radius: 50%; width: 44px; height: 44px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="22" y1="2" x2="11" y2="13"></line>
                                    <polygon points="22,2 15,22 11,13 2,9"></polygon>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <style>
                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.1); opacity: 0.8; }
                }
                
                @keyframes typing {
                    0%, 60%, 100% { transform: translateY(0); }
                    30% { transform: translateY(-10px); }
                }
                
                #chat-toggle:hover {
                    transform: scale(1.05);
                    box-shadow: 0 6px 25px rgba(0,0,0,0.2);
                }
                
                .quick-btn:hover {
                    background: #f3f4f6;
                    border-color: #6366f1;
                    color: #6366f1;
                }
                
                #chat-input:focus {
                    border-color: #6366f1;
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
                }
                
                #chat-send:hover {
                    background: #5856eb;
                    transform: scale(1.05);
                }
                
                #chat-close:hover {
                    background: rgba(255,255,255,0.3);
                }
                
                #chat-messages::-webkit-scrollbar {
                    width: 6px;
                }
                
                #chat-messages::-webkit-scrollbar-track {
                    background: #f1f5f9;
                }
                
                #chat-messages::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 3px;
                }
            </style>
        `;
        
        document.body.insertAdjacentHTML('beforeend', widgetHTML);
        this.widget = document.getElementById('ai-chat-widget');
        this.messagesContainer = document.getElementById('chat-messages');
    }
    
    attachEventListeners() {
        const toggle = document.getElementById('chat-toggle');
        const chatWindow = document.getElementById('chat-window');
        const close = document.getElementById('chat-close');
        const input = document.getElementById('chat-input');
        const send = document.getElementById('chat-send');
        const quickBtns = document.querySelectorAll('.quick-btn');
        
        toggle.addEventListener('click', () => this.toggleChat());
        close.addEventListener('click', () => this.closeChat());
        send.addEventListener('click', () => this.sendMessage());
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        quickBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const message = btn.dataset.message;
                this.sendMessage(message);
            });
        });
    }
    
    toggleChat() {
        const chatWindow = document.getElementById('chat-window');
        const isVisible = chatWindow.style.display === 'flex';
        chatWindow.style.display = isVisible ? 'none' : 'flex';
        
        if (!isVisible) {
            this.hideNotificationBadge();
            document.getElementById('chat-input').focus();
        }
    }
    
    closeChat() {
        document.getElementById('chat-window').style.display = 'none';
    }
    
    async sendMessage(text = null) {
        const input = document.getElementById('chat-input');
        const messageText = text || input.value.trim();
        
        if (!messageText) return;
        
        this.addMessage(messageText, true);
        if (!text) input.value = '';
        
        // Process AI response
        await this.processAIResponse(messageText);
    }
    
    addMessage(text, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = isUser ? 'user-message' : 'ai-message';
        messageDiv.style.cssText = `
            background: ${isUser ? '#6366f1' : 'white'};
            color: ${isUser ? 'white' : '#374151'};
            padding: 12px 16px;
            border-radius: 18px;
            margin-bottom: 16px;
            ${isUser ? 'margin-left: 20%; text-align: right;' : 'border: 1px solid #e5e7eb; margin-right: 20%; box-shadow: 0 2px 4px rgba(0,0,0,0.05);'}
            word-wrap: break-word;
            line-height: 1.4;
        `;
        messageDiv.textContent = text;
        
        const quickActions = document.getElementById('quick-actions');
        this.messagesContainer.insertBefore(messageDiv, quickActions);
        this.scrollToBottom();
        
        // Save to conversation history
        this.conversationHistory.push({
            text: text,
            isUser: isUser,
            timestamp: Date.now()
        });
        this.saveConversationHistory();
    }
    
    showTyping() {
        document.getElementById('typing-indicator').style.display = 'block';
        this.scrollToBottom();
    }
    
    hideTyping() {
        document.getElementById('typing-indicator').style.display = 'none';
    }
    
    async processAIResponse(userMessage) {
        try {
            this.showTyping();
            let response;
            
            // 1. Check learned responses first
            const learnedResponse = this.getLearnedResponse(userMessage);
            if (learnedResponse) {
                response = learnedResponse;
            }
            // 2. Try OpenAI if under limit and API key available
            else if (this.smartAIUsage < this.options.monthlyLimit && this.options.openaiApiKey) {
                try {
                    response = await this.callOpenAI(userMessage);
                    this.updateUsageCount();
                    // Save to learning database
                    this.saveLearning(userMessage, response, 'openai');
                } catch (error) {
                    console.warn('OpenAI failed, using fallback:', error);
                    response = this.getFallbackResponse(userMessage);
                }
            }
            // 3. Use fallback AI
            else {
                response = this.getFallbackResponse(userMessage);
            }
            
            await this.delay(800 + Math.random() * 1200); // Realistic thinking time
            this.hideTyping();
            this.addMessage(response);
            
        } catch (error) {
            console.error('AI Response Error:', error);
            this.hideTyping();
            this.addMessage('I apologize, but I\'m having trouble right now. Please try again or contact our support team for assistance.');
        }
    }
    
    async callOpenAI(message) {
        if (!this.options.openaiApiKey) {
            throw new Error('No OpenAI API key configured');
        }
        
        const systemPrompt = `You are an AI assistant for Andrew Cares Village, a completely FREE learning and community platform. Comprehensive platform information:

PLATFORM OVERVIEW:
- 100% FREE learning platform with no subscriptions, hidden fees, or premium tiers
- Mission: Democratized education and meaningful mentor-learner connections
- Community-driven learning environment with transparent business practices

CORE FEATURES:
1. FREE COURSES & RESOURCES: Comprehensive course library, self-paced learning, interactive content, progress tracking, certificates, community discussions - all completely free
2. MENTORSHIP MARKETPLACE: Connect with experienced mentors, browse profiles/rates, book 1-on-1 sessions, mentors set own pricing, 10% platform commission
3. COMMUNITY FEATURES: User profiles, discussion forums, peer learning, events, workshops, resource sharing
4. THE DOJO (Training Center): Specialized training programs, skill development workshops, practical exercises, expert-led sessions, career development

BUSINESS MODEL:
- Revenue: 10% commission on mentorship sessions + voluntary donations only
- All educational content permanently free
- Transparent pricing with no hidden costs
- Commission helps maintain servers, development, support

COURSE CATEGORIES: Technology/Programming, Business/Entrepreneurship, Creative Arts/Design, Personal Development, Academic Subjects, Professional Skills, Health/Wellness, Language Learning

BECOMING INSTRUCTOR/MENTOR:
- Requirements: Demonstrated expertise, professional background, teaching ability
- Process: Application form, credentials review, portfolio submission, admin approval
- Benefits: Earn income sharing knowledge, set own rates/schedule, build reputation, access instructor resources

SUPPORT SYSTEM: 24/7 AI chat support, comprehensive FAQ, community forums, direct admin contact, technical support, mentorship guidance

Be helpful, detailed, and always emphasize the completely free nature of all platform features.`;
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.options.openaiApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: this.options.openaiModel,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: message }
                ],
                max_tokens: 200,
                temperature: 0.7
            })
        });
        
        if (!response.ok) {
            throw new Error(`OpenAI API request failed: ${response.status}`);
        }
        
        const data = await response.json();
        return data.choices[0]?.message?.content || 'I couldn\'t generate a response.';
    }
    
    getFallbackResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // Platform Overview & Mission
        if (lowerMessage.includes('about') || lowerMessage.includes('what is') || lowerMessage.includes('platform') || lowerMessage.includes('mission')) {
            return 'Andrew Cares Village is a completely FREE learning and community platform with a mission to democratize education for everyone. We provide accessible education and create meaningful connections between learners and mentors. Our platform features comprehensive courses, mentorship marketplace, community forums, and The Dojo training center - all completely free with transparent business practices based on voluntary donations and a 10% mentorship commission.';
        }
        
        // Free Courses & Learning Resources
        if (lowerMessage.includes('course') || lowerMessage.includes('learn') || lowerMessage.includes('class') || lowerMessage.includes('education') || lowerMessage.includes('library') || lowerMessage.includes('resource')) {
            return 'All courses and learning resources are completely FREE! Our comprehensive course library covers Technology/Programming, Business/Entrepreneurship, Creative Arts/Design, Personal Development, Academic Subjects, Professional Skills, Health/Wellness, and Language Learning. Features include self-paced learning, interactive content, progress tracking, certificates, and community discussions. Visit "The Village Library" for educational resources - no payments, subscriptions, or hidden fees ever!';
        }
        
        // The Dojo Training Center
        if (lowerMessage.includes('dojo') || lowerMessage.includes('training') || lowerMessage.includes('workshop') || lowerMessage.includes('skill development')) {
            return 'The Dojo is our specialized training center offering advanced skill development workshops, practical exercises and projects, expert-led sessions, and career development resources. All Dojo content is completely FREE and focuses on hands-on learning experiences to help you master new skills and advance your career.';
        }
        
        // Mentorship Marketplace
        if (lowerMessage.includes('mentor') || lowerMessage.includes('guidance') || lowerMessage.includes('advice') || lowerMessage.includes('1-on-1') || lowerMessage.includes('session')) {
            return 'Our mentorship marketplace connects students with experienced mentors across various fields. While all platform resources are FREE, mentors set their own rates for personalized 1-on-1 sessions. Browse mentor profiles, specialties, rates, and reviews. Book sessions directly through our integrated calendar system. We take a 10% commission to maintain the platform and keep all other features free for everyone.';
        }
        
        // Becoming Instructor/Mentor - Detailed Process
        if (lowerMessage.includes('instructor') || lowerMessage.includes('teach') || lowerMessage.includes('become') || lowerMessage.includes('apply') || lowerMessage.includes('join as') || lowerMessage.includes('mentor application')) {
            return 'Anyone with sufficient experience can become an instructor or mentor! Requirements: demonstrated expertise in your field, professional/educational background, and effective teaching ability. Application process: complete instructor application form, provide credentials and experience details, submit portfolio/work examples, undergo admin review. Once approved: earn income sharing knowledge, set your own rates and schedule, build professional reputation, connect with motivated learners, access instructor resources, and join our community of educators.';
        }
        
        // Pricing Model & Business Transparency
        if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('fee') || lowerMessage.includes('free') || lowerMessage.includes('money') || lowerMessage.includes('pay') || lowerMessage.includes('business model')) {
            return 'Andrew Cares Village is 100% FREE! All courses, platform features, community access, and learning materials are permanently free. Our transparent business model: Revenue comes only from 10% commission on mentorship sessions and voluntary donations. No subscriptions, premium tiers, or hidden costs. The commission helps maintain servers, development, and support while keeping all educational content free for everyone.';
        }
        
        // Donations & Platform Support
        if (lowerMessage.includes('donate') || lowerMessage.includes('donation') || lowerMessage.includes('support') || lowerMessage.includes('contribute') || lowerMessage.includes('funding')) {
            return 'Donations are completely voluntary and help maintain our free platform for everyone. Donations support platform maintenance, server costs, development of new features, and keeping all educational content free. We use secure payment processing through Paystack with transparent use of funds. Every contribution helps us continue our mission of democratized education and keeps the platform accessible to all learners worldwide.';
        }
        
        // Registration & Getting Started
        if (lowerMessage.includes('sign up') || lowerMessage.includes('register') || lowerMessage.includes('join') || lowerMessage.includes('account') || lowerMessage.includes('start') || lowerMessage.includes('getting started')) {
            return 'Getting started is completely FREE and easy! Steps: 1) Create free account, 2) Complete profile with interests/goals, 3) Browse available courses and start learning, 4) Join community discussions and forums, 5) Connect with mentors for personalized guidance, 6) Contribute to community through participation. No credit card required, no trials, no commitments - just pure learning!';
        }
        
        // Community Features & Forums
        if (lowerMessage.includes('community') || lowerMessage.includes('village square') || lowerMessage.includes('social') || lowerMessage.includes('connect') || lowerMessage.includes('forum') || lowerMessage.includes('discussion')) {
            return 'Our community features are all FREE! Village Square offers networking, discussion forums, peer-to-peer learning, events and workshops, resource sharing and collaboration. Join respectful and inclusive discussions, get constructive feedback, share knowledge, maintain professional conduct, and commit to lifelong learning. Build meaningful relationships with fellow learners and experts in a supportive environment.';
        }
        
        // Technical Features & Platform Capabilities
        if (lowerMessage.includes('technical') || lowerMessage.includes('mobile') || lowerMessage.includes('device') || lowerMessage.includes('security') || lowerMessage.includes('data')) {
            return 'Our platform features responsive design for all devices, secure user authentication and data protection, integrated payment processing for mentorship, real-time chat and messaging systems, progress tracking and analytics, and mobile-friendly interface. We use industry-standard security measures to protect user data and ensure privacy. All payments are processed securely through trusted providers.';
        }
        
        // Support System & Help
        if (lowerMessage.includes('help') || lowerMessage.includes('support') || lowerMessage.includes('contact') || lowerMessage.includes('assistance') || lowerMessage.includes('problem')) {
            return 'We offer comprehensive support: 24/7 AI-powered chat support (that\'s me!), extensive FAQ section, community forums for peer support, direct contact with platform administrators, technical support for platform issues, and mentorship guidance with best practices. Our community guidelines ensure a respectful, inclusive environment with zero tolerance for harassment or discrimination.';
        }
        
        // Course Categories & Subjects
        if (lowerMessage.includes('subject') || lowerMessage.includes('category') || lowerMessage.includes('technology') || lowerMessage.includes('business') || lowerMessage.includes('creative') || lowerMessage.includes('personal development') || lowerMessage.includes('programming')) {
            return 'Our comprehensive course categories include: Technology and Programming (coding, software development, IT skills), Business and Entrepreneurship (startup guidance, management, marketing), Creative Arts and Design (graphic design, writing, multimedia), Personal Development (life skills, productivity, wellness), Academic Subjects (mathematics, sciences, humanities), Professional Skills (communication, leadership, project management), Health and Wellness (fitness, nutrition, mental health), and Language Learning (multiple languages and cultures).';
        }
        
        // Default comprehensive response
        return `I understand you're asking about "${message}". Andrew Cares Village offers: FREE comprehensive courses across 8+ categories, mentorship marketplace with expert connections, community forums and networking, The Dojo training center, 24/7 support, and transparent business model. Everything is free except optional mentorship sessions (mentors set rates, 10% platform commission). Feel free to ask about specific features, becoming an instructor, course subjects, community guidelines, or technical capabilities!`;
    }
    
    // Learning mechanism methods
    saveLearning(question, answer, source) {
        const key = question.toLowerCase().trim();
        this.learningDatabase[key] = {
            answer: answer,
            source: source,
            timestamp: Date.now(),
            useCount: (this.learningDatabase[key]?.useCount || 0) + 1
        };
        localStorage.setItem('aiLearningDB', JSON.stringify(this.learningDatabase));
    }
    
    getLearnedResponse(question) {
        const key = question.toLowerCase().trim();
        const learned = this.learningDatabase[key];
        if (learned) {
            learned.useCount++;
            this.saveLearning(question, learned.answer, learned.source);
            return learned.answer;
        }
        
        // Try partial matches
        for (const [learnedKey, data] of Object.entries(this.learningDatabase)) {
            if (question.toLowerCase().includes(learnedKey) || learnedKey.includes(question.toLowerCase())) {
                return data.answer;
            }
        }
        
        return null;
    }
    
    loadLearningDatabase() {
        try {
            const stored = localStorage.getItem('aiLearningDB');
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            console.warn('Error loading learning database:', error);
            return {};
        }
    }
    
    // Usage tracking methods
    getUsageCount() {
        const currentMonth = new Date().getMonth();
        const storedMonth = localStorage.getItem('aiUsageMonth');
        const storedCount = localStorage.getItem('aiUsageCount');
        
        if (parseInt(storedMonth) !== currentMonth) {
            localStorage.setItem('aiUsageMonth', currentMonth.toString());
            localStorage.setItem('aiUsageCount', '0');
            return 0;
        }
        
        return parseInt(storedCount) || 0;
    }
    
    updateUsageCount() {
        this.smartAIUsage++;
        localStorage.setItem('aiUsageCount', this.smartAIUsage.toString());
    }
    
    // Conversation history methods
    loadConversationHistory() {
        try {
            const stored = localStorage.getItem('aiConversationHistory');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.warn('Error loading conversation history:', error);
            return [];
        }
    }
    
    saveConversationHistory() {
        // Keep only last 50 messages to prevent storage bloat
        if (this.conversationHistory.length > 50) {
            this.conversationHistory = this.conversationHistory.slice(-50);
        }
        localStorage.setItem('aiConversationHistory', JSON.stringify(this.conversationHistory));
    }
    
    // Utility methods
    scrollToBottom() {
        setTimeout(() => {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }, 100);
    }
    
    hideNotificationBadge() {
        const badge = document.getElementById('chat-notification');
        if (badge) {
            badge.style.display = 'none';
        }
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the chat widget
(function() {
    'use strict';
    
    function initializeChat() {
        // Prevent multiple instances
        if (window.hybridAIChat) return;
        
        // Initialize with default configuration
        window.hybridAIChat = new HybridAIChatWidget({
            // Add your OpenAI API key here for enhanced responses
            openaiApiKey: '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',
            monthlyLimit: 50,
            openaiModel: 'gpt-3.5-turbo'
        });
        
        console.log('🚀 Advanced Hybrid AI Chat System Active!');
        console.log('💡 To enable OpenAI integration:');
        console.log('   1. Get free $5 credit at platform.openai.com');
        console.log('   2. Add: openaiApiKey: "sk-your-key" to configuration');
        console.log('   3. Current system works unlimited with built-in AI');
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeChat);
    } else {
        initializeChat();
    }
})();
