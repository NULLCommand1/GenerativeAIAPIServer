const NodeCache = require('node-cache');

// Cache lưu trữ thông tin về các context đang bị khóa
// Thiết lập TTL (time-to-live) là 3 phút để tự động giải phóng nếu có lỗi
const contextLockCache = new NodeCache({ stdTTL: 180 });

const contextLockService = {
    acquireLock: (contextId) => {
        if (contextLockCache.has(contextId)) {
            return false; // Context đã bị khóa
        }
        contextLockCache.set(contextId, true);
        return true;
    },

    releaseLock: (contextId) => {
        contextLockCache.del(contextId);
    },

    isLocked: (contextId) => {
        return contextLockCache.has(contextId);
    }
};

module.exports = contextLockService;