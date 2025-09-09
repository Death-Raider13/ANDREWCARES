// Comprehensive Notification Service for Andrew Cares Village
// Handles all notification types: mentions, comments, likes, admin actions, instructor activities

class NotificationService {
    constructor() {
        this.db = null;
        this.auth = null;
        this.currentUser = null;
        this.unsubscribeListeners = [];
        this.notificationTypes = {
            // User interactions
            MENTION: 'mention',
            COMMENT: 'comment', 
            LIKE: 'like',
            REPLY: 'reply',
            SHARE: 'share',
            
            // Admin notifications
            ADMIN_NEW_RESOURCE: 'admin_new_resource',
            ADMIN_LIVESTREAM: 'admin_livestream',
            INSTRUCTOR_APPLICATION_APPROVED: 'instructor_approved',
            INSTRUCTOR_APPLICATION_REJECTED: 'instructor_rejected',
            ADMIN_ANNOUNCEMENT: 'admin_announcement',
            
            // Instructor notifications
            INSTRUCTOR_BOOKING_ACCEPTED: 'booking_accepted',
            INSTRUCTOR_BOOKING_REJECTED: 'booking_rejected',
            INSTRUCTOR_NEW_COURSE: 'instructor_new_course',
            INSTRUCTOR_QUIZ_CREATED: 'instructor_quiz_created',
            INSTRUCTOR_LIVESTREAM: 'instructor_livestream',
            INSTRUCTOR_AGREEMENT_SIGNED: 'instructor_agreement_signed',
            STUDENT_PAYMENT_RECEIVED: 'student_payment_received',
            STUDENT_AGREEMENT_PENDING: 'student_agreement_pending',
            
            // General system notifications
            SYSTEM_UPDATE: 'system_update',
            MEMBERSHIP_UPDATED: 'membership_updated',
            COURSE_ENROLLMENT: 'course_enrollment'
        };
    }

    // Initialize the notification service
    async initialize(firebaseAuth, firebaseDb) {
        this.auth = firebaseAuth;
        this.db = firebaseDb;
        
        // Listen for auth state changes
        this.auth.onAuthStateChanged((user) => {
            if (user) {
                this.currentUser = user;
                this.setupNotificationListener();
            } else {
                this.cleanup();
            }
        });
    }

