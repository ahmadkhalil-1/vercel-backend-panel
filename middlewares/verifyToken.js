// middleware/verifyToken.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Manager from '../models/Manager.js';
import GameUser from '../models/GameUser.js';

const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }

        const token = authHeader.split(' ')[1];

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch user by ID and exclude password
        let user = await User.findById(decoded.id).select('-password');
        if (!user) {
            user = await Manager.findById(decoded.id).select('-password');
        }
        if (!user) {
            user = await GameUser.findById(decoded.id).select('-password');
        }
        if (!user) {
            return res.status(401).json({ message: 'Invalid token. User does not exist.' });
        }

        req.user = user; // Attach user to request
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token format.' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Session expired. Please log in again.' });
        }
        return res.status(500).json({ message: 'Server error while verifying token.' });
    }
};

export default verifyToken;
