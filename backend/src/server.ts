import { createApp } from './app';
import dotenv from 'dotenv';
dotenv.config();

const port = process.env.PORT || 3001;
const app = createApp();
app.listen(port, () => console.log(`Backend listening on ${port}`));
