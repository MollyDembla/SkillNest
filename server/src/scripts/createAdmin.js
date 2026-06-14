/**
 * Creates or updates an admin user.
 * Usage:
 *   node src/scripts/createAdmin.js
 *   node src/scripts/createAdmin.js admin@example.com MyPassword123
 *
 * Falls back to ADMIN_EMAIL / ADMIN_PASSWORD from .env (or the defaults in env.js).
 */

const connectDB = require('../config/db');
const config = require('../config/env');
const User = require('../models/User');

const [, , emailArg, passwordArg] = process.argv;

const email = emailArg || config.adminEmail;
const password = passwordArg || config.adminPassword;
const name = 'Admin';

(async () => {
  try {
    await connectDB();

    const existing = await User.findOne({ email });

    if (existing) {
      // Re-fetch with password so the pre-save hook can hash the new one
      const existingWithPw = await User.findOne({ email }).select('+password');
      existingWithPw.role = 'admin';
      existingWithPw.isEmailVerified = true;
      existingWithPw.password = password; // always reset so credentials are known
      await existingWithPw.save();
      console.log(`✅ Existing user promoted to admin: ${email}`);
    } else {
      await User.create({
        name,
        email,
        password,
        role: 'admin',
        isEmailVerified: true,
      });
      console.log(`✅ Admin user created: ${email}`);
    }

    console.log(`   Email   : ${email}`);
    console.log(`   Password: ${password}`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Failed:', err.message);
    process.exit(1);
  }
})();
