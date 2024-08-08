"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const generativeAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY as string
);

const model = generativeAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export default async function getRecipe(prompt: string) {
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  return text;
}
