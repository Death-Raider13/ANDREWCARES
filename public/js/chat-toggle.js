// Toggle conversation list functionality
function toggleConversationList() {
    const conversationList = document.getElementById('sidebarConversations');
    if (conversationList) {
        conversationList.classList.toggle('expanded');
    }
}

// Auto-collapse conversation list when chat is opened
function autoCollapseConversations() {
    const conversationList = document.getElementById('sidebarConversations');
    if (conversationList && conversationList.classList.contains('expanded')) {
        conversationList.classList.remove('expanded');
    }
}
