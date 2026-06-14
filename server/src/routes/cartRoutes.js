const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { restrictTo } = require("../middlewares/roleMiddleware");
const cartController = require("../controllers/cartController");

router.use(protect);
router.use(restrictTo("student"));

router.get("/", cartController.getCart);
router.post("/items", cartController.addToCart);
router.delete("/items/:courseId", cartController.removeFromCart);
router.delete("/clear", cartController.clearCart);
router.post("/merge", cartController.mergeCart);

module.exports = router;
