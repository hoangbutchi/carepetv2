const { GoogleGenerativeAI } = require('@google/generative-ai');
// Vui lòng sử dụng biến môi trường VITE_GEMINI_API_KEY từ file .env
const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY || "YOUR_API_KEY_HERE");
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
