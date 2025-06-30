//Added Welcome functionaly 
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Users, Code, Mic, Volume2, MessageSquare, Brain, Zap, Target } from 'lucide-react';
import Logo from './Logo';

interface InterviewWelcomeProps {
  onStartInterview: (role: string) => void;
}

const InterviewWelcome = ({ onStartInterview }: InterviewWelcomeProps) => {
  const [selectedRole, setSelectedRole] = useState<string>('');

  const roles = [
    {
      id: 'software-engineer',
      title: 'Software Engineer',
      icon: Code,
      description: 'AI-powered technical questions covering algorithms, data structures, system design, and coding challenges.',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      iconColor: 'text-blue-600'
    },
    {
      id: 'product-manager',
      title: 'Product Manager',
      icon: Users,
      description: 'Dynamic questions about product vision, stakeholder management, and strategic decision-making.',
      color: 'bg-green-100 text-green-800 border-green-200',
      iconColor: 'text-green-600'
    },
    {
      id: 'business-analyst',
      title: 'Business Analyst',
      icon: Briefcase,
      description: 'Adaptive questions focused on business processes, requirements gathering, and analytical thinking.',
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      iconColor: 'text-purple-600'
    }
  ];

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Questions',
      description: 'Dynamic questions that adapt based on your responses using advanced AI'
    },
    {
      icon: Zap,
      title: 'Real-time Adaptation',
      description: 'Follow-up questions generated in real-time based on your answers'
    },
    {
      icon: Target,
      title: 'Role-Specific Focus',
      description: 'Questions tailored specifically for your target position'
    },
    {
      icon: Mic,
      title: 'Voice Recognition',
      description: 'Practice speaking naturally with voice-to-text technology'
    },
    {
      icon: Volume2,
      title: 'Audio Feedback',
      description: 'Hear questions spoken aloud for a realistic experience'
    },
    {
      icon: MessageSquare,
      title: 'Natural Conversation',
      description: 'Experience realistic interview dialogue flow'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header with Logo */}
      <div className="text-center mb-8 md:mb-12">
        <div className="flex justify-center mb-4 md:mb-6">
          <Logo className="scale-100 md:scale-125" />
        </div>
        <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4 px-2">
          AI-Powered Interview Mastery
        </h1>
        <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto px-4 mb-4">
          Experience the future of interview preparation with our advanced AI interviewer. 
          Get dynamic, adaptive questions that respond to your answers in real-time.
        </p>
        <div className="flex items-center justify-center gap-2 text-purple-600">
          <Brain className="w-5 h-5" />
          <span className="font-semibold">Powered by Google Gemini AI</span>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
        {features.map((feature, index) => (
          <div key={index} className="text-center p-4 md:p-6 bg-white rounded-lg shadow-sm border">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3 md:mb-4">
              <feature.icon className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
            </div>
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
            <p className="text-sm md:text-base text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* AI Features Highlight */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6 md:p-8 mb-8 md:mb-12">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Brain className="w-6 h-6 md:w-8 md:h-8 text-purple-600" />
            <h2 className="text-xl md:text-2xl font-bold text-purple-800">
              What Makes This Different?
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 text-left">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-purple-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-purple-800">Dynamic Follow-ups</h4>
                  <p className="text-purple-700 text-sm">AI asks relevant follow-up questions based on your specific answers</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-purple-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-purple-800">Adaptive Difficulty</h4>
                  <p className="text-purple-700 text-sm">Questions adjust in complexity based on your responses</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Brain className="w-5 h-5 text-purple-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-purple-800">Realistic Conversations</h4>
                  <p className="text-purple-700 text-sm">Experience natural interview dialogue flow</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-purple-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-purple-800">Contextual Understanding</h4>
                  <p className="text-purple-700 text-sm">AI remembers and builds upon your previous answers</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Role Selection */}
      <div className="mb-6 md:mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-center text-gray-900 mb-2">
          Choose Your Interview Role
        </h2>
        <p className="text-center text-gray-600 mb-6 md:mb-8 px-4">
          Select the position you're preparing for to get AI-tailored questions
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {roles.map((role) => (
            <Card 
              key={role.id} 
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedRole === role.id 
                  ? 'ring-2 ring-purple-500 shadow-lg' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedRole(role.id)}
            >
              <CardHeader className="text-center pb-3 md:pb-4">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <role.icon className={`w-6 h-6 md:w-8 md:h-8 ${role.iconColor}`} />
                </div>
                <CardTitle className="text-lg md:text-xl">{role.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm md:text-base text-gray-600 text-center mb-4">{role.description}</p>
                <div className="flex justify-center">
                  <Badge variant="secondary" className={role.color}>
                    {selectedRole === role.id ? 'Selected' : 'AI-Powered'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Start Button */}
      <div className="text-center px-4">
        <Button 
          size="lg" 
          onClick={() => selectedRole && onStartInterview(selectedRole)}
          disabled={!selectedRole}
          className="w-full sm:w-auto px-6 md:px-8 py-3 text-base md:text-lg bg-gradient-to-r from-purple-600 to-blue-700 hover:from-purple-700 hover:to-blue-800"
        >
          <Brain className="w-4 h-4 md:w-5 md:h-5 mr-2" />
          Start AI Mock Interview
        </Button>
        {!selectedRole && (
          <p className="text-sm text-gray-500 mt-2">
            Please select a role to continue
          </p>
        )}
      </div>
    </div>
  );
};

export default InterviewWelcome;
