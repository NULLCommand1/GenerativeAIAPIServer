const db = require('../models/db.models');

const fileService = {
    addDataToDatabase: async (contextId, filePathOnServer, fileMimeType) => {
        const validMimeTypes = new Set(['application/pdf', 'image/png', 'image/jpeg']);
        if (!validMimeTypes.has(fileMimeType)) {
            fileMimeType = 'text/plain';
        }

        const transaction = await db.sequelize.transaction();
        try {
            await db.Files.create({ contextId, filePath: filePathOnServer, fileMimeType }, { transaction });
            await transaction.commit();
            return true;
        } catch (error) {
            await transaction.rollback();
            return false;
        }
    }
};

module.exports = fileService;