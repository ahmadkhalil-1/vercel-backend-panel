// middleware/gameUserAuth.js
import jwt from 'jsonwebtoken';
import GameUser from '../models/GameUser.js';

const gameUserAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        // Decode token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Ensure it's a game user (not superadmin/manager token)
        if (decoded.role !== 'gameUser') {
            return res.status(403).json({ message: 'Access denied for backend user' });
        }

        // Get user from DB
        const user = await GameUser.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({ message: 'Game user not found' });
        }

        // Attach game user to request
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        return res.status(401).json({ message: 'Invalid token' });
    }
};

export default gameUserAuth;
