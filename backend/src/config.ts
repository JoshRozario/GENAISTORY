import dotenv from "dotenv";
dotenv.config();

if (!process.env.DEEPSEEK_API_KEY) {
  throw new Error("Missing DEEPSEEK_API_KEY in .env");
}

export const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
