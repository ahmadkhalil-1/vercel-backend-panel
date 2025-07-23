import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

/**
 * @route POST /api/users/register
 * @desc Super Admin creates a Manager
 * @access Super Admin only
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, role, categories } = req.body;

    // Validate input
    if (!name || !email || !password || name.length <= 4 || password.length <= 4) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required. Name and password must be at least 5 characters.',
      });
    }

    // Validate role
    if (role && role !== 'manager') {
      return res.status(400).json({ success: false, message: 'Only "manager" role is allowed for creation.' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new manager (default role = manager)
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'manager',
      categories: categories || [],
    });

    res.status(201).json({
      success: true,
      message: 'Manager created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        categories: user.categories,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to create manager' });
  }
};

/**
 * @route POST /api/users/login
 * @desc Login for Super Admin and Managers
 * @access Public
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ success: false, message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ success: false, message: 'Invalid credentials' });

    // Create token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        categories: user.categories, // <-- Add this line
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
};

/**
 * @route GET /api/users/logout
 * @desc Logout
 * @access Public
 */
export const logout = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

// ==============================
// GET ALL USERS (for admin panel)
// ==============================
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch users', error: error.message });
    }
};
