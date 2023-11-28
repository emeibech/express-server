import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openAIKey = process.env.API_OPENAI_KEY_VALUE;
const openai = new OpenAI({ apiKey: openAIKey });

export default openai;
