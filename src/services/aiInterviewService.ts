
export interface AIInterviewConfig {
  role: string;
  currentTopic: string;
  conversationHistory: Array<{ type: 'ai' | 'user', content: string }>;
  questionCount: number;
}

export interface AIResponse {
  question: string;
  shouldContinue: boolean;
  newTopic?: string;
  feedback?: string;
}

export class AIInterviewService {
  private apiKey: string;
  private baseURL = 'https://api.openai.com/v1/chat/completions';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateNextQuestion(config: AIInterviewConfig): Promise<AIResponse> {
    const systemPrompt = this.buildSystemPrompt(config.role);
    const conversationContext = this.buildConversationContext(config);

    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4.1-2025-04-14',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: conversationContext }
          ],
          temperature: 0.7,
          max_tokens: 300,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const aiMessage = data.choices[0].message.content;

      return this.parseAIResponse(aiMessage, config.questionCount);
    } catch (error) {
      console.error('AI Service Error:', error);
      return {
        question: "I apologize, but I'm having trouble connecting to the AI service. Let's continue with a general question: Can you tell me more about your experience?",
        shouldContinue: true
      };
    }
  }

  private buildSystemPrompt(role: string): string {
    return `You are an experienced HR interviewer conducting a comprehensive interview for a ${role} position. 

Your responsibilities:
- Ask relevant, insightful questions based on the candidate's responses
- Probe deeper when answers are vague or incomplete
- Cover different aspects: technical skills, experience, problem-solving, cultural fit
- Ask follow-up questions that build on previous answers
- Maintain a professional but friendly tone
- Decide when to move to new topics or end the interview (after 8-12 questions)

Response format:
- Start with "QUESTION:" followed by your question
- If you want to end the interview, start with "END_INTERVIEW:" followed by closing remarks
- If moving to a new topic, include "NEW_TOPIC:" followed by the topic name
- Keep questions conversational and specific to their role

Guidelines:
- Ask one question at a time
- Build on their previous responses
- Be encouraging and professional
- Focus on ${role}-specific skills and scenarios`;
  }

  private buildConversationContext(config: AIInterviewConfig): string {
    const recentHistory = config.conversationHistory.slice(-6); // Last 3 exchanges
    const historyText = recentHistory.map(msg => 
      `${msg.type === 'ai' ? 'Interviewer' : 'Candidate'}: ${msg.content}`
    ).join('\n');

    return `Interview Context:
Role: ${config.role}
Current Topic: ${config.currentTopic}
Question Count: ${config.questionCount}
Recent Conversation:
${historyText}

Please generate the next appropriate question or end the interview if sufficient questions have been asked.`;
  }

  private parseAIResponse(aiMessage: string, questionCount: number): AIResponse {
    if (aiMessage.includes('END_INTERVIEW:')) {
      return {
        question: aiMessage.replace('END_INTERVIEW:', '').trim(),
        shouldContinue: false
      };
    }

    let question = aiMessage;
    let newTopic: string | undefined;

    if (aiMessage.includes('NEW_TOPIC:')) {
      const parts = aiMessage.split('NEW_TOPIC:');
      if (parts.length > 1) {
        newTopic = parts[1].split('\n')[0].trim();
        question = parts[0].replace('QUESTION:', '').trim();
      }
    }

    if (aiMessage.includes('QUESTION:')) {
      question = aiMessage.replace('QUESTION:', '').trim();
    }

    // Auto-end after 12 questions if AI doesn't decide to end
    const shouldContinue = questionCount < 12;

    return {
      question: question.trim(),
      shouldContinue,
      newTopic
    };
  }
}
