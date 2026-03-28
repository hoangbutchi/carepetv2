const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI("AIzaSyCRqYdzYdDts5EgeLgG8kBJCyTetwZcavY");
async function run() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hello!");
        console.log(result.response.text());
    } catch(e) {
        console.error(e);
    }
}
run();
