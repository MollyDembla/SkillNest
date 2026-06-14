const connectDB = require("../config/db");
const mongoose = require("mongoose");
const Course = require("../models/Course");
const User = require("../models/User");

(async () => {
  try {
    await connectDB();

    // Find any user to be the instructor; fallback to creating one
    let instructor = await User.findOne({ role: "instructor" });
    if (!instructor) {
      instructor = await User.create({
        name: "Instructor One",
        email: "instructor1@example.com",
        password: "password123",
        role: "instructor",
      });
      console.log("Created instructor:", instructor._id.toString());
    }

    const course = await Course.create({
      title: "Sample Course for Testing",
      subtitle: "A test course",
      description:
        "This is a sample published course used for integration testing.",
      category: "Testing",
      level: "all",
      price: 19.99,
      status: "published",
      instructor: instructor._id,
    });

    console.log("Created course:", course._id.toString());
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
