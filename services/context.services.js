const db = require('../models/db.models');

const contextService = {
    generateContextId: async () => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        let contextId = '';
        let exists = true;

        while (exists) {
            contextId = Array.from({ length: 20 }, () => characters.charAt(Math.floor(Math.random() * charactersLength))).join('');
            exists = await db.ChatMessages.findOne({ where: { contextId }, attributes: ['contextId'] }) !== null;
        }

        return contextId;
    },
    contextIdExists: async (contextId) => {
        let hasContextId = await db.ChatMessages.findOne({ where: { contextId }, attributes: ['contextId'] });
        if (!hasContextId) {
            hasContextId = await db.Files.findOne({ where: { contextId }, attributes: ['contextId'] });
        }
        return hasContextId !== null;
    }
};

module.exports = contextService;