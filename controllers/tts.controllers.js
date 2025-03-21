const { ttsService } = require('../services/tts.services');

exports.genSpeech = async (req, res) => {
    try {
        const { text, voiceId, speed, model } = req.body;
        const result = await ttsService.ttsIntelligent(text, voiceId, speed, model);
        res.status(200).json({
            success: true,
            message: 'Speech generated successfully',
            media_url: result.url,
            timestamp: result.timestamp,
            error: null
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to generate speech',
            error: error.message
        });
    }
};
