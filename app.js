const cluster = require('cluster');
const { startMaster } = require('./cluster/master.cluster');
const { startWorker } = require('./cluster/worker.cluster');
require('dotenv').config();

if (cluster.isMaster) {
    startMaster();
} else {
    startWorker();
}