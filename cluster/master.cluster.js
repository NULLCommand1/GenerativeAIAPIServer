const cluster = require('cluster');
const os = require('os');
const channels = require('./ipc-channels.cluster');

function startMaster() {
    const contextLocks = new Map();
    const responseCache = new Map();
    
    const numCPUs = os.cpus().length;
    console.log(`Master ${process.pid} is running`);
    
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
    
    cluster.on('message', (worker, message) => {
        if (message.type === channels.CONTEXT_LOCK_ACQUIRE) {
            const isLocked = contextLocks.has(message.contextId);
            if (!isLocked) {
                contextLocks.set(message.contextId, {
                    workerId: worker.id,
                    timestamp: Date.now()
                });
            }
            worker.send({
                type: channels.CONTEXT_LOCK_ACQUIRE_RESULT,
                id: message.id,
                success: !isLocked,
                contextId: message.contextId
            });
        } 
        else if (message.type === channels.CONTEXT_LOCK_RELEASE) {
            contextLocks.delete(message.contextId);
            worker.send({
                type: channels.CONTEXT_LOCK_RELEASE_RESULT,
                id: message.id,
                success: true,
                contextId: message.contextId
            });
        } 
        else if (message.type === channels.CONTEXT_LOCK_CHECK) {
            const isLocked = contextLocks.has(message.contextId);
            worker.send({
                type: channels.CONTEXT_LOCK_CHECK_RESULT,
                id: message.id,
                isLocked,
                contextId: message.contextId
            });
        }
        else if (message.type === channels.CACHE_GET) {
            const cachedValue = responseCache.get(message.key);
            worker.send({
                type: channels.CACHE_GET_RESULT,
                id: message.id,
                value: cachedValue,
                key: message.key
            });
        }
        else if (message.type === channels.CACHE_SET) {
            if (message.ttl) {
                setTimeout(() => {
                    responseCache.delete(message.key);
                }, message.ttl * 1000);
            }
            responseCache.set(message.key, message.value);
            worker.send({
                type: channels.CACHE_SET_RESULT,
                id: message.id,
                success: true,
                key: message.key
            });
        }
    });
    
    setInterval(() => {
        const now = Date.now();
        contextLocks.forEach((value, key) => {
            if (now - value.timestamp > 180000) {
                contextLocks.delete(key);
                console.log(`Auto released expired lock for context: ${key}`);
            }
        });
    }, 30000);
    
    cluster.on('exit', (worker) => {
        console.log(`Worker ${worker.process.pid} has exited`);
        
        contextLocks.forEach((value, key) => {
            if (value.workerId === worker.id) {
                contextLocks.delete(key);
                console.log(`Released lock for context: ${key} after worker exit`);
            }
        });
        
        cluster.fork();
    });
}

module.exports = { startMaster };