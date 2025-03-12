const genService = require('../services/gen.services');
const { normalizeModelAI } = require('../helpers/main.helpers');
const contextService = require('../services/context.services');

const mainController = {
    aiGenerate: async (req, res) => {
        try {
            const { prompt, model, contextId } = req.body;

            if (!prompt || !model) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Prompt and model are required' 
                });
            }

            const normalizedModelAI = normalizeModelAI(model);
            if (!normalizedModelAI) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Invalid modelAI' 
                });
            }

            const validContextId = contextId && contextId.length === 20 ? contextId : await contextService.generateContextId();

            const response = await genService.getAIGenerateWithContext(prompt, validContextId, normalizedModelAI, req);

            if (!res.headersSent) {
                return res.status(200).json({ 
                    success: true, 
                    message: 'Success', 
                    text: response,
                    contextId: validContextId
                });
            }

        } catch (error) {
            if (!res.headersSent) {
                return res.status(500).json({ 
                    success: false, 
                    message: `An error occurred: ${error.message}` 
                });
            }
        }
    }
};

module.exports = mainController;