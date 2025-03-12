const db = require('../models/db.models');

exports.normalizeModelAI = (modelAI) => {
    if (modelAI === 'null-flash') return process.env.FLASH_MODEL;
    if (modelAI === 'null-pro') return process.env.PRO_MODEL;
    return '';
};