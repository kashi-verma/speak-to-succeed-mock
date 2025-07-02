//added gemini api key model
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
  private questionCount = 0;
  
  async generateQuestion(role: string, previousQuestions: string[] = [], userResponse?: string): Promise<string> {
    try {
      console.log('Generating question for role:', role);
      console.log('Previous questions:', previousQuestions);
      console.log('User response:', userResponse);
      console.log('Question count:', this.questionCount);

      // First question - initialize with system prompt
      if (this.questionCount === 0) {
        const systemPrompt = this.getSystemPrompt(role);
        this.conversationHistory = [{
          role: 'user',
          parts: [{ text: systemPrompt + '\n\nPlease start the interview with an opening question.' }]
        }];
        this.questionCount++;
      } else if (userResponse) {
        // Add user's response to conversation
        this.conversationHistory.push({
          role: 'user',
          parts: [{ text: `My answer: ${userResponse}\n\nBased on this answer, please ask the next relevant interview question for a ${role.replace('-', ' ')} position. Make it progressively more challenging.` }]
        });
        this.questionCount++;
      }

      console.log('Conversation history:', this.conversationHistory);

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: this.conversationHistory,
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 500,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Gemini API error:', response.status, errorData);
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data: GeminiResponse = await response.json();
      console.log('Gemini response:', data);
      
      const aiResponse = data.candidates[0]?.content?.parts[0]?.text || this.getFallbackQuestion(this.questionCount);
      
      // Add AI response to history
      this.conversationHistory.push({
        role: 'model',
        parts: [{ text: aiResponse }]
      });

      console.log('Generated question:', aiResponse);
      return aiResponse;
    } catch (error) {
      console.error('Error generating question:', error);
      // Return a contextual fallback question
      return this.getFallbackQuestion(this.questionCount);
    }
  }

  private getSystemPrompt(role: string): string {
    const roleContext = {
      'software-engineer': 'You are conducting a technical interview for a Software Engineer position. Ask about coding skills, algorithms, system design, technical problem-solving, past projects, and programming languages.',
      'product-manager': 'You are conducting an interview for a Product Manager position. Ask about product strategy, stakeholder management, prioritization, market analysis, user research, and business metrics.',
      'business-analyst': 'You are conducting an interview for a Business Analyst position. Ask about analytical thinking, requirements gathering, process improvement, data analysis, stakeholder communication, and business process modeling.'
    };

    return `You are an experienced interviewer conducting a mock interview for a ${role.replace('-', ' ')} position. ${roleContext[role as keyof typeof roleContext] || 'Focus on relevant skills and experience for this role.'}

IMPORTANT GUIDELINES:
- Ask ONE question at a time
- Make questions progressively more challenging as the interview progresses
- Ask specific follow-up questions based on the candidate's previous answers
- Keep questions professional and relevant to the ${role.replace('-', ' ')} role
- DO NOT repeat previous questions
- Make each question build upon previous responses
- Limit your response to ONLY the question, no additional commentary
- Vary question types: behavioral, technical, situational, and experience-based
- After 6-8 questions, you can ask if they have questions for you

Remember: This is question #${this.questionCount + 1} in the interview.`;
  }

  private getFallbackQuestion(questionNumber: number): string {
    const fallbackQuestions = [
      "Tell me about yourself and your background.",
      "Why are you interested in this specific position?",
      "What are your greatest professional strengths?",
      "Describe a challenging project you worked on and how you handled it.",
      "How do you stay updated with industry trends and technologies?",
      "Tell me about a time when you had to work with a difficult team member.",
      "What are your career goals for the next 3-5 years?",
      "Do you have any questions about our company or this role?"
    ];
    
    return fallbackQuestions[Math.min(questionNumber - 1, fallbackQuestions.length - 1)] || "Thank you for your time. Do you have any questions for me?";
  }

  resetConversation(): void {
    this.conversationHistory = [];
    this.questionCount = 0;
    console.log('Conversation reset');
  }
}

export const geminiService = new GeminiService();
