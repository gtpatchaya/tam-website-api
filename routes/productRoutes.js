const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const upload = require('../middleware/imageUpload');
const resizeImages = require('../middleware/resizeImage');
const { authenticate } = require('../middleware/auth');

router.get('/', productController.getAll);
router.post('/', authenticate, upload, resizeImages, productController.create);
router.get('/:id', productController.getById);
router.put('/:id', authenticate, upload, resizeImages, productController.update);
router.delete('/:id', authenticate, productController.delete);

module.exports = router;
