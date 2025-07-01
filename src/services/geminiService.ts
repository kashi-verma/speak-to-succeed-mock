//added gemini api key 
const GEMINI_API_KEY = 'AIzaSyAmkIDFpbR39rQHG1HDhdFRrHvm7VIiPq0';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export interface GeminiMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface GeminiResponse {
  candidates: {
    content: {
      parts: { text: string }[];
      role: string;
    };
    finishReason: string;
  }[];
}

export class GeminiService {
  private conversationHistory: GeminiMessage[] = [];
  
  async generateQuestion(role: string, previousQuestions: string[] = [], userResponse?: string): Promise<string> {
    try {
      const systemPrompt = this.getSystemPrompt(role);
      const userPrompt = this.getUserPrompt(previousQuestions, userResponse);
      
      if (this.conversationHistory.length === 0) {
        // Initialize conversation with system context
        this.conversationHistory.push({
          role: 'user',
          parts: [{ text: systemPrompt + '\n\n' + userPrompt }]
        });
      } else if (userResponse) {
        // Add user response to history
        this.conversationHistory.push({
          role: 'user',
          parts: [{ text: `My answer: ${userResponse}\n\nPlease provide the next interview question.` }]
        });
      }

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: this.conversationHistory,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data: GeminiResponse = await response.json();
      const aiResponse = data.candidates[0]?.content?.parts[0]?.text || 'Could you tell me more about your background?';
      
      // Add AI response to history
      this.conversationHistory.push({
        role: 'model',
        parts: [{ text: aiResponse }]
      });

      return aiResponse;
    } catch (error) {
      console.error('Error generating question:', error);
      // Fallback to basic questions
      return this.getFallbackQuestion(previousQuestions.length);
    }
  }

  private getSystemPrompt(role: string): string {
    const roleContext = {
      'software-engineer': 'You are conducting a technical interview for a Software Engineer position. Focus on coding skills, algorithms, system design, and technical problem-solving.',
      'product-manager': 'You are conducting an interview for a Product Manager position. Focus on product strategy, stakeholder management, prioritization, and business acumen.',
      'business-analyst': 'You are conducting an interview for a Business Analyst position. Focus on analytical thinking, requirements gathering, process improvement, and data analysis.'
    };

    return `You are an experienced interviewer conducting a mock interview for a ${role.replace('-', ' ')} position. ${roleContext[role as keyof typeof roleContext] || 'Focus on relevant skills and experience for this role.'}

Guidelines:
- Ask one question at a time
- Make questions progressively more challenging
- Ask follow-up questions based on the candidate's responses
- Keep questions professional and relevant to the role
- Limit your response to just the question, no additional commentary
- Make the interview feel natural and conversational`;
  }

  private getUserPrompt(previousQuestions: string[], userResponse?: string): string {
    if (previousQuestions.length === 0) {
      return 'Please start the interview with an opening question.';
    }
    
    if (userResponse) {
      return `Based on my previous answer, please ask the next relevant interview question.`;
    }
    
    return 'Please continue with the next interview question.';
  }

  private getFallbackQuestion(questionIndex: number): string {
    const fallbackQuestions = [
      "Tell me about yourself and your background.",
      "Why are you interested in this position?",
      "What are your greatest strengths?",
      "Describe a challenging situation you faced and how you handled it.",
      "Where do you see yourself in 5 years?"
    ];
    
    return fallbackQuestions[questionIndex % fallbackQuestions.length] || "Thank you for your time. Do you have any questions for me?";
  }

  resetConversation(): void {
    this.conversationHistory = [];
  }
}

export const geminiService = new GeminiService();
