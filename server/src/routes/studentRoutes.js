const express = require('express');
const { getDashboard } = require('../controllers/studentController');
const { protect } = require('../middlewares/authMiddleware');
const { restrictTo } = require('../middlewares/roleMiddleware');

const router = express.Router();

router.use(protect);
router.use(restrictTo('student'));

router.get('/dashboard', getDashboard);

module.exports = router;
