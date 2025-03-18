const channels = require('../cluster/ipc-channels.cluster');

function initializeSharedServices() {
    const pendingCallbacks = new Map();
    let messageIdCounter = 0;
    
    process.on('message', (message) => {
        const callback = pendingCallbacks.get(message.id);
        if (callback) {
            callback(message);
            pendingCallbacks.delete(message.id);
        }
    });
    
    function sendMessageToMaster(type, data) {
        return new Promise((resolve) => {
            const id = messageIdCounter++;
            pendingCallbacks.set(id, (response) => {
                resolve(response);
            });
            
            process.send({
                type,
                id,
                ...data
            });
        });
    }
    
    global.contextLockService = {
        acquireLock: async (contextId) => {
            const response = await sendMessageToMaster(channels.CONTEXT_LOCK_ACQUIRE, { contextId });
            return response.success;
        },
        
        releaseLock: async (contextId) => {
            const response = await sendMessageToMaster(channels.CONTEXT_LOCK_RELEASE, { contextId });
            return response.success;
        },
        
        isLocked: async (contextId) => {
            const response = await sendMessageToMaster(channels.CONTEXT_LOCK_CHECK, { contextId });
            return response.isLocked;
        }
    };
    
    global.responseCacheService = {
        get: async (key) => {
            const response = await sendMessageToMaster(channels.CACHE_GET, { key });
            return response.value;
        },
        
        set: async (key, value, ttl = 300) => { // mặc định 5 phút
            const response = await sendMessageToMaster(channels.CACHE_SET, { key, value, ttl });
            return response.success;
        }
    };
}

module.exports = { initializeSharedServices };