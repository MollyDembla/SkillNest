const express = require('express');
const { getProfile, updateProfile, changePassword, getPublicProfile } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);
router.get('/:userId/public', getPublicProfile);

module.exports = router;
