// models/User.js
import mongoose from 'mongoose';

const unlockedContentSchema = new mongoose.Schema({
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  subcategoryId: { type: mongoose.Schema.Types.ObjectId },
  detailId: { type: mongoose.Schema.Types.ObjectId },
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['superadmin', 'manager'], 
    default: 'manager',
  },
  unlockedContent: [unlockedContentSchema], // Track which images the user has unlocked
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
