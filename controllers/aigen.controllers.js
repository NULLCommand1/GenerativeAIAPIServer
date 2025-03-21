const genService = require('../services/gen.services');
const { normalizeModelAI } = require('../helpers/main.helpers');
const contextService = require('../services/context.services');
const contextLockService = require('../services/context-lock.services');

const mainController = {
    aiGenerate: async (req, res) => {
        try {
            const { prompt, model, contextId } = req.body;

            if (!prompt || !model) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Prompt and model are required',
                    error: 'Prompt and model are required'
                });
            }

            const normalizedModelAI = normalizeModelAI(model);
            
            if (!normalizedModelAI) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Invalid modelAI',
                    error: 'Invalid modelAI'
                });
            }

            const validContextId = contextId && contextId.length === 20 ? contextId : await contextService.generateContextId();
            if (contextId && await contextLockService.isLocked(validContextId)) {
                return res.status(409).json({
                    success: false,
                    message: 'Context is being used, please try again later',
                    error: 'Context is being used, please try again later'
                });
            }
            
            await contextLockService.acquireLock(validContextId);
            
            try {
                const response = await genService.getAIGenerateWithContext(prompt, validContextId, normalizedModelAI, req);

                if (!res.headersSent) {
                    return res.status(200).json({ 
                        success: true, 
                        message: 'Success', 
                        text: response.text,
                        timestamp: response.timestamp,
                        contextId: validContextId,
                        error: null
                    });
                }
            } finally {
                await contextLockService.releaseLock(validContextId);
            }

        } catch (error) {
            if (req.body.contextId) {
                await contextLockService.releaseLock(req.body.contextId);
            }
            
            if (!res.headersSent) {
                return res.status(500).json({ 
                    success: false, 
                    message: `An error occurred: ${error.message}`,
                    error: error.message
                });
            }
        }
    }
};

module.exports = mainController;