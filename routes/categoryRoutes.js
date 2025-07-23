import express from 'express';
import { 
    addCategory, 
    getCategories, 
    updateCategory, 
    deleteCategory, 
    updateSubcategory, 
    deleteSubcategory, 
    updateDetail, 
    deleteDetail, 
    getAllCategoriesGlobal, 
    addSubcategory, 
    addDetail 
} from '../controllers/categoryController.js';
import uploadFields from '../middlewares/multer.js';
import { isAuthenticated, isSuperAdminOnly, isAdminOrManager } from '../middlewares/authMiddleware.js';
import verifyToken from '../middlewares/verifyToken.js';
import managerCategoryAccess from '../middlewares/managerCategoryAccess.js';

const router = express.Router();

// Category routes
router.post('/add', isAuthenticated, isSuperAdminOnly, addCategory);
// Protect GET categories with verifyToken for personalized lock status
router.get('/', verifyToken, getCategories);
router.get('/all', getAllCategoriesGlobal);
router.put('/:id', isAuthenticated, isSuperAdminOnly, updateCategory);
router.delete('/:id', isAuthenticated, isSuperAdminOnly, deleteCategory);

// Subcategory routes
router.post('/:categoryId/subcategories', isAuthenticated, isAdminOrManager, managerCategoryAccess, addSubcategory);
router.put('/:categoryId/subcategories/:subcategoryId', isAuthenticated, isAdminOrManager, managerCategoryAccess, updateSubcategory);
router.delete('/:categoryId/subcategories/:subcategoryId', isAuthenticated, isAdminOrManager, managerCategoryAccess, deleteSubcategory);

// Detail routes
router.post('/:categoryId/subcategories/:subcategoryId/details', isAuthenticated, isAdminOrManager, managerCategoryAccess, addDetail);
router.put('/:categoryId/subcategories/:subcategoryId/details/:detailId', isAuthenticated, isAdminOrManager, managerCategoryAccess, updateDetail);
router.delete('/:categoryId/subcategories/:subcategoryId/details/:detailId', isAuthenticated, isAdminOrManager, managerCategoryAccess, deleteDetail);

export default router;
