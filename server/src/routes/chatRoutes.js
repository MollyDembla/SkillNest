const express = require('express');
const { getRooms, getOrCreateRoom, getMessages, getUnreadCount } = require('../controllers/chatController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/rooms', getRooms);
router.post('/rooms', getOrCreateRoom);
router.get('/rooms/:roomId/messages', getMessages);
router.get('/unread-count', getUnreadCount);

module.exports = router;
