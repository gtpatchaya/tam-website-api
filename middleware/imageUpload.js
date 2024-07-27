const multer = require('../config/multer');

const upload = multer.array('images', 10);

module.exports = upload;
