
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Singleton chat instance to maintain history during the session
let chatSession: Chat | null = null;

export const getChatResponse = async (userMessage: string): Promise<string> => {
  try {
    if (!apiKey) {
        return "I'm sorry, but the API key is missing. Please configure it to chat.";
    }

    if (!chatSession) {
      chatSession = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: `You are Jake.0, an energetic, motivational, and highly practical productivity AI coach. 
          You help users track their tasks, build habits, and stay focused.
          Keep your responses concise, encouraging, and action-oriented.
          If the user asks about productivity tips, give specific, actionable advice (like Pomodoro, time-blocking).
          Use emojis occasionally to keep the tone friendly.`,
        },
      });
    }

    const response: GenerateContentResponse = await chatSession.sendMessage({
      message: userMessage,
    });

    return response.text || "I'm having a bit of trouble thinking right now. Try again?";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I couldn't connect to the server. Please check your connection.";
  }
};

export const generateTaskSuggestions = async (): Promise<string[]> => {
  if (!apiKey) return ["Review daily goals", "Clear email inbox", "Take a 5 min stretch"];
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Generate 3 short, specific, and actionable productivity tasks for a software developer or professional. Return ONLY the 3 tasks separated by commas, no numbering or other text.",
    });
    
    const text = response.text || "";
    return text.split(',').map(t => t.trim()).filter(t => t.length > 0).slice(0, 3);
  } catch (error) {
    console.error("Suggestion Error:", error);
    return ["Plan tomorrow's agenda", "Organize workspace", "Update documentation"];
  }
};

export const generateProductivityInsight = async (metrics: any): Promise<string> => {
   if (!apiKey) return "Great consistency! Try to maintain this momentum tomorrow.";

   try {
     const prompt = `Analyze this productivity data: ${JSON.stringify(metrics)}. Give a single, short (max 15 words), encouraging sentence about the user's performance.`;
     const response = await ai.models.generateContent({
       model: 'gemini-2.5-flash',
       contents: prompt,
     });
     return response.text || "You're doing great! Keep pushing forward.";
   } catch (error) {
     return "Consistency is key to long-term success!";
   }
};

export const generateImprovementTips = async (): Promise<string[]> => {
    if (!apiKey) {
        return [
            "Use the Pomodoro technique to manage fatigue.",
            "Break large tasks into smaller sub-tasks.",
            "Block distractions during deep work sessions."
        ];
    }
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: "Give me 3 short, distinct, bullet-point style tips to strictly improve productivity based on general best practices. Return only the tips separated by pipes '|'.",
        });
        const text = response.text || "";
        return text.split('|').map(t => t.trim()).filter(t => t.length > 0).slice(0, 3);
    } catch (e) {
        return ["Prioritize your top 3 tasks daily.", "Eliminate multitasking.", "Review your goals weekly."];
    }
}
