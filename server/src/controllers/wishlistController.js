const mongoose = require("mongoose");
const Wishlist = require("../models/Wishlist");
const Cart = require("../models/Cart");
const Course = require("../models/Course");
const ApiError = require("../utils/apiError");
const ApiResponse = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

const wishlistPopulateOptions = {
  path: "courses",
  select:
    "title slug price thumbnail status instructor averageRating reviewsCount",
};

const getOrCreateWishlist = async (userId) => {
  let wishlist = await Wishlist.findOne({ user: userId });

  if (!wishlist) {
    wishlist = await Wishlist.create({ user: userId, courses: [] });
  }

  return wishlist;
};

const serializeWishlist = async (wishlist) => {
  const populatedWishlist = await wishlist.populate(wishlistPopulateOptions);

  return {
    id: populatedWishlist._id,
    user: populatedWishlist.user,
    courses: populatedWishlist.courses || [],
    count: populatedWishlist.courses.length,
    updatedAt: populatedWishlist.updatedAt,
  };
};

const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await getOrCreateWishlist(req.user._id);
  const data = await serializeWishlist(wishlist);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { wishlist: data },
        "Wishlist retrieved successfully.",
      ),
    );
});

const addToWishlist = asyncHandler(async (req, res, next) => {
  const { courseId } = req.body;

  if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
    return next(new ApiError(400, "A valid courseId is required."));
  }

  const course = await Course.findOne({ _id: courseId, status: "published" });
  if (!course) {
    return next(new ApiError(404, "Published course not found."));
  }

  const wishlist = await getOrCreateWishlist(req.user._id);
  const hasCourse = wishlist.courses.some(
    (item) => item.toString() === courseId.toString(),
  );

  if (!hasCourse) {
    wishlist.courses.push(course._id);
    await wishlist.save();
  }

  const data = await serializeWishlist(wishlist);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { wishlist: data },
        hasCourse
          ? "Course is already in your wishlist."
          : "Course added to wishlist successfully.",
      ),
    );
});

const removeFromWishlist = asyncHandler(async (req, res, next) => {
  const { courseId } = req.params;

  if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
    return next(new ApiError(400, "A valid courseId parameter is required."));
  }

  const wishlist = await getOrCreateWishlist(req.user._id);
  const beforeCount = wishlist.courses.length;
  wishlist.courses = wishlist.courses.filter(
    (item) => item.toString() !== courseId.toString(),
  );

  if (wishlist.courses.length === beforeCount) {
    return next(new ApiError(404, "Course not found in wishlist."));
  }

  await wishlist.save();
  const data = await serializeWishlist(wishlist);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { wishlist: data },
        "Course removed from wishlist successfully.",
      ),
    );
});

const clearWishlist = asyncHandler(async (req, res) => {
  const wishlist = await getOrCreateWishlist(req.user._id);
  wishlist.courses = [];
  await wishlist.save();

  const data = await serializeWishlist(wishlist);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { wishlist: data },
        "Wishlist cleared successfully.",
      ),
    );
});

const moveToCart = asyncHandler(async (req, res, next) => {
  const { courseId } = req.params;

  if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
    return next(new ApiError(400, "A valid courseId parameter is required."));
  }

  const course = await Course.findOne({
    _id: courseId,
    status: "published",
  }).select("_id");
  if (!course) {
    return next(new ApiError(404, "Published course not found."));
  }

  const wishlist = await getOrCreateWishlist(req.user._id);
  const wasInWishlist = wishlist.courses.some(
    (item) => item.toString() === courseId.toString(),
  );

  if (!wasInWishlist) {
    return next(new ApiError(404, "Course not found in wishlist."));
  }

  wishlist.courses = wishlist.courses.filter(
    (item) => item.toString() !== courseId.toString(),
  );

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  const alreadyInCart = cart.items.some(
    (item) => item.toString() === courseId.toString(),
  );
  if (!alreadyInCart) {
    cart.items.push(course._id);
  }

  await Promise.all([wishlist.save(), cart.save()]);

  const serializedWishlist = await serializeWishlist(wishlist);
  const populatedCart = await cart.populate({
    path: "items",
    select:
      "title slug price thumbnail status instructor averageRating reviewsCount",
  });
  const cartItems = populatedCart.items || [];
  const serializedCart = {
    id: populatedCart._id,
    user: populatedCart.user,
    items: cartItems,
    summary: {
      itemCount: cartItems.length,
      subtotal: cartItems.reduce(
        (total, item) => total + (item?.price || 0),
        0,
      ),
      total: cartItems.reduce((total, item) => total + (item?.price || 0), 0),
      currency: "USD",
    },
    updatedAt: populatedCart.updatedAt,
  };

  res.status(200).json(
    new ApiResponse(
      200,
      {
        wishlist: serializedWishlist,
        cart: serializedCart,
      },
      alreadyInCart
        ? "Course removed from wishlist and was already present in cart."
        : "Course moved from wishlist to cart successfully.",
    ),
  );
});

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  moveToCart,
};
