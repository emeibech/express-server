import { Configuration, OpenAIApi } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openAIKey = process.env.API_OPENAI_KEY_VALUE;
const configuration = new Configuration({ apiKey: openAIKey });
const openai = new OpenAIApi(configuration);

export default openai;
