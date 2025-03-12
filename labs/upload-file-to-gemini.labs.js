const { GoogleAIFileManager } = require("@google/generative-ai/server");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const getResponse = async () => {
    const generativeAI = new GoogleGenerativeAI('AIzaSyD1X8bnbF0p4qw04tsaFS9xpDvshhs5quw');
    const fileManager = new GoogleAIFileManager('AIzaSyD1X8bnbF0p4qw04tsaFS9xpDvshhs5quw');
    const model = generativeAI.getGenerativeModel({
        model: "gemini-1.5-flash",
    });

    const uploadResponse1 = await fileManager.uploadFile("./files/text.pdf", {
        mimeType: "application/pdf",
        displayName: "PDF 1",
    });

    // const uploadResponse2 = await fileManager.uploadFile("./files/text2.txt", {
    //     mimeType: "text/plain",
    //     displayName: "Text 2",
    // });

    const chat = model.startChat({
        history: [
            {
                role: "user",
                parts: [{ text: "Xin chào, tôi 20 tuổi" }, {
                    fileData: {
                        mimeType: uploadResponse1.file.mimeType,
                        fileUri: uploadResponse1.file.uri,
                    },
                }],
            },
            {
                role: "model",
                parts: [{ text: "Tôi đã ghi nhớ thông tin của bạn" }],
            },
        ],
    });

    const result = await chat.sendMessage([
        { text: "Chương 5 nói gì?" },
    ]);

    console.log(result.response.text());
};

getResponse();