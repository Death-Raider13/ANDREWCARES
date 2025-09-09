/**
 * Chat Integration Script for Andrew Cares Village
 * This script automatically adds the AI chat widget to all pages
 */

(function() {
    'use strict';
    
    // Configuration
    const CHAT_CONFIG = {
        title: 'Andrew Cares Assistant',
        welcomeMessage: 'Hello! Welcome to Andrew Cares Village. I\'m here to help you with any questions about our courses, mentorship programs, or community. How can I assist you today?',
        primaryColor: '#6366f1',
        secondaryColor: '#0f172a',
        position: 'bottom-right',
        // Uncomment and configure these for external AI services:
        // apiEndpoint: 'https://your-api-endpoint.com/chat',
        // tidioKey: 'your-tidio-key', // For Tidio integration
        // crispKey: 'your-crisp-key'  // For Crisp integration
    };
    
    // Load the chat widget script
    function loadChatWidget() {
        // Check if already loaded
        if (window.aiChatWidget) {
            return;
        }
        
        // Create script element
        const script = document.createElement('script');
        script.src = '/js/ai-chat-widget.js';
        script.async = true;
        
        // Initialize after loading
        script.onload = function() {
            if (typeof AIChatWidget !== 'undefined') {
                window.aiChatWidget = new AIChatWidget(CHAT_CONFIG);
                console.log('AI Chat Widget loaded successfully');
            }
        };
        
        script.onerror = function() {
            console.error('Failed to load AI Chat Widget');
        };
        
        document.head.appendChild(script);
    }
    
    // Alternative: Load external chat services
    function loadExternalChatService() {
        // Tidio Chat Integration
        if (CHAT_CONFIG.tidioKey) {
            loadTidio(CHAT_CONFIG.tidioKey);
            return;
        }
        
        // Crisp Chat Integration
        if (CHAT_CONFIG.crispKey) {
            loadCrisp(CHAT_CONFIG.crispKey);
            return;
        }
        
        // Default to custom widget
        loadChatWidget();
    }
    
    // Tidio Integration
    function loadTidio(tidioKey) {
        window.tidioChatApi = window.tidioChatApi || {};
        window.tidioChatApi.on = window.tidioChatApi.on || function(e, n) {
            (window.tidioChatApi.events = window.tidioChatApi.events || {})[e] = 
            window.tidioChatApi.events[e] || [];
            window.tidioChatApi.events[e].push(n);
        };
        
        const script = document.createElement('script');
        script.async = true;
        script.src = `//code.tidio.co/${tidioKey}.js`;
        document.head.appendChild(script);
        
        console.log('Tidio Chat loaded');
    }
    
    // Crisp Chat Integration
    function loadCrisp(crispKey) {
        window.$crisp = [];
        window.CRISP_WEBSITE_ID = crispKey;
        
        const script = document.createElement('script');
        script.src = 'https://client.crisp.chat/l.js';
        script.async = true;
        document.head.appendChild(script);
        
        console.log('Crisp Chat loaded');
    }
    
    // Initialize when DOM is ready
    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', loadExternalChatService);
        } else {
            loadExternalChatService();
        }
    }
    
    // Start initialization
    init();
    
})();