    // Setup real-time notification listener
    setupNotificationListener() {
        if (!this.currentUser || !this.db) return;

        const { onSnapshot, collection, query, where, orderBy, limit } = window.firebase.firestore;
        
        // Listen for notifications for current user
        const notificationsRef = collection(this.db, 'notifications');
        const q = query(
            notificationsRef,
            where('recipientId', '==', this.currentUser.uid),
            orderBy('createdAt', 'desc'),
            limit(50)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notifications = [];
            snapshot.forEach((doc) => {
                notifications.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            this.updateNotificationUI(notifications);
        }, (error) => {
            console.error('Error listening to notifications:', error);
        });

        this.unsubscribeListeners.push(unsubscribe);
    }

    // Create a new notification
    async createNotification(recipientId, type, data) {
        if (!this.db || !this.currentUser) return;

        const { addDoc, collection, serverTimestamp } = window.firebase.firestore;

        const notification = {
            recipientId: recipientId,
            senderId: this.currentUser.uid,
            type: type,
            title: this.getNotificationTitle(type, data),
            message: this.getNotificationMessage(type, data),
            data: data,
            read: false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        try {
            await addDoc(collection(this.db, 'notifications'), notification);
            console.log('Notification created successfully');
        } catch (error) {
            console.error('Error creating notification:', error);
        }
    }

    // Bulk create notifications (for admin announcements)
    async createBulkNotifications(recipientIds, type, data) {
        const promises = recipientIds.map(recipientId => 
            this.createNotification(recipientId, type, data)
        );
        
        try {
            await Promise.all(promises);
            console.log('Bulk notifications created successfully');
        } catch (error) {
            console.error('Error creating bulk notifications:', error);
        }
    }

    // Get notification title based on type
    getNotificationTitle(type, data) {
        switch (type) {
            case this.notificationTypes.MENTION:
                return 'You were mentioned';
            case this.notificationTypes.COMMENT:
                return 'New comment on your post';
            case this.notificationTypes.LIKE:
                return 'Someone liked your post';
            case this.notificationTypes.REPLY:
                return 'New reply to your comment';
            case this.notificationTypes.SHARE:
                return 'Your post was shared';
            case this.notificationTypes.ADMIN_NEW_RESOURCE:
                return 'New Resource Available';
            case this.notificationTypes.ADMIN_LIVESTREAM:
                return 'Live Stream Starting Soon';
            case this.notificationTypes.INSTRUCTOR_APPLICATION_APPROVED:
                return 'Instructor Application Approved';
            case this.notificationTypes.INSTRUCTOR_APPLICATION_REJECTED:
                return 'Instructor Application Update';
            case this.notificationTypes.INSTRUCTOR_BOOKING_ACCEPTED:
                return 'Booking Accepted';
            case this.notificationTypes.INSTRUCTOR_BOOKING_REJECTED:
                return 'Booking Update';
            case this.notificationTypes.INSTRUCTOR_NEW_COURSE:
                return 'New Course Available';
            case this.notificationTypes.INSTRUCTOR_QUIZ_CREATED:
                return 'New Quiz Available';
            case this.notificationTypes.INSTRUCTOR_LIVESTREAM:
                return 'Instructor Live Stream';
            case this.notificationTypes.STUDENT_PAYMENT_RECEIVED:
                return 'Payment Received - Time to Create Course';
            case this.notificationTypes.STUDENT_AGREEMENT_PENDING:
                return 'Student Agreement Pending';
            case this.notificationTypes.INSTRUCTOR_AGREEMENT_SIGNED:
                return 'Agreement Signed Successfully';
            default:
                return 'New Notification';
        }
    }

    // Get notification message based on type
    getNotificationMessage(type, data) {
        switch (type) {
            case this.notificationTypes.MENTION:
                return `${data.senderName} mentioned you in a post`;
            case this.notificationTypes.COMMENT:
                return `${data.senderName} commented on your post`;
            case this.notificationTypes.LIKE:
                return `${data.senderName} liked your post`;
            case this.notificationTypes.REPLY:
                return `${data.senderName} replied to your comment`;
            case this.notificationTypes.SHARE:
                return `${data.senderName} shared your post`;
            case this.notificationTypes.ADMIN_NEW_RESOURCE:
                return `A new resource "${data.resourceTitle}" has been added to the library`;
            case this.notificationTypes.ADMIN_LIVESTREAM:
                return `Admin is starting a live stream: "${data.streamTitle}"`;
            case this.notificationTypes.INSTRUCTOR_APPLICATION_APPROVED:
                return 'Congratulations! Your instructor application has been approved. Please check your email for further details.';
            case this.notificationTypes.INSTRUCTOR_APPLICATION_REJECTED:
                return 'Your instructor application has been updated. Please check your email for further details.';
            case this.notificationTypes.INSTRUCTOR_BOOKING_ACCEPTED:
                return `Your booking for "${data.sessionTitle}" has been accepted by the instructor`;
            case this.notificationTypes.INSTRUCTOR_BOOKING_REJECTED:
                return `Your booking for "${data.sessionTitle}" has been updated. Please check for details.`;
            case this.notificationTypes.INSTRUCTOR_NEW_COURSE:
                return `${data.instructorName} has created a new course: "${data.courseTitle}"`;
            case this.notificationTypes.INSTRUCTOR_QUIZ_CREATED:
                return `New quiz available: "${data.quizTitle}" by ${data.instructorName}`;
            case this.notificationTypes.INSTRUCTOR_LIVESTREAM:
                return `${data.instructorName} is starting a live stream: "${data.streamTitle}"`;
            case this.notificationTypes.STUDENT_PAYMENT_RECEIVED:
                return `Payment received from ${data.studentName} for "${data.sessionTitle}". Time to create the course content!`;
            case this.notificationTypes.STUDENT_AGREEMENT_PENDING:
                return `${data.studentName} is waiting for you to sign the agreement for "${data.sessionTitle}"`;
            case this.notificationTypes.INSTRUCTOR_AGREEMENT_SIGNED:
                return `Agreement for "${data.sessionTitle}" has been signed successfully`;
            default:
                return 'You have a new notification';
        }
    }

    // Update notification UI
    updateNotificationUI(notifications) {
        const unreadNotifications = notifications.filter(n => !n.read);
        const unreadCount = unreadNotifications.length;

        // Update notification badge
        this.updateNotificationBadge(unreadCount);
        
        // Update notification list
        this.updateNotificationList(notifications);
        
        // Show toast for new notifications (only for very recent ones)
        const recentNotifications = notifications.filter(n => 
            !n.read && n.createdAt && this.isRecentNotification(n.createdAt)
        );
        
        recentNotifications.forEach(notification => {
            this.showNotificationToast(notification);
        });
    }

    // Update notification badge count
    updateNotificationBadge(count) {
        const badges = [
            document.getElementById('notificationBadge'),
            document.getElementById('mobileNotificationBadge')
        ];

        badges.forEach(badge => {
            if (badge) {
                if (count > 0) {
                    badge.textContent = count > 99 ? '99+' : count.toString();
                    badge.style.display = 'flex';
                } else {
                    badge.style.display = 'none';
                }
            }
        });
    }

    // Update notification list in UI
    updateNotificationList(notifications) {
        const lists = [
            document.getElementById('notificationList'),
            document.getElementById('mobileNotificationList')
        ];

        lists.forEach(list => {
            if (list) {
                if (notifications.length === 0) {
                    list.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--text-secondary);">No notifications yet</div>';
                } else {
                    list.innerHTML = notifications.map(notification => 
                        this.createNotificationHTML(notification)
                    ).join('');
                }
            }
        });
    }

    // Create HTML for a single notification
    createNotificationHTML(notification) {
        const timeAgo = this.getTimeAgo(notification.createdAt);
        const typeIcon = this.getNotificationIcon(notification.type);
        const unreadClass = notification.read ? '' : 'unread';

        return `
            <div class="notification-item ${unreadClass}" data-notification-id="${notification.id}">
                <div class="notification-avatar">
                    <i class="fas ${typeIcon}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-text">
                        <strong>${notification.title}</strong><br>
                        ${notification.message}
                    </div>
                    <div class="notification-time">${timeAgo}</div>
                </div>
                <div class="notification-type-icon ${notification.type}">
                    <i class="fas ${typeIcon}"></i>
                </div>
            </div>
        `;
    }

    // Get icon for notification type
    getNotificationIcon(type) {
        const iconMap = {
            [this.notificationTypes.MENTION]: 'fa-at',
            [this.notificationTypes.COMMENT]: 'fa-comment',
            [this.notificationTypes.LIKE]: 'fa-heart',
            [this.notificationTypes.REPLY]: 'fa-reply',
            [this.notificationTypes.SHARE]: 'fa-share',
            [this.notificationTypes.ADMIN_NEW_RESOURCE]: 'fa-book',
            [this.notificationTypes.ADMIN_LIVESTREAM]: 'fa-video',
            [this.notificationTypes.INSTRUCTOR_APPLICATION_APPROVED]: 'fa-check-circle',
            [this.notificationTypes.INSTRUCTOR_APPLICATION_REJECTED]: 'fa-info-circle',
            [this.notificationTypes.INSTRUCTOR_BOOKING_ACCEPTED]: 'fa-calendar-check',
            [this.notificationTypes.INSTRUCTOR_BOOKING_REJECTED]: 'fa-calendar-times',
            [this.notificationTypes.INSTRUCTOR_NEW_COURSE]: 'fa-graduation-cap',
            [this.notificationTypes.INSTRUCTOR_QUIZ_CREATED]: 'fa-question-circle',
            [this.notificationTypes.INSTRUCTOR_LIVESTREAM]: 'fa-broadcast-tower',
            [this.notificationTypes.STUDENT_PAYMENT_RECEIVED]: 'fa-dollar-sign',
            [this.notificationTypes.STUDENT_AGREEMENT_PENDING]: 'fa-file-contract',
            [this.notificationTypes.INSTRUCTOR_AGREEMENT_SIGNED]: 'fa-file-signature'
        };

        return iconMap[type] || 'fa-bell';
    }

    // Mark notification as read
    async markAsRead(notificationId) {
        if (!this.db) return;

        const { doc, updateDoc } = window.firebase.firestore;

        try {
            await updateDoc(doc(this.db, 'notifications', notificationId), {
                read: true,
                updatedAt: window.firebase.firestore.serverTimestamp()
            });
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }

    // Mark all notifications as read
    async markAllAsRead() {
        if (!this.db || !this.currentUser) return;

        const { collection, query, where, getDocs, writeBatch, doc } = window.firebase.firestore;

        try {
            const notificationsRef = collection(this.db, 'notifications');
            const q = query(
                notificationsRef,
                where('recipientId', '==', this.currentUser.uid),
                where('read', '==', false)
            );

            const snapshot = await getDocs(q);
            const batch = writeBatch(this.db);

            snapshot.forEach((docSnapshot) => {
                batch.update(doc(this.db, 'notifications', docSnapshot.id), {
                    read: true,
                    updatedAt: window.firebase.firestore.serverTimestamp()
                });
            });

            await batch.commit();
            console.log('All notifications marked as read');
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    }

    // Show notification toast
    showNotificationToast(notification) {
        // Only show toast for very recent notifications (within last 30 seconds)
        if (!this.isRecentNotification(notification.createdAt, 30000)) return;

        const toast = document.createElement('div');
        toast.className = 'notification-toast';
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas ${this.getNotificationIcon(notification.type)}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-title">${notification.title}</div>
                <div class="toast-message">${notification.message}</div>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Add toast styles
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 1rem;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            max-width: 350px;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            animation: slideInRight 0.3s ease;
        `;

        document.body.appendChild(toast);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => toast.remove(), 300);
            }
        }, 5000);
    }

    // Check if notification is recent
    isRecentNotification(timestamp, maxAge = 60000) { // Default 1 minute
        if (!timestamp) return false;
        
        const notificationTime = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        return (now - notificationTime) < maxAge;
    }

    // Get time ago string
    getTimeAgo(timestamp) {
        if (!timestamp) return 'Just now';
        
        const notificationTime = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diffMs = now - notificationTime;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return notificationTime.toLocaleDateString();
    }

    // Cleanup listeners
    cleanup() {
        this.unsubscribeListeners.forEach(unsubscribe => unsubscribe());
        this.unsubscribeListeners = [];
        this.currentUser = null;
    }

    // Specific notification creation methods for different scenarios

    // User interaction notifications
    async notifyMention(mentionedUserId, postId, postContent) {
        await this.createNotification(mentionedUserId, this.notificationTypes.MENTION, {
            senderName: this.currentUser.displayName || 'Someone',
            postId: postId,
            postContent: postContent.substring(0, 100) + '...'
        });
    }

    async notifyComment(postOwnerId, postId, commentContent) {
        if (postOwnerId === this.currentUser.uid) return; // Don't notify self
        
        await this.createNotification(postOwnerId, this.notificationTypes.COMMENT, {
            senderName: this.currentUser.displayName || 'Someone',
            postId: postId,
            commentContent: commentContent.substring(0, 100) + '...'
        });
    }

    async notifyLike(postOwnerId, postId) {
        if (postOwnerId === this.currentUser.uid) return; // Don't notify self
        
        await this.createNotification(postOwnerId, this.notificationTypes.LIKE, {
            senderName: this.currentUser.displayName || 'Someone',
            postId: postId
        });
    }

    // Admin notifications
    async notifyNewResource(resourceTitle, resourceId) {
        // Get all users to notify
        const { collection, getDocs } = window.firebase.firestore;
        const usersSnapshot = await getDocs(collection(this.db, 'users'));
        const userIds = [];
        
        usersSnapshot.forEach(doc => {
            if (doc.id !== this.currentUser.uid) { // Don't notify admin
                userIds.push(doc.id);
            }
        });

        await this.createBulkNotifications(userIds, this.notificationTypes.ADMIN_NEW_RESOURCE, {
            resourceTitle: resourceTitle,
            resourceId: resourceId
        });
    }

    async notifyLivestream(streamTitle, streamId, targetAudience = 'all') {
        // Get target users based on audience
        const { collection, getDocs, query, where } = window.firebase.firestore;
        let usersQuery = collection(this.db, 'users');
        
        if (targetAudience !== 'all') {
            usersQuery = query(usersQuery, where('role', '==', targetAudience));
        }
        
        const usersSnapshot = await getDocs(usersQuery);
        const userIds = [];
        
        usersSnapshot.forEach(doc => {
            if (doc.id !== this.currentUser.uid) {
                userIds.push(doc.id);
            }
        });

        const notificationType = this.currentUser.role === 'admin' ? 
            this.notificationTypes.ADMIN_LIVESTREAM : 
            this.notificationTypes.INSTRUCTOR_LIVESTREAM;

        await this.createBulkNotifications(userIds, notificationType, {
            streamTitle: streamTitle,
            streamId: streamId,
            instructorName: this.currentUser.displayName || 'Instructor'
        });
    }

    async notifyInstructorApplicationStatus(applicantId, approved) {
        const notificationType = approved ? 
            this.notificationTypes.INSTRUCTOR_APPLICATION_APPROVED : 
            this.notificationTypes.INSTRUCTOR_APPLICATION_REJECTED;

        await this.createNotification(applicantId, notificationType, {
            approved: approved
        });
    }

    // Instructor notifications
    async notifyPaymentReceived(instructorId, studentName, sessionTitle, amount) {
        await this.createNotification(instructorId, this.notificationTypes.STUDENT_PAYMENT_RECEIVED, {
            studentName: studentName,
            sessionTitle: sessionTitle,
            amount: amount
        });
    }

    async notifyBookingStatus(studentId, sessionTitle, accepted) {
        const notificationType = accepted ? 
            this.notificationTypes.INSTRUCTOR_BOOKING_ACCEPTED : 
            this.notificationTypes.INSTRUCTOR_BOOKING_REJECTED;

        await this.createNotification(studentId, notificationType, {
            sessionTitle: sessionTitle,
            accepted: accepted
        });
    }

    async notifyNewCourse(courseTitle, courseId, instructorName) {
        // Notify all students
        const { collection, getDocs, query, where } = window.firebase.firestore;
        const usersQuery = query(collection(this.db, 'users'), where('role', '==', 'user'));
        const usersSnapshot = await getDocs(usersQuery);
        const userIds = [];
        
        usersSnapshot.forEach(doc => {
            userIds.push(doc.id);
        });

        await this.createBulkNotifications(userIds, this.notificationTypes.INSTRUCTOR_NEW_COURSE, {
            courseTitle: courseTitle,
            courseId: courseId,
            instructorName: instructorName
        });
    }

    async notifyAgreementSigned(recipientId, sessionTitle) {
        await this.createNotification(recipientId, this.notificationTypes.INSTRUCTOR_AGREEMENT_SIGNED, {
            sessionTitle: sessionTitle
        });
    }

    async notifyAgreementPending(instructorId, studentName, sessionTitle) {
        await this.createNotification(instructorId, this.notificationTypes.STUDENT_AGREEMENT_PENDING, {
            studentName: studentName,
            sessionTitle: sessionTitle
        });
    }
}

// Export for use in other files
window.NotificationService = NotificationService;
