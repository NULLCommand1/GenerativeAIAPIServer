const express = require('express');

const errorHandlingMiddleware = (app) => {
    app.use((err, req, res, next) => {
        if (err) {
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: err.message
            });
        } else {
            next();
        }
    });
};

const expressJsonMiddleware = (app) => {
    app.use(express.json({
        verify: (req, res, buf) => {
            try {
                JSON.parse(buf);
            } catch (e) {
                throw new Error('JSON parse error');
            }
        }
    }));
};


module.exports = { errorHandlingMiddleware, expressJsonMiddleware };