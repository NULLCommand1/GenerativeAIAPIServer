const db = require('../models/db.models');
const moment = require('moment-timezone');

const fileService = {
    addDataToDatabase: async (contextId, filePathOnServer, fileMimeType) => {
        const validMimeTypes = new Set(['application/pdf', 'image/png', 'image/jpeg']);
        if (!validMimeTypes.has(fileMimeType)) {
            fileMimeType = 'text/plain';
        }

        const transaction = await db.sequelize.transaction();
        try {
            let createAt = moment.tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DD HH:mm:ss");
            await db.Files.create({ contextId, filePath: filePathOnServer, fileMimeType, createdAt: createAt, updatedAt: createAt }, { transaction });
            await transaction.commit();
            return { success: true, timestamp: createAt };
        } catch (error) {
            await transaction.rollback();
            return { success: false, error: error.message };
        }
    }
};

module.exports = fileService;