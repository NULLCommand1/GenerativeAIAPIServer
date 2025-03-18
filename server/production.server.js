const express = require('express');
const cors = require('cors');
const timeout = require('connect-timeout');
const { IP_ALWAYS_DATA, PORT_ALWAYS_DATA } = require('./constants/main.constants');
const mainRoutes = require('../routes/main.routes');
const db = require('../models/db.models');
const { errorHandlingMiddleware, expressJsonMiddleware } = require('../middlewares/main.middlewares');

function createServer() {
    const app = express();
    
    app.use(timeout('180s'));
    app.use(cors());
    expressJsonMiddleware(app);
    app.use('/', mainRoutes);
    errorHandlingMiddleware(app);
    
    return app;
}

async function startServer() {
    const app = createServer();
    
    try {
        await db.sequelize.authenticate();
        app.listen(PORT_ALWAYS_DATA, IP_ALWAYS_DATA, () => {
            console.log('App running on AlwaysData');
        });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
}

module.exports = { createServer, startServer };