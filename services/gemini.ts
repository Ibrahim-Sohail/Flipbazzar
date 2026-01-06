
import { GoogleGenAI, FunctionDeclaration, Type, Content, Part } from "@google/genai";
import { searchInventory } from "./mockInventory";
import { Product, User } from "../types";

// Configuration for Rotation
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

    this.modelIndex++;
    if (this.modelIndex >= MODEL_POOL.length) {
      this.modelIndex = 0;
      this.keyIndex = (this.keyIndex + 1) % API_KEY_POOL.length;
    }

    return config;
  }

  async executeWithRotation<T>(operation: (ai: GoogleGenAI, model: string) => Promise<T>): Promise<T> {
    if (API_KEY_POOL.length === 0) {
        throw new Error("MISSING_KEYS");
    }

    const totalCombos = Math.max(API_KEY_POOL.length * MODEL_POOL.length, 1);
    let lastError: any = null;

    for (let i = 0; i < totalCombos; i++) {
      const config = this.getNextConfig();
      if (!config) break;

      const ai = new GoogleGenAI({ apiKey: config.apiKey });
      try {
        return await operation(ai, config.model);
      } catch (error: any) {
        lastError = error;
        const isTransient = error.status === 429 || error.status === 503 || error.message?.toLowerCase().includes('rate limit');
        
        if (isTransient && i < totalCombos - 1) {
          console.warn(`Transient error on ${config.model}. Rotating...`);
          continue; 
        }
        throw error;
      }
    }
    throw lastError || new Error("All API slots exhausted.");
  }
}

const rotator = new AIController();

const searchInventoryTool: FunctionDeclaration = {
  name: "searchFlipbazzarInventory",
  description: "Search FlipBazzar's high-tech inventory for gadgets. Returns products with prices in PKR.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: { type: Type.STRING, description: "Tech keywords (e.g. 'PS5', 'Titanium iPhone')." },
      category: { type: Type.STRING, description: "smartphone, laptop, audio, gaming, wearable, etc." },
      maxPrice: { type: Type.NUMBER, description: "Budget limit in PKR." },
    },
  },
};

const getSystemInstruction = (user?: User) => `
You are the "FlipBazzar Tech Brain", the premium AI shopping assistant for FlipBazzar.
User: ${user ? user.name : 'Customer'}.

STRICT RULES:
1. ALWAYS use PKR (Pakistani Rupees) for all price mentions. Format as "Rs. X" or "X PKR".
2. ONLY discuss tech gadgets, electronics, hardware, and related software. 
3. If asked about clothing, food, jokes, or non-tech: "I'm exclusively here for tech advice at FlipBazzar. Let's find you the best gear!"
4. Use Markdown Tables for product specs or comparisons.
5. Keep descriptions professional and concise.
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
  try {
    return await rotator.executeWithRotation(async (ai, model) => {
      const validHistory = history.length > 0 && history[0].role === 'model' ? history.slice(1) : history;

      const result = await ai.models.generateContent({
        model: model,
        contents: [...validHistory, { role: 'user', parts: [{ text: userMessage }] }],
        config: {
          systemInstruction: getSystemInstruction(user),
          tools: [{ functionDeclarations: [searchInventoryTool] }],
          temperature: 0.1,
        }
      });

      const candidate = result.candidates?.[0];
      if (!candidate) throw new Error("API returned no response.");

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

        return { text: final.text || "I found some tech matched to your query.", foundProducts: results };
      }

      return { text: candidate.content.parts[0]?.text || "I'm here to assist with your tech needs." };
    });
  } catch (err: any) {
    if (err.message === "MISSING_KEYS") {
        return { text: "⚠️ **Setup Required**: No API Keys were found in the server environment." };
    }
    return { text: `⚠️ **Processing Error**: ${err.message || "My circuits are briefly overloaded. Please try again."}` };
  }
};
