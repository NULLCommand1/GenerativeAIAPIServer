const { initializeSharedServices } = require('../services/shared-state.services');
const env = process.env.CURRENT_ENV || 'development';
const { startServer } = require(`../server/${env}.server`);

function startWorker() {
    initializeSharedServices();
    
    startServer();
    
    console.log(`Worker ${process.pid} has started`);
}

module.exports = { startWorker };