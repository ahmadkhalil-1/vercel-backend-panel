import Manager from '../models/Manager.js';

export default async function managerCategoryAccess(req, res, next) {
  if (req.user.role === 'admin' || req.user.role === 'superadmin') return next();

  // For manager, check allowed categories
  const allowedCategories = req.user.categories?.map(String) || [];
  // Try to get categoryId from params, body, or query
  const categoryId = req.params.categoryId || req.body.categoryId || req.query.categoryId;

  if (!categoryId) {
    return res.status(400).json({ message: 'No categoryId provided in request' });
  }
  if (!allowedCategories.includes(categoryId.toString())) {
    return res.status(403).json({ message: 'Access denied for this category' });
  }
  next();
} 