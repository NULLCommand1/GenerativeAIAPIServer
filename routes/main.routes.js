const { Router } = require('express');
const mainController = require('../controllers/aigen.controllers');
const uploadController = require('../controllers/upload.controllers');
const ttsController = require('../controllers/tts.controllers');

const router = Router();

router.get('/helloworld', (req, res) => res.send('Hello World'));
router.post('/api/v2/ai-gen', mainController.aiGenerate);
router.post('/api/v2/upload-file', uploadController.uploadFile);
router.post('/api/v2/tts-gen', ttsController.genSpeech);
module.exports = router;