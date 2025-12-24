
import { GoogleGenAI, Type } from "@google/genai";
import { DialoguePart } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

const STORY_SYSTEM_PROMPT = `
You are a creative writer for a high-quality visual novel game titled "Oshiete! Rui-kun!!". 
The theme is a cute, pastel-colored, dreamy school-life or fantasy-romance aesthetic.
The story follows 'Rui-kun', a charming but slightly mysterious student.

Your task is to generate the next 3-4 lines of dialogue for a scene.
Each response MUST be in JSON format matching the schema.
Keep the tone warm, engaging, and atmospheric.
Language: Korean.
`;

export const generateStoryNext = async (history: DialoguePart[], userAction?: string): Promise<DialoguePart[]> => {
  try {
    const context = history.slice(-5).map(h => `${h.speaker}: ${h.text}`).join('\n');
    const prompt = userAction 
      ? `User action: ${userAction}\nContinue the story from this context:\n${context}`
      : `Start a new charming scene in the school library or music room with Rui-kun.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: STORY_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              speaker: { type: Type.STRING, description: "The name of the character speaking." },
              text: { type: Type.STRING, description: "The dialogue text in Korean." },
              emotion: { type: Type.STRING, description: "One word emotion: neutral, happy, sad, surprised, blushing." }
            },
            required: ["speaker", "text"]
          }
        }
      }
    });

    const result = JSON.parse(response.text || "[]");
    return result;
  } catch (error) {
    console.error("Gemini Error:", error);
    return [{ speaker: "System", text: "이야기를 불러오는 도중 오류가 발생했습니다." }];
  }
};
