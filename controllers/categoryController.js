import Category from '../models/Category.js';
import getImageUrl from '../utils/getImageUrl.js';
import User from '../models/User.js';
import saveBase64Image from '../utils/saveBase64Image.js';

// Helper to convert local image path to full URL
// const getImageUrl = (req, imagePath) => {
//     if (!imagePath) return '';
//     // Replace all backslashes (Windows paths) with forward slashes
//     const cleanPath = imagePath.replace(/\\/g, '/');
//     return `${req.protocol}://${req.get('host')}/${cleanPath}`;
// };

// export const addCategory = async (req, res) => {
//     const { name, subcategories } = req.body;
//     const image = req.file?.path || '';

//     if (!name || !image || !subcategories) {
//         return res.status(400).json({ success: false, message: 'All fields are required' });
//     }

//     try {
//         const newCategory = new Category({
//             name,
//             image,
//             subcategories: JSON.parse(subcategories) // send subcategories as JSON string
//         });

//         await newCategory.save();
//         res.status(201).json({ success: true, category: newCategory });
//     } catch (err) {
//         res.status(500).json({ success: false, message: 'Failed to add category' });
//     }
// };


export const addCategory = async (req, res) => {
    try {
        const { name, subcategories, categoryImageBase64 } = req.body;

        if (!name || !categoryImageBase64 || !subcategories) {
            return res.status(400).json({ success: false, message: 'Required fields missing' });
        }

        // Save category image from base64
        const image = saveBase64Image(categoryImageBase64);

        // Parse subcategories JSON string (sent from frontend)
        const parsedSubcategories = JSON.parse(subcategories);

        const finalSubcategories = parsedSubcategories.map(sub => {
            // Handle subcategory image if needed (not required in schema)
            let subImage = null;
            if (sub.subcategoryImageBase64) {
                subImage = saveBase64Image(sub.subcategoryImageBase64);
            }
            const details = sub.details.map(detail => {
                if (!detail.detailImageBase64) {
                    throw new Error(`Detail image is required for subcategory "${sub.name}"`);
                }
                return {
                    image: saveBase64Image(detail.detailImageBase64),
                    price: detail.price,
                    isLocked: detail.isLocked || false
                };
            });
            return {
                name: sub.name,
                image: subImage,
                details
            };
        });

        const category = new Category({
            name,
            image,
            subcategories: finalSubcategories
        });

        await category.save();
        res.status(201).json({ success: true, category });
    } catch (error) {
        console.error('❌ Error adding category:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getCategories = async (req, res) => {
    try {
        let categories = await Category.find();
        const user = req.user; // From verifyToken middleware
        // If user is a manager, filter categories by assigned ones
        if (user && user.role === 'manager' && user.categories && user.categories.length > 0) {
            categories = categories.filter(cat => user.categories.map(id => id.toString()).includes(cat._id.toString()));
        }
        // Map images to full URLs and use DB isLocked
        categories = categories.map(category => {
            const categoryObj = category.toObject();
            categoryObj.image = getImageUrl(req, categoryObj.image);
            categoryObj.subcategories = category.subcategories.map(sub => {
                const subcategoryObj = sub.toObject();
                subcategoryObj.image = getImageUrl(req, subcategoryObj.image);
                subcategoryObj.details = sub.details.map(detail => {
                    const detailObj = detail.toObject();
                    detailObj.image = getImageUrl(req, detailObj.image);
                    // Use DB value for isLocked
                    detailObj.isLocked = detailObj.isLocked;
                    return detailObj;
                });
                return subcategoryObj;
            });
            return categoryObj;
        });
        res.status(200).json({ success: true, categories });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch categories' });
    }
};

// ==============================
// GLOBAL GET ALL CATEGORIES (no user-specific lock status)
// ==============================
export const getAllCategoriesGlobal = async (req, res) => {
    try {
        let categories = await Category.find();
        // Map images to full URLs
        categories = categories.map(category => ({
            ...category.toObject(),
            image: getImageUrl(req, category.image),
            subcategories: category.subcategories.map(sub => ({
                ...sub.toObject(),
                image: getImageUrl(req, sub.image),
                details: sub.details.map(detail => ({
                    ...detail.toObject(),
                    image: getImageUrl(req, detail.image)
                }))
            }))
        }));
        res.status(200).json({ success: true, categories });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch categories' });
    }
};

// Update a category
export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, categoryImageBase64 } = req.body;

        // Find the category
        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        // Update category fields
        if (name) category.name = name;
        if (categoryImageBase64) {
            const image = saveBase64Image(categoryImageBase64);
            category.image = image;
        }

        await category.save();
        res.status(200).json({ success: true, category });
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete a category
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        // Find and delete the category
        const category = await Category.findByIdAndDelete(id);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        res.status(200).json({ success: true, message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update a subcategory
export const updateSubcategory = async (req, res) => {
    try {
        const { categoryId, subcategoryId } = req.params;
        const { name, subcategoryImageBase64 } = req.body;
        let image = null;
        if (subcategoryImageBase64) {
            image = saveBase64Image(subcategoryImageBase64);
        }
        // Find the category
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        // Find the subcategory
        const subcategory = category.subcategories.id(subcategoryId);
        if (!subcategory) {
            return res.status(404).json({ success: false, message: 'Subcategory not found' });
        }
        // Update subcategory fields
        if (name) subcategory.name = name;
        if (image) subcategory.image = image;
        await category.save();
        res.status(200).json({ success: true, category });
    } catch (error) {
        console.error('Error updating subcategory:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete a subcategory
export const deleteSubcategory = async (req, res) => {
    try {
        const { categoryId, subcategoryId } = req.params;

        // Find the category
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        // Remove the subcategory
        category.subcategories.pull(subcategoryId);
        await category.save();

        res.status(200).json({ success: true, message: 'Subcategory deleted successfully' });
    } catch (error) {
        console.error('Error deleting subcategory:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update a detail
export const updateDetail = async (req, res) => {
    try {
        const { categoryId, subcategoryId, detailId } = req.params;
        const { price, isLocked, detailImageBase64 } = req.body;
        let image = null;
        if (detailImageBase64) {
            image = saveBase64Image(detailImageBase64);
        }
        // Find the category
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        // Find the subcategory
        const subcategory = category.subcategories.id(subcategoryId);
        if (!subcategory) {
            return res.status(404).json({ success: false, message: 'Subcategory not found' });
        }
        // Find the detail
        const detail = subcategory.details.id(detailId);
        if (!detail) {
            return res.status(404).json({ success: false, message: 'Detail not found' });
        }
        // Update detail fields
        if (price) detail.price = price;
        if (typeof isLocked !== 'undefined') detail.isLocked = isLocked;
        if (image) detail.image = image;
        await category.save();
        res.status(200).json({ success: true, category });
    } catch (error) {
        console.error('Error updating detail:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete a detail
export const deleteDetail = async (req, res) => {
    try {
        const { categoryId, subcategoryId, detailId } = req.params;

        // Find the category
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        // Find the subcategory
        const subcategory = category.subcategories.id(subcategoryId);
        if (!subcategory) {
            return res.status(404).json({ success: false, message: 'Subcategory not found' });
        }

        // Remove the detail
        subcategory.details.pull(detailId);
        await category.save();

        res.status(200).json({ success: true, message: 'Detail deleted successfully' });
    } catch (error) {
        console.error('Error deleting detail:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Add a subcategory to a category
export const addSubcategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { name, details, subcategoryImageBase64 } = req.body;
        let image = null;
        if (subcategoryImageBase64) {
            image = saveBase64Image(subcategoryImageBase64);
        }
        if (!name) {
            return res.status(400).json({ success: false, message: 'Name is required' });
        }
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        let finalDetails = [];
        if (details) {
            // Parse details JSON if sent as string
            let parsedDetails = details;
            if (typeof details === 'string') {
                parsedDetails = JSON.parse(details);
            }
            finalDetails = parsedDetails.map(detail => {
                let detailImage = null;
                if (detail.detailImageBase64) {
                    detailImage = saveBase64Image(detail.detailImageBase64);
                }
                if (!detailImage) {
                    throw new Error('Detail image is required');
                }
                return {
                    image: detailImage,
                    price: detail.price,
                    isLocked: detail.isLocked || false
                };
            });
        }
        category.subcategories.push({ name, image, details: finalDetails });
        await category.save();
        res.status(201).json({ success: true, category });
    } catch (error) {
        console.error('Error adding subcategory:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Add a detail to a subcategory
export const addDetail = async (req, res) => {
    try {
        const { categoryId, subcategoryId } = req.params;
        const { price, isLocked, detailImageBase64 } = req.body;
        let image = null;
        if (detailImageBase64) {
            image = saveBase64Image(detailImageBase64);
        }
        if (!price || !image) {
            return res.status(400).json({ success: false, message: 'Price and image are required' });
        }
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        const subcategory = category.subcategories.id(subcategoryId);
        if (!subcategory) {
            return res.status(404).json({ success: false, message: 'Subcategory not found' });
        }
        subcategory.details.push({ image, price, isLocked: isLocked || false });
        await category.save();
        res.status(201).json({ success: true, category });
    } catch (error) {
        console.error('Error adding detail:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
