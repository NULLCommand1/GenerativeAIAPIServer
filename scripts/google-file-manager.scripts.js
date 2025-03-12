const { GoogleAIFileManager } = require("@google/generative-ai/server");

const API_KEYS = process.env.API_KEY_LIST.split('|');

async function listAndDeleteFiles(apiKey) {
    const fileManager = new GoogleAIFileManager(apiKey);
    let pageToken = null;
    
    do {
        const listFilesResponse = await fileManager.listFiles({ pageToken });
        pageToken = listFilesResponse.nextPageToken;

        if (listFilesResponse && listFilesResponse.files) {
            const deletePromises = listFilesResponse.files.map(file => {
                return retry(() => fileManager.deleteFile(file.name), {
                    retries: 3,
                    delay: 1000
                }).then(() => {
                    console.log(`Deleted file: ${file.name}`);
                }).catch(err => {
                    console.error(`Failed to delete ${file.name}:`, err);
                });
            });
            
            await Promise.all(deletePromises);
        }
    } while (pageToken);
}

async function retry(fn, { retries = 3, delay = 1000 } = {}) {
    try {
        return await fn();
    } catch (err) {
        if (retries <= 0) throw err;
        await new Promise(resolve => setTimeout(resolve, delay));
        return retry(fn, { retries: retries - 1, delay });
    }
}

async function processAllKeys() {
    const promises = API_KEYS.map(apiKey => listAndDeleteFiles(apiKey).catch(console.error));
    await Promise.all(promises);
}

processAllKeys().catch(console.error);