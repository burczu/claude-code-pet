import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY } from '@env';

if (!GEMINI_API_KEY) {
  console.warn('GEMINI_API_KEY is not set. Copy .env.example to .env and add your key.');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY ?? '');

export const geminiModel = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
});