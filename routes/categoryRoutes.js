const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const upload = require('../middleware/imageUpload');
const resizeImages = require('../middleware/resizeImage');
const { authenticate } = require('../middleware/auth');

router.get('/', categoryController.getAllCategories);
router.post('/', authenticate, upload, resizeImages, categoryController.createCategory);
router.get('/:id', categoryController.getCategoryById);
router.put('/:id', authenticate, upload, resizeImages, categoryController.updateCategory);
router.delete('/:id', authenticate, categoryController.deleteCategory);

module.exports = router;
