import mongoose from 'mongoose';

const managerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: 'manager',
    enum: ['manager']
  }
}, { timestamps: true });

const Manager = mongoose.model('Manager', managerSchema);

export default Manager;

