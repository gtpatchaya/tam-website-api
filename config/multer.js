const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
        file.filename = filename; // Save the filename to file object
        cb(null, filename);
    }
});

const fileFilter = (req, file, cb) => {
    // Accept only images
    if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Please upload an image file'), false);
    }
    cb(null, true);
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024  // Limit file size to 5MB
    },
    fileFilter: fileFilter
});

module.exports = upload;
