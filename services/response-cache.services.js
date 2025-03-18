const responseCacheService = {
    get: async (key) => {
        return await global.responseCacheService.get(key);
    },
    
    set: async (key, value, ttl = 300) => {
        return await global.responseCacheService.set(key, value, ttl);
    }
};

module.exports = responseCacheService;