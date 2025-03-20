const uploadMiddleware = require('../middlewares/multer-middleware.middlewares');
const { FILE_SIZE_LIMIT } = require('../constants/main.constants');
const contextService = require('../services/context.services');
const fileService = require('../services/file.services');
const contextLockService = require('../services/context-lock.services');

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

        let validContextId;
        try {
            await new Promise((resolve, reject) => {
                uploadMiddleware(req, res, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            if (req.body.contextId) {
                const contextIdExists = await contextService.contextIdExists(req.body.contextId);
                if (!contextIdExists) {
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid context ID'
                    });
                }

                const isLocked = await contextLockService.isLocked(req.body.contextId);
                if (isLocked) {
                    return res.status(409).json({
                        success: false,
                        message: 'Context is being used, please try again later'
                    });
                }
                
                validContextId = req.body.contextId;
            } else {
                validContextId = await contextService.generateContextId();
            }

            await contextLockService.acquireLock(validContextId);

            try {
                const result = await fileService.addDataToDatabase(validContextId, req.fileUploadedPath, req.file.mimetype);
                if (!result.success) {
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to upload file: ' + result.error
                    });
                }

                res.status(200).json({
                    success: true,
                    message: 'Successfully uploaded file',
                    contextId: validContextId,
                    timestamp: result.timestamp
                });
            } finally {
                await contextLockService.releaseLock(validContextId);
            }
        } catch (err) {
            if (validContextId) {
                await contextLockService.releaseLock(validContextId);
            }
            
            res.status(500).json({
                success: false,
                message: err.message
            });
        }
    }
};

module.exports = uploadController;