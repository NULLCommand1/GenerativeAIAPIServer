const uploadMiddleware = require('../middlewares/multer-middleware.middlewares');
const { FILE_SIZE_LIMIT } = require('../constants/main.constants');
const contextService = require('../services/context.services');
const fileService = require('../services/file.services');

const uploadController = {
    uploadFile: async (req, res) => {
        const fileSizeLimitInBytes = FILE_SIZE_LIMIT * 1024 * 1024;
        const contentLength = parseInt(req.headers['content-length'], 10);

        if (contentLength > fileSizeLimitInBytes) {
            return res.status(400).json({
                success: false,
                message: `File size limit exceeded, please upload file less than ${FILE_SIZE_LIMIT}MB`
            });
        }

        try {
            await new Promise((resolve, reject) => {
                uploadMiddleware(req, res, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            let validContextId;
            if (req.body.contextId) {
                const contextIdExists = await contextService.contextIdExists(req.body.contextId);
                if (!contextIdExists) {
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid context ID'
                    });
                }
                validContextId = req.body.contextId;
            } else {
                validContextId = await contextService.generateContextId();
            }

            const success = await fileService.addDataToDatabase(validContextId, req.fileUploadedPath, req.file.mimetype);
            if (!success) {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to upload file'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Successfully uploaded file',
                contextId: validContextId
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: err.message
            });
        }
    }
};

module.exports = uploadController;