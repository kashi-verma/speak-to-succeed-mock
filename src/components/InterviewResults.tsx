
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, MessageSquare, RotateCcw } from 'lucide-react';

interface InterviewResultsProps {
  data: {
    role: string;
    questionsAnswered: number;
    conversation: Array<{ type: 'ai' | 'user', content: string }>;
    duration: number;
  };
  onStartNew: () => void;
}

const InterviewResults = ({ data, onStartNew }: InterviewResultsProps) => {
  const userResponses = data.conversation.filter(item => item.type === 'user');
  const avgResponseLength = userResponses.reduce((acc, response) => acc + response.content.length, 0) / userResponses.length;

  const feedback = [
    {
      category: 'Communication',
      score: Math.min(100, Math.max(60, Math.round(avgResponseLength / 2))),
      feedback: avgResponseLength > 100 ? 'Great detail in your responses!' : 'Try to provide more detailed answers.'
    },
    {
      category: 'Engagement',
      score: Math.round((data.questionsAnswered / 5) * 100),
      feedback: data.questionsAnswered >= 4 ? 'Excellent engagement throughout!' : 'Good participation, consider completing more questions.'
    },
    {
      category: 'Professionalism',
      score: 85, // Mock score
      feedback: 'Maintained professional tone throughout the interview.'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Interview Complete!
        </h1>
        <p className="text-xl text-gray-600">
          Great job on your {data.role} mock interview
        </p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="text-center">
          <CardHeader>
            <MessageSquare className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <CardTitle className="text-2xl">{data.questionsAnswered}</CardTitle>
            <CardDescription>Questions Answered</CardDescription>
          </CardHeader>
        </Card>
        
        <Card className="text-center">
          <CardHeader>
            <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <CardTitle className="text-2xl">~{Math.round(data.questionsAnswered * 2)}</CardTitle>
            <CardDescription>Minutes Duration</CardDescription>
          </CardHeader>
        </Card>
        
        <Card className="text-center">
          <CardHeader>
            <CheckCircle className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <CardTitle className="text-2xl">{Math.round(feedback.reduce((sum, f) => sum + f.score, 0) / feedback.length)}%</CardTitle>
            <CardDescription>Overall Score</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Feedback */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Performance Feedback</CardTitle>
          <CardDescription>Areas of strength and improvement</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {feedback.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">{item.category}</h3>
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
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Interview Conversation</CardTitle>
          <CardDescription>Review your interview dialogue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {data.conversation.map((message, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-lg ${
                  message.type === 'ai' 
                    ? 'bg-blue-50 border-l-4 border-blue-500' 
                    : 'bg-green-50 border-l-4 border-green-500'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                    message.type === 'ai' ? 'bg-blue-500' : 'bg-green-500'
                  }`}>
                    {message.type === 'ai' ? 'AI' : 'YOU'}
                  </div>
                  <p className="text-gray-800 leading-relaxed flex-1">
                    {message.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="text-center space-y-4">
        <Button 
          size="lg" 
          onClick={onStartNew}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Start New Interview
        </Button>
        
        <div className="text-sm text-gray-500">
          Keep practicing to improve your interview skills!
        </div>
      </div>
    </div>
  );
};

export default InterviewResults;
