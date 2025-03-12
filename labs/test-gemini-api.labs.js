const { GoogleGenerativeAI } = require('@google/generative-ai');
let getResponse = async (apiKey, modelAI, prompt) => {
    let genAI = new GoogleGenerativeAI(apiKey);
    let model = genAI.getGenerativeModel({ model: modelAI });
    let result = await model.generateContent(prompt);
    return result.response.text();
}

getResponse('AIzaSyC_yzgLklPQIbLeJUi1t69LEenOw5dT63o', 'gemini-1.5-pro', 'Write a story about a magic backpack.').then(result => {
    console.log(result);
});