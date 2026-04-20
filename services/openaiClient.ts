import OpenAI from 'openai';
import { OPENAI_API_KEY } from '@env';

const apiKey = OPENAI_API_KEY;

if (!apiKey) {
  console.warn('OPENAI_API_KEY is not set. Copy .env.example to .env and add your key.');
}

const openaiClient = new OpenAI({
  apiKey: apiKey ?? '',
});

export default openaiClient;