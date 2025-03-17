const express = require('express');
const mainRoutes = require('./routes/main.routes');
const db = require('./models/db.models');
const cors = require('cors');
const { errorHandlingMiddleware, expressJsonMiddleware } = require('./middlewares/main.middlewares');
const timeout = require('connect-timeout');
const { IP_ALWAYS_DATA, PORT_ALWAYS_DATA } = require('./constants/main.constants');
const cluster = require('cluster');
const os = require('os');

const app = express();

app.use(timeout('180s'));
app.use(cors());
expressJsonMiddleware(app);
app.use('/', mainRoutes);
errorHandlingMiddleware(app);

const startServer = async () => {
    try {
        await db.sequelize.authenticate();
        app.listen(PORT_ALWAYS_DATA, IP_ALWAYS_DATA, () => {
            console.log('App running on AlwaysData');
        });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
};

if (cluster.isMaster) {
    const numCPUs = os.cpus().length;
    console.log(`Master ${process.pid} is running`);
    
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
    
    cluster.on('exit', (worker) => {
        console.log(`Worker ${worker.process.pid} has exited`);
        cluster.fork();
    });
} else {
    startServer();
    console.log(`Worker ${process.pid} has started`);
}