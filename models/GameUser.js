// models/GameUser.js
import mongoose from 'mongoose';

// Schema for tracking unlocked content
const unlockedContentSchema = new mongoose.Schema({
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  subcategoryId: { type: mongoose.Schema.Types.ObjectId },
  detailId: { type: mongoose.Schema.Types.ObjectId },
});

const gameUserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
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
  unlockedContent: [unlockedContentSchema], // Track which images the user has unlocked
}, { timestamps: true });

const GameUser = mongoose.model('GameUser', gameUserSchema);
export default GameUser;
