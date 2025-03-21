const fs = require('fs');
const { Readable } = require('stream');
const path = require('path');
const crypto = require('crypto');
const moment = require('moment-timezone');
const db = require('../models/db.models');

const tts = async (text, voiceId, speed, model) => {
    const auths = process.env.AUTH_TTS_LIST.split('|');

    for (const auth of auths) {
        try {
            const response = await fetch("https://api.ttsopenai.com/api/v1/text-to-speech-stream", {
                headers: {
                    accept: "application/json",
                    authorization: auth,
                    "content-type": "application/json"
                },
                body: JSON.stringify({ model, speed, input: text, voice_id: voiceId }),
                method: "POST"
            });

            if (!response.ok) {
                throw new Error("Failed to initiate text-to-speech conversion");
            }

            const { uuid } = await response.json();

            let mediaUrl = '';
            for (let i = 0; i < 10; i++) {
                getMediaResponse = await fetch(`https://api.ttsopenai.com/api/v1/history/${uuid}`, {
                    headers: {
                        accept: "application/json",
                        authorization: auth
                    },
                    method: "GET"
                });


                if (!getMediaResponse.ok) {
                    throw new Error("Failed to get media");
                }

                const jsonResponse = await getMediaResponse.json();
                mediaUrl = jsonResponse['media_url'];
                if (!mediaUrl) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                    continue;
                }
                break;
            }
            return mediaUrl;
        } catch (error) {
            console.error(`Error with auth ${auth}: ${error.message}`);
            continue;
        }
    }
    return null;
}

const splitTextIntelligent = async (text) => {
    const maxLength = 300;
    const punctuation = ['.', '!', '?', ',', ';', ':'];

    const splitByPunctuation = (str) => {
        for (let i = maxLength; i >= 0; i--) {
            if (punctuation.includes(str[i])) {
                return i + 1;
            }
        }
        return maxLength;
    };

    const result = [];
    while (text.length > maxLength) {
        const splitIndex = splitByPunctuation(text);
        result.push(text.slice(0, splitIndex).trim());
        text = text.slice(splitIndex).trim();
    }
    if (text.length > 0) {
        result.push(text);
    }
    return result;
}

const fetchMp3 = async (url) => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Lỗi HTTP: ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
}

const mergeMp3Buffers = async (urls) => {
    const buffers = await Promise.all(urls.map(url => fetchMp3(url)));
    const mergedBuffer = Buffer.concat(buffers);
    return mergedBuffer;
}

const saveBufferToFile = async (buffer, text, voiceId) => {
    const hash = crypto.createHash('md5')
        .update(text + voiceId + Date.now())
        .digest('hex');
    const fileName = `tts-${hash}.mp3`;

    const filePath = path.join(__dirname, '../public/tts-audio', fileName);

    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    await fs.promises.writeFile(filePath, buffer);

    return fileName;
}

const ttsService = {
    ttsIntelligent: async (text, voiceId, speed, model) => {
        const splitText = await splitTextIntelligent(text);
        const result = [];
        const mediaUrls = await Promise.all(splitText.map(async (chunk) => {
            const mediaUrl = await tts(chunk, voiceId, speed, model);
            if (!mediaUrl) {
                throw new Error("Failed to create TTS, please check credit balance");
            }
            return mediaUrl;
        }));
        result.push(...mediaUrls);
        const bufferMedia = await mergeMp3Buffers(result);

        const fileName = await saveBufferToFile(bufferMedia, text, voiceId);
        const url = process.env.APP_URL + '/files/tts-audio/' + fileName;
        const transaction = await db.sequelize.transaction();
        let createAt = moment.tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DD HH:mm:ss");
        try {
            await db.SpeechRecords.create({ recordName: fileName, serverUrl: url, createdAt: createAt, updatedAt: createAt }, { transaction });
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw new Error("Failed to save speech record");
        }
        return { url, timestamp: createAt };
    },

};

module.exports = { ttsService };