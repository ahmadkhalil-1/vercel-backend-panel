import GameUser from "../models/GameUser.js";
import Category from "../models/Category.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";
import mongoose from "mongoose";
import getImageUrl from "../utils/getImageUrl.js";

// ==============================
// UNITY REGISTER (Game User)
// ==============================
export const registerGameUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if username or email already exists
        const existing = await GameUser.findOne({ $or: [{ username }, { email }] });
        if (existing) {
            return res.status(400).json({ message: 'Username or Email already taken' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new GameUser({
            username,
            email,
            password: hashedPassword,
        });

        await newUser.save();

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Registration error', error: error.message });
    }
};

// ==============================
// UNITY LOGIN (Game User)
// ==============================
export const loginGameUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await GameUser.findOne({ email });
        if (!user) return res.status(400).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = generateToken(user._id, 'gameUser');

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Login error', error: error.message });
    }
};

// ==============================
// GET CATEGORIES WITH PERSONALIZED LOCK STATUS
// ==============================
export const getGameUserCategories = async (req, res) => {
    try {
        // Get the authenticated game user from middleware
        const gameUser = req.user;
        if (!gameUser) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        // Get all categories
        const categories = await Category.find();

        // Create a map of unlocked content for quick lookup
        const unlockedMap = {};
        gameUser.unlockedContent.forEach(item => {
            const categoryKey = item.categoryId.toString();
            const subcategoryKey = item.subcategoryId.toString();
            const detailKey = item.detailId.toString();

            if (!unlockedMap[categoryKey]) {
                unlockedMap[categoryKey] = {};
            }
            if (!unlockedMap[categoryKey][subcategoryKey]) {
                unlockedMap[categoryKey][subcategoryKey] = {};
            }
            unlockedMap[categoryKey][subcategoryKey][detailKey] = true;
        });

        // Transform categories to include personalized lock status and full image URLs
        const personalizedCategories = categories.map(category => {
            const categoryObj = category.toObject();
            const categoryId = category._id.toString();
            categoryObj.image = getImageUrl(req, categoryObj.image);

            // Process subcategories
            categoryObj.subcategories = category.subcategories.map(subcategory => {
                const subcategoryObj = subcategory;
                const subcategoryId = subcategory._id.toString();
                subcategoryObj.image = getImageUrl(req, subcategoryObj.image);

                // Process details within subcategory
                subcategoryObj.details = subcategory.details.map(detail => {
                    const detailObj = detail;
                    const detailId = detail._id.toString();
                    detailObj.image = getImageUrl(req, detailObj.image);
                    // Check if this detail is unlocked for this user
                    const isUnlocked = unlockedMap[categoryId]?.[subcategoryId]?.[detailId] || false;
                    // Override the default isLocked status with personalized status
                    detailObj.isLocked = !isUnlocked;
                    return detailObj;
                });
                return subcategoryObj;
            });
            return categoryObj;
        });

        res.status(200).json({ success: true, categories: personalizedCategories });
    } catch (error) {
        console.error('Error fetching game user categories:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch categories', error: error.message });
    }
};

// ==============================
// LOGOUT (Game User)
// ==============================
export const logoutGameUser = (req, res) => {
    // Client should delete token; just respond success
    return res.status(200).json({ success: true, message: 'Logout successful' });
};

// ==============================
// IMAGE LOCK/UNLOCK (Game User)
// ==============================
// POST: { detailId, lock } (lock: true/false)
export const lockUnlockImage = async (req, res) => {
    try {
        const { detailId, lock } = req.body;
        const gameUser = req.user;
        if (!detailId || typeof lock !== 'boolean') {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }
        // Find the detail in the database
        const category = await Category.findOne({ 'subcategories.details._id': detailId });
        if (!category) {
            return res.status(404).json({ success: false, message: 'Detail not found' });
        }
        let foundSub = null;
        let foundDetail = null;
        for (const sub of category.subcategories) {
            const detail = sub.details.id(detailId);
            if (detail) {
                foundSub = sub;
                foundDetail = detail;
                break;
            }
        }
        if (!foundSub || !foundDetail) {
            return res.status(404).json({ success: false, message: 'Detail not found in subcategory' });
        }
        // Find index in unlockedContent
        const idx = gameUser.unlockedContent.findIndex(
            item => item.detailId.toString() === detailId
        );
        if (lock) {
            // Remove from unlockedContent if present
            if (idx !== -1) {
                gameUser.unlockedContent.splice(idx, 1);
            }
        } else {
            // Add to unlockedContent if not present
            if (idx === -1) {
                gameUser.unlockedContent.push({
                    categoryId: category._id,
                    subcategoryId: foundSub._id,
                    detailId: foundDetail._id
                });
            }
        }
        await gameUser.save();
        return res.status(200).json({ success: true, message: lock ? 'Image locked' : 'Image unlocked' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to update image lock status', error: error.message });
    }
};

// ==============================
// IMAGE COMPLETE (Game User)
// ==============================
// POST: { detailId }
export const completeImage = async (req, res) => {
    try {
        const { detailId } = req.body;
        const gameUser = req.user;
        if (!detailId) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }
        // Find the detail in the database
        const category = await Category.findOne({ 'subcategories.details._id': detailId });
        if (!category) {
            return res.status(404).json({ success: false, message: 'Detail not found' });
        }
        let foundSub = null;
        let foundDetail = null;
        for (const sub of category.subcategories) {
            const detail = sub.details.id(detailId);
            if (detail) {
                foundSub = sub;
                foundDetail = detail;
                break;
            }
        }
        if (!foundSub || !foundDetail) {
            return res.status(404).json({ success: false, message: 'Detail not found in subcategory' });
        }
        // Add to unlockedContent if not present
        const exists = gameUser.unlockedContent.some(
            item => item.detailId.toString() === detailId
        );
        if (!exists) {
            gameUser.unlockedContent.push({
                categoryId: category._id,
                subcategoryId: foundSub._id,
                detailId: foundDetail._id
            });
            await gameUser.save();
        }
        return res.status(200).json({ success: true, message: 'Image marked as complete (unlocked)' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to complete image', error: error.message });
    }
};
