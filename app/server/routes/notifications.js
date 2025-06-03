// routes/notifications.js
const express = require('express');
const router = express.Router();

let notifications = [];

router.get('/notifications', (req, res) => {
    res.json(notifications);
});

router.post('/notifications', (req, res) => {
    const { message } = req.body;
    const notification = { id: Date.now(), message, seen: false };
    notifications.push(notification);

    // Emit the notification event to all connected clients
    req.app.get('io').emit('notification', notification);

    res.status(201).json(notification);
});

router.post('/notifications/:id/seen', (req, res) => {
    const { id } = req.params;
    const notification = notifications.find(notif => notif.id === parseInt(id));
    if (notification) {
        notification.seen = true;
        res.json(notification);
    } else {
        res.status(404).json({ message: 'Notification not found' });
    }
});

// DELETE /notifications/:id - Delete a notification
router.delete('/notifications/:id', (req, res) => {
    const { id } = req.params;
    const index = notifications.findIndex(notif => notif.id === parseInt(id));
    if (index !== -1) {
        const deletedNotification = notifications.splice(index, 1)[0];

        // Emit the notification_deleted event to all connected clients
        req.app.get('io').emit('notification_deleted', deletedNotification);

        res.status(204).send(); // No content
    } else {
        res.status(404).json({ message: 'Notification not found' });
    }
});

module.exports = router;
