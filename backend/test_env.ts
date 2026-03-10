import dotenv from 'dotenv';
dotenv.config();

console.log('GROQ_API_KEY set:', !!process.env.GROQ_API_KEY);
console.log('GEMINI_API_KEY set:', !!process.env.GEMINI_API_KEY);
console.log('PORT:', process.env.PORT);
console.log('DATABASE_URL set:', !!process.env.DATABASE_URL);
