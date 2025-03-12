const upload = require('../config/multer.config');

const uploadMiddleware = (req, res, next) => {
    upload.single('upload')(req, res, (err) => {
        if (err) {
            return next(err);
        }
        next();
    });
};

module.exports = uploadMiddleware;