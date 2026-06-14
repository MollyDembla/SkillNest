const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const Course = require("../models/Course");
const ApiError = require("../utils/apiError");
const ApiResponse = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

const coursePopulateOptions = {
  path: "items",
  select:
    "title slug price thumbnail status instructor averageRating reviewsCount",
};

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }

  return cart;
};

const calculateSummary = (items) => {
  const subtotal = items.reduce(
    (total, course) => total + (course?.price || 0),
    0,
  );

  return {
    itemCount: items.length,
    subtotal,
    total: subtotal,
    currency: "USD",
  };
};

const serializeCart = async (cart) => {
  const populatedCart = await cart.populate(coursePopulateOptions);
  const items = populatedCart.items || [];

  return {
    id: populatedCart._id,
    user: populatedCart.user,
    items,
    summary: calculateSummary(items),
    updatedAt: populatedCart.updatedAt,
  };
};

const getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  const data = await serializeCart(cart);

  res
    .status(200)
    .json(new ApiResponse(200, { cart: data }, "Cart retrieved successfully."));
});

const addToCart = asyncHandler(async (req, res, next) => {
  const { courseId } = req.body;

  if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
    return next(new ApiError(400, "A valid courseId is required."));
  }

  const course = await Course.findOne({ _id: courseId, status: "published" });
  if (!course) {
    return next(new ApiError(404, "Published course not found."));
  }

  const cart = await getOrCreateCart(req.user._id);
  const hasCourse = cart.items.some(
    (item) => item.toString() === courseId.toString(),
  );

  if (!hasCourse) {
    cart.items.push(course._id);
    await cart.save();
  }

  const data = await serializeCart(cart);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { cart: data },
        hasCourse
          ? "Course is already in your cart."
          : "Course added to cart successfully.",
      ),
    );
});

const removeFromCart = asyncHandler(async (req, res, next) => {
  const { courseId } = req.params;

  if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
    return next(new ApiError(400, "A valid courseId parameter is required."));
  }

  const cart = await getOrCreateCart(req.user._id);
  const beforeCount = cart.items.length;
  cart.items = cart.items.filter(
    (item) => item.toString() !== courseId.toString(),
  );

  if (cart.items.length === beforeCount) {
    return next(new ApiError(404, "Course not found in cart."));
  }

  await cart.save();
  const data = await serializeCart(cart);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { cart: data },
        "Course removed from cart successfully.",
      ),
    );
});

const clearCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = [];
  await cart.save();

  const data = await serializeCart(cart);

  res
    .status(200)
    .json(new ApiResponse(200, { cart: data }, "Cart cleared successfully."));
});

const mergeCart = asyncHandler(async (req, res, next) => {
  const rawItems = Array.isArray(req.body.items)
    ? req.body.items
    : Array.isArray(req.body.courseIds)
      ? req.body.courseIds
      : [];

  const uniqueCourseIds = [
    ...new Set(rawItems.map((id) => id.toString())),
  ].filter((id) => mongoose.Types.ObjectId.isValid(id));

  if (!uniqueCourseIds.length) {
    return next(
      new ApiError(
        400,
        "At least one valid courseId is required to merge the cart.",
      ),
    );
  }

  const publishedCourses = await Course.find({
    _id: { $in: uniqueCourseIds },
    status: "published",
  }).select("_id");

  const publishedIds = publishedCourses.map((course) => course._id.toString());
  const cart = await getOrCreateCart(req.user._id);
  const mergedIds = new Set(cart.items.map((item) => item.toString()));

  publishedIds.forEach((id) => mergedIds.add(id));

  cart.items = Array.from(mergedIds);
  await cart.save();

  const data = await serializeCart(cart);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          cart: data,
          skippedCourseIds: uniqueCourseIds.filter(
            (id) => !publishedIds.includes(id),
          ),
        },
        "Cart merged successfully.",
      ),
    );
});

module.exports = {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
  mergeCart,
};
