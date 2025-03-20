const { Router } = require('express');
const mainController = require('../controllers/aigen.controllers');
const uploadController = require('../controllers/upload.controllers');

const router = Router();

router.get('/helloworld', (req, res) => res.send('Hello World'));
router.post('/api/ai-gen', mainController.aiGenerate);
router.post('/api/upload-file', uploadController.uploadFile);

module.exports = router;