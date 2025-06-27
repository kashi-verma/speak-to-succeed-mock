
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, MessageSquare, RotateCcw, Brain } from 'lucide-react';

interface InterviewResultsProps {
  data: {
    role: string;
    questionsAnswered: number;
    conversation: Array<{ type: 'ai' | 'user', content: string }>;
    duration: number;
    aiPowered?: boolean;
  };
  onStartNew: () => void;
}

const InterviewResults = ({ data, onStartNew }: InterviewResultsProps) => {
  const userResponses = data.conversation.filter(item => item.type === 'user');
  const avgResponseLength = userResponses.reduce((acc, response) => acc + response.content.length, 0) / userResponses.length;

  // Enhanced feedback for AI-powered interviews
  const feedback = [
    {
      category: 'Communication',
      score: Math.min(100, Math.max(60, Math.round(avgResponseLength / 2))),
      feedback: avgResponseLength > 150 ? 'Excellent detailed responses that demonstrate depth of knowledge!' : 
                avgResponseLength > 100 ? 'Good level of detail in your responses.' : 
                'Consider providing more detailed examples in your answers.'
    },
    {
      category: 'Engagement',
      score: Math.min(100, Math.max(70, (data.questionsAnswered / 8) * 100)),
      feedback: data.questionsAnswered >= 8 ? 'Outstanding engagement throughout the entire interview!' : 
                data.questionsAnswered >= 5 ? 'Good participation and interview completion.' : 
                'Consider completing more questions to demonstrate full engagement.'
    },
    {
      category: 'Adaptability',
      score: data.aiPowered ? Math.min(95, 75 + (data.questionsAnswered * 2)) : 85,
      feedback: data.aiPowered ? 'Great job adapting to AI-generated follow-up questions!' : 
                'Maintained good responses throughout structured questions.'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-6 md:mb-8">
        <div className="flex justify-center mb-4">
          <CheckCircle className="w-12 h-12 md:w-16 md:h-16 text-green-500" />
        </div>
        <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2 px-2">
          Interview Complete!
        </h1>
        <p className="text-lg md:text-xl text-gray-600 flex items-center justify-center gap-2 px-4">
          {data.aiPowered && <Brain className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />}
          Great job on your {data.aiPowered ? 'AI-powered' : ''} {data.role} mock interview
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        <Card className="text-center">
          <CardHeader className="pb-3 md:pb-4">
            <MessageSquare className="w-6 h-6 md:w-8 md:h-8 text-blue-600 mx-auto mb-2" />
            <CardTitle className="text-xl md:text-2xl">{data.questionsAnswered}</CardTitle>
            <CardDescription className="text-sm md:text-base">Questions Answered</CardDescription>
          </CardHeader>
        </Card>
        
        <Card className="text-center">
          <CardHeader className="pb-3 md:pb-4">
            <Clock className="w-6 h-6 md:w-8 md:h-8 text-green-600 mx-auto mb-2" />
            <CardTitle className="text-xl md:text-2xl">~{Math.round(data.questionsAnswered * 2.5)}</CardTitle>
            <CardDescription className="text-sm md:text-base">Minutes Duration</CardDescription>
          </CardHeader>
        </Card>
        
        <Card className="text-center">
          <CardHeader className="pb-3 md:pb-4">
            {data.aiPowered ? <Brain className="w-6 h-6 md:w-8 md:h-8 text-purple-600 mx-auto mb-2" /> : <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-purple-600 mx-auto mb-2" />}
            <CardTitle className="text-xl md:text-2xl">{Math.round(feedback.reduce((sum, f) => sum + f.score, 0) / feedback.length)}%</CardTitle>
            <CardDescription className="text-sm md:text-base">Overall Score</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {data.aiPowered && (
        <Card className="mb-6 md:mb-8 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-800 text-base md:text-lg">
              <Brain className="w-4 h-4 md:w-5 md:h-5" />
              AI-Powered Interview Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-purple-700 text-sm md:text-base">
              You completed an advanced AI-powered interview that adapted questions based on your responses. 
              The AI interviewer provided personalized follow-ups and dynamically adjusted the conversation flow, 
              giving you a more realistic and challenging interview experience.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Feedback */}
      <Card className="mb-6 md:mb-8">
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Performance Feedback</CardTitle>
          <CardDescription className="text-sm md:text-base">Areas of strength and improvement</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 md:space-y-6">
          {feedback.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-900 text-sm md:text-base">{item.category}</h3>
                <span className="text-sm font-medium text-gray-600">{item.score}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${item.score}%` }}
                />
              </div>
              <p className="text-sm text-gray-600">{item.feedback}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Conversation Summary */}
      <Card className="mb-6 md:mb-8">
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Interview Conversation</CardTitle>
          <CardDescription className="text-sm md:text-base">Review your interview dialogue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 md:space-y-4 max-h-80 md:max-h-96 overflow-y-auto">
            {data.conversation.map((message, index) => (
              <div 
                key={index} 
                className={`p-3 md:p-4 rounded-lg ${
                  message.type === 'ai' 
                    ? 'bg-blue-50 border-l-4 border-blue-500' 
                    : 'bg-green-50 border-l-4 border-green-500'
                }`}
              >
                <div className="flex items-start gap-2 md:gap-3">
                  <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-white text-xs md:text-sm font-bold ${
                    message.type === 'ai' ? 'bg-blue-500' : 'bg-green-500'
                  }`}>
                    {message.type === 'ai' ? (data.aiPowered ? '🤖' : 'AI') : 'YOU'}
                  </div>
                  <p className="text-gray-800 leading-relaxed flex-1 text-sm md:text-base">
                    {message.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="text-center space-y-4 px-4">
        <Button 
          size="lg" 
          onClick={onStartNew}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-sm md:text-base"
        >
          <RotateCcw className="w-4 h-4 md:w-5 md:h-5 mr-2" />
          Start New Interview
        </Button>
        
        <div className="text-sm text-gray-500">
          {data.aiPowered ? 'Experience more dynamic AI interviews!' : 'Keep practicing to improve your interview skills!'}
        </div>
      </div>
    </div>
  );
};

export default InterviewResults;
