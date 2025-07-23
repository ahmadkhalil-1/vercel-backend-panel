import User from '../models/User.js';
import bcrypt from 'bcryptjs';

// Create a new manager (in User collection)
export const createManager = async (req, res) => {
  try {
    const { name, email, password, categories } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already exists.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const manager = new User({ name, email, password: hashedPassword, role: 'manager', categories: categories || [] });
    await manager.save();
    res.status(201).json({ manager });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all managers
export const getManagers = async (req, res) => {
  try {
    const managers = await User.find({ role: 'manager' }).select('-password');
    res.json({ managers });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update a manager
export const updateManager = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, categories } = req.body;
    const update = { name, email };
    if (password) {
      update.password = await bcrypt.hash(password, 10);
    }
    if (categories) {
      update.categories = categories;
    }
    const manager = await User.findOneAndUpdate({ _id: id, role: 'manager' }, update, { new: true }).select('-password');
    if (!manager) return res.status(404).json({ message: 'Manager not found.' });
    res.json({ manager });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete a manager
export const deleteManager = async (req, res) => {
  try {
    const { id } = req.params;
    const manager = await User.findOneAndDelete({ _id: id, role: 'manager' });
    if (!manager) return res.status(404).json({ message: 'Manager not found.' });
    res.json({ message: 'Manager deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 