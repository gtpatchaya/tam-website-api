const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const resizeImages = async (req, res, next) => {
    if (!req.files) return next();

    await Promise.all(
        req.files.map(async (file) => {
            const newFilename = 'resized-' + file.filename;
            const newFilePath = path.join(__dirname, '..', 'uploads', newFilename);

            await sharp(file.path)
                .resize({ width: 800 })
                .toFile(newFilePath);

            fs.unlinkSync(file.path); // Remove the original file

            // Update the file object to point to the new file
            file.filename = newFilename;
            file.path = newFilePath;
        })
    );

    next();
};

module.exports = resizeImages;
