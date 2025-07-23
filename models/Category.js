import mongoose from 'mongoose';

// Detail: One image with its price and lock status
const detailSchema = new mongoose.Schema({
    image: { type: String, required: true },       // e.g., side image
    price: { type: Number, required: true },
    isLocked: { type: Boolean, default: false },
});

// Subcategory: e.g., Civic, with its own image and array of details
const subCategorySchema = new mongoose.Schema({
    name: { type: String, required: true },         // e.g., Civic
    image: { type: String },                        // subcategory image
    details: [detailSchema],                        // multiple image/price/lock
});

// Main Category: e.g., Car or Bike, with its own image
const categorySchema = new mongoose.Schema({
    name: { type: String, required: true }, // e.g., Car or Bike
    image: { type: String },                               // category image
    subcategories: [subCategorySchema],                    // list of subcategories
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);
export default Category;
