import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export interface ActivityData {
  dayOfWeek: string;
  hour: number;
  intensity: number;
}

export interface PostingSuggestion {
  dayOfWeek: string;
  hour: number;
  reason: string;
  score: number;
}

export const geminiService = {
  suggestBestPostingTimes: async (activityLogs: ActivityData[]): Promise<PostingSuggestion[]> => {
    const prompt = `
      Analyze the following audience activity logs and suggest the 5 best posting times (day and hour).
      Activity Logs:
      ${JSON.stringify(activityLogs, null, 2)}
      
      Look for patterns of high intensity. Consider both peak times and "low-competition" high-growth times.
      
      CRITICAL INSTRUCTION: Analyze the data. If the user context (e.g. Activity Logs) or previous interactions were in Khmer, provide the "reason" field in Khmer. If in English, provide it in English. If ambiguous, prioritize Khmer for local audience.
      
      Return the results as an array of objects with dayOfWeek, hour, reason (concise explanation), and score (0-1).
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                dayOfWeek: { type: Type.STRING },
                hour: { type: Type.NUMBER },
                reason: { type: Type.STRING },
                score: { type: Type.NUMBER }
              },
              required: ["dayOfWeek", "hour", "reason", "score"]
            }
          }
        }
      });

      const text = response.text;
      if (!text) throw new Error("No response from Gemini");
      return JSON.parse(text);
    } catch (error) {
      console.error("Error in geminiService.suggestBestPostingTimes:", error);
      return [];
    }
  },

  trainAIOnActivity: async (rawDescription: string): Promise<ActivityData[]> => {
    const prompt = `
      Interpret the following user-provided audience activity description and convert it into a structured list of activity peaks.
      User Description: "${rawDescription}"
      
      Output format: Array of objects with { dayOfWeek, hour (0-23), intensity (0-1) }.
      Translate vague terms like "evenings", "mornings", "lunchtime" into specific hours.
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                dayOfWeek: { type: Type.STRING },
                hour: { type: Type.NUMBER },
                intensity: { type: Type.NUMBER }
              },
              required: ["dayOfWeek", "hour", "intensity"]
            }
          }
        }
      });

      const text = response.text;
      if (!text) throw new Error("No response from Gemini");
      return JSON.parse(text);
    } catch (error) {
      console.error("Error in geminiService.trainAIOnActivity:", error);
      return [];
    }
  },

  generateContentDraft: async (platform: string, reason: string): Promise<string> => {
    const prompt = `
      Generate a short, viral-ready social media post for ${platform}.
      The context/reason for posting at this time is: "${reason}".
      
      CRITICAL INSTRUCTION: Detect the language of the 'reason'.
      - If 'reason' is in Khmer, respond ENTIRELY in Khmer.
      - If 'reason' is in English, respond ENTIRELY in English.
      
      Write ONLY the content of the post. Include relevant hashtags. 
      Keep it engaging and professional yet trendy.
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });

      return response.text.trim();
    } catch (error) {
      console.error("Error generating content draft:", error);
      return "Engaging content coming soon! 🚀 #StayTuned";
    }
  }
};
