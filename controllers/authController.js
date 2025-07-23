// controllers/authController.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Manager from '../models/Manager.js';
import GameUser from '../models/GameUser.js';

// Generate JWT
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // First check in User collection
        let user = await User.findOne({ email });
        let isManager = false;

        // If not found in User, check in Manager collection
        if (!user) {
            const manager = await Manager.findOne({ email });
            if (manager) {
                user = manager;
                isManager = true;
            }
        }

        if (!user) return res.status(400).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = generateToken(user._id, user.role || 'manager');

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role || 'manager',
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Login error', error: error.message });
    }
};

// ==============================
// LOGOUT - Client can simply delete token
// ==============================
export const logout = (req, res) => {
    // Optionally invalidate token or just tell client to delete it
    res.status(200).json({ message: 'Logout successful' });
};

// ==============================
// CREATE USER (Admin or Manager) — Only by Admin
// ==============================
export const createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!['manager'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role,
        });

        await newUser.save();

        res.status(201).json({ success: true, message: `${role} created successfully` });
    } catch (error) {
        res.status(500).json({ message: 'User creation error', error: error.message });
    }
};
