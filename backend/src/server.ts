import { createApp } from './app';
import dotenv from 'dotenv';
dotenv.config();

console.log("DeepSeek from env:", process.env.DEEPSEEK_API_KEY);

const port = process.env.PORT || 3001;
const app = createApp();
app.listen(port, () => console.log(`Backend listening on ${port}`));
