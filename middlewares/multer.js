import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

const uploadFields = upload.fields([
  { name: 'categoryImage', maxCount: 1 },
  { name: 'subcategoryImages', maxCount: 10 },
  { name: 'detailImages', maxCount: 50 },
]);

export default uploadFields;
