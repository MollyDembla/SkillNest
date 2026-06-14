const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { restrictTo } = require("../middlewares/roleMiddleware");
const wishlistController = require("../controllers/wishlistController");

router.use(protect);
router.use(restrictTo("student"));

router.get("/", wishlistController.getWishlist);
router.post("/items", wishlistController.addToWishlist);
router.delete("/items/:courseId", wishlistController.removeFromWishlist);
router.delete("/clear", wishlistController.clearWishlist);
router.post("/:courseId/move-to-cart", wishlistController.moveToCart);

module.exports = router;
