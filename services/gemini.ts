
import { GoogleGenAI, FunctionDeclaration, Type, Content, Part } from "@google/genai";
import { searchInventory } from "./mockInventory";
import { Product, User } from "../types";

// Configuration for Rotation
// Splits a comma-separated string into an array of usable keys
const API_KEY_POOL = (process.env.API_KEY || "").split(",").map(k => k.trim()).filter(k => k);
const MODEL_POOL = ['gemini-3-flash-preview', 'gemini-3-pro-preview'];

class AIController {
  private keyIndex = 0;
  private modelIndex = 0;

  private getNextConfig() {
    if (API_KEY_POOL.length === 0) return null;

    const config = {
      apiKey: API_KEY_POOL[this.keyIndex],
      model: MODEL_POOL[this.modelIndex]
    };

    // Cycle model first, then key
    this.modelIndex++;
    if (this.modelIndex >= MODEL_POOL.length) {
      this.modelIndex = 0;
      this.keyIndex = (this.keyIndex + 1) % API_KEY_POOL.length;
    }

    return config;
  }

  async executeWithRotation<T>(operation: (ai: GoogleGenAI, model: string) => Promise<T>): Promise<T> {
    const totalCombos = Math.max(API_KEY_POOL.length * MODEL_POOL.length, 2);
    let lastError: any = null;

    for (let i = 0; i < totalCombos; i++) {
      const config = this.getNextConfig();
      if (!config) throw new Error("API Key missing. Please check your environment variables.");

      const ai = new GoogleGenAI({ apiKey: config.apiKey });
      try {
        return await operation(ai, config.model);
      } catch (error: any) {
        lastError = error;
        const isRateLimit = error.status === 429 || error.message?.toLowerCase().includes('rate limit');
        if (isRateLimit) {
          console.warn(`Rotating key due to rate limit...`);
          continue; 
        }
        throw error;
      }
    }
    throw lastError || new Error("All API slots are currently busy.");
  }
}

const rotator = new AIController();

const searchInventoryTool: FunctionDeclaration = {
  name: "searchFlipbazzarInventory",
  description: "Search FlipBazzar's high-tech inventory for smartphones, laptops, and audio gadgets.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: { type: Type.STRING, description: "Tech keywords like 'OLED', '144Hz', 'M3 Chip'." },
      category: { type: Type.STRING, description: "e.g., 'smartphone', 'laptop'." },
      maxPrice: { type: Type.NUMBER, description: "Budget limit." },
    },
  },
};

const getSystemInstruction = (user?: User) => `
You are the "FlipBazzar Tech Brain". 
User: ${user ? user.name : 'Valued Customer'}.

STRICT TECH GUARDRAILS:
1. You ONLY talk about technology, electronics, computers, and gadgetry.
2. If the user asks about ANY non-tech topic (food, travel, humor, history), you MUST say: "I'm your specialized FlipBazzar Tech Assistant. I'm here to help you with gadgets—let's get back to the tech!"
3. No cluttered text. Keep it spacious and professional.

FORMATTING:
- Use MARKDOWN TABLES for any and all product comparisons.
- Use **Bold** for emphasis on product names and prices.
- Use Double Line Breaks between distinct thoughts.
`;

export interface ChatResponse {
  text: string;
  foundProducts?: Product[];
}

export const sendMessageToGemini = async (
  history: Content[],
  userMessage: string,
  user?: User
): Promise<ChatResponse> => {
  return rotator.executeWithRotation(async (ai, model) => {
    const validHistory = history.length > 0 && history[0].role === 'model' ? history.slice(1) : history;

    const result = await ai.models.generateContent({
      model: model,
      contents: [...validHistory, { role: 'user', parts: [{ text: userMessage }] }],
      config: {
        systemInstruction: getSystemInstruction(user),
        tools: [{ functionDeclarations: [searchInventoryTool] }],
        temperature: 0.15, // Extremely focused
      }
    });

    const candidate = result.candidates?.[0];
    if (!candidate) throw new Error("Response empty.");

    const fcParts = candidate.content.parts.filter(p => p.functionCall);
    if (fcParts.length > 0) {
      const fc = fcParts[0].functionCall!;
      const results = await searchInventory(fc.args as any);

      const final = await ai.models.generateContent({
        model: model,
        contents: [
          ...validHistory,
          { role: 'user', parts: [{ text: userMessage }] },
          candidate.content,
          { role: 'user', parts: [{ functionResponse: { name: fc.name, response: { products: results } } }] }
        ],
        config: { systemInstruction: getSystemInstruction(user) }
      });

      return { text: final.text || "Here is what I found in our tech vault.", foundProducts: results };
    }

    return { text: candidate.content.parts[0]?.text || "I'm ready to help with your tech search." };
  }).catch(err => {
    return { text: "⚠️ **Neural Busy**: My processors are currently at capacity. Please try again in a moment." };
  });
};
