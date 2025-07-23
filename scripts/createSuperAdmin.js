// server/scripts/createSuperAdmin.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();
await mongoose.connect(process.env.MONGO_URI);

const existing = await User.findOne({ email: 'superadmin@example.com' });
if (existing) {
  console.log('Super Admin already exists.');
  process.exit();
}

const hashedPassword = await bcrypt.hash('supersecurepassword', 10);

const superAdmin = await User.create({
  name: 'Super Admin',
  email: 'superadmin@example.com',
  password: hashedPassword,
  role: 'superadmin',
});

console.log('✅ Super Admin created:', superAdmin);
process.exit();
