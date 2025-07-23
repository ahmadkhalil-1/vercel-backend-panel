// import express from 'express';
// import Stripe from 'stripe';
// import verifyToken from '../middlewares/verifyToken.js';
// import { lockUnlockImage } from '../controllers/GameUserController.js';
// import gameUserAuth from '../middlewares/gameUserAuth.js';

// const router = express.Router();
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// // Test endpoint
// // router.get('/test', (req, res) => {
// //   res.json({ message: 'Stripe route is working!' });
// // });

// // Create checkout session
// router.post('/create-checkout-session', verifyToken, async (req, res) => {
//   try {
//     const { price, imageId } = req.body;
//     if (!price || !imageId) {
//       return res.status(400).json({ error: 'Price and imageId are required' });
//     }
//     // Get token from Authorization header
//     const authHeader = req.headers.authorization;
//     const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : '';
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ['card'],
//       mode: 'payment',
//       line_items: [{
//         price_data: {
//           currency: 'usd',
//           product_data: {
//             name: 'Unlock Image',
//             metadata: { imageId: imageId }
//           },
//           unit_amount: Math.round(Number(price) * 100) // Convert to cents
//         },
//         quantity: 1
//       }],
//       success_url: `${process.env.BASE_URL}/stripe/success?imageId=${imageId}&session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${process.env.BASE_URL}/stripe/cancel`,
//       metadata: {
//         token: token
//       }
//     });

//     res.json({ url: session.url });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Add a GET /stripe/success route that unlocks the image for the logged-in GameUser

// router.get('/success', async (req, res) => {
//   try {
//     const { imageId, session_id } = req.query;
//     if (!imageId || !session_id) {
//       return res.status(400).json({ success: false, message: 'Missing imageId or session_id' });
//     }
//     // Get Stripe session and token from metadata
//     const session = await stripe.checkout.sessions.retrieve(session_id);
//     const token = session.metadata?.token;
//     if (!token) {
//       return res.status(400).json({ success: false, message: 'No token found in Stripe session metadata' });
//     }
//     // Decode token to get user id
//     const jwt = (await import('jsonwebtoken')).default;
//     const GameUser = (await import('../models/GameUser.js')).default;
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const gameUser = await GameUser.findById(decoded.id);
//     if (!gameUser) {
//       return res.status(404).json({ success: false, message: 'Game user not found' });
//     }
//     const Category = (await import('../models/Category.js')).default;
//     const category = await Category.findOne({ 'subcategories.details._id': imageId });
//     if (!category) {
//       return res.status(404).json({ success: false, message: 'Detail not found' });
//     }
//     let foundSub = null;
//     let foundDetail = null;
//     for (const sub of category.subcategories) {
//       const detail = sub.details.id(imageId);
//       if (detail) {
//         foundSub = sub;
//         foundDetail = detail;
//         break;
//       }
//     }
//     if (!foundSub || !foundDetail) {
//       return res.status(404).json({ success: false, message: 'Detail not found in subcategory' });
//     }
//     // Add to unlockedContent if not present
//     const exists = gameUser.unlockedContent.some(
//       item => item.detailId.toString() === imageId
//     );
//     if (!exists) {
//       gameUser.unlockedContent.push({
//         categoryId: category._id,
//         subcategoryId: foundSub._id,
//         detailId: foundDetail._id
//       });
//       await gameUser.save();
//     }
//     return res.status(200).json({ success: true, message: 'Image unlocked for this user!' });
//   } catch (err) {
//     res.status(500).json({ success: false, message: 'Stripe success error', error: err.message });
//   }
// });

// // Stripe cancel route: transaction failed
// router.get('/cancel', (req, res) => {
//   res.status(200).json({ success: false, message: 'Transaction failed or was cancelled.' });
// });

// export default router; 