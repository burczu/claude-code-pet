import Groq from 'groq-sdk';
import { GROQ_API_KEY } from '@env';

if (!GROQ_API_KEY) {
  // eslint-disable-next-line no-console
  console.warn('GROQ_API_KEY is not set. Copy .env.example to .env and add your key.');
}

export const groqClient = new Groq({ apiKey: GROQ_API_KEY ?? '', dangerouslyAllowBrowser: true });
