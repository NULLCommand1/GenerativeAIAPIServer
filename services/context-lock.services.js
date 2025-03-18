const contextLockService = {
    acquireLock: async (contextId) => {
        return await global.contextLockService.acquireLock(contextId);
    },

    releaseLock: async (contextId) => {
        return await global.contextLockService.releaseLock(contextId);
    },

    isLocked: async (contextId) => {
        return await global.contextLockService.isLocked(contextId);
    }
};

module.exports = contextLockService;