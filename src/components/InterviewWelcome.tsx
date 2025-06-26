
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, Users, Target, Star } from 'lucide-react';

interface InterviewWelcomeProps {
  onStartInterview: (role: string) => void;
}

const InterviewWelcome = ({ onStartInterview }: InterviewWelcomeProps) => {
  const roles = [
    {
      title: 'Software Engineer',
      description: 'Technical questions, coding challenges, system design',
      icon: '👨‍💻'
    },
    {
      title: 'Data Analyst',
      description: 'SQL queries, data interpretation, statistical analysis',
      icon: '📊'
    },
    {
      title: 'Product Manager',
      description: 'Product strategy, user experience, stakeholder management',
      icon: '🚀'
    },
    {
      title: 'Marketing Manager',
      description: 'Campaign strategy, market analysis, brand management',
      icon: '📈'
    }
  ];

  const features = [
    {
      icon: <Mic className="w-6 h-6 text-blue-600" />,
      title: 'Voice-Powered',
      description: 'Natural speech interaction with AI interviewer'
    },
    {
      icon: <Users className="w-6 h-6 text-green-600" />,
      title: 'Realistic Experience',
      description: 'Professional interview simulation with follow-up questions'
    },
    {
      icon: <Target className="w-6 h-6 text-purple-600" />,
      title: 'Role-Specific',
      description: 'Tailored questions for your target position'
    },
    {
      icon: <Star className="w-6 h-6 text-orange-600" />,
      title: 'Instant Feedback',
      description: 'Get insights on your interview performance'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          AI Mock Interview
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Practice your interviewing skills with AI-powered mock interviews. 
          Get realistic experience and build confidence for your next job opportunity.
        </p>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {features.map((feature, index) => (
          <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-center mb-4">
              {feature.icon}
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
            <p className="text-sm text-gray-600">{feature.description}</p>
          </Card>
        ))}
      </div>

      {/* Role Selection */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
          Choose Your Interview Role
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roles.map((role, index) => (
            <Card 
              key={index} 
              className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105"
              onClick={() => onStartInterview(role.title)}
            >
              <CardHeader className="text-center">
                <div className="text-4xl mb-2">{role.icon}</div>
                <CardTitle className="text-lg">{role.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-sm">
                  {role.description}
                </CardDescription>
                <Button className="w-full mt-4" variant="outline">
                  Start Interview
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <div className="bg-white rounded-lg p-8 shadow-lg inline-block">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Practice?
          </h3>
          <p className="text-gray-600 mb-6">
            Select a role above to begin your personalized mock interview experience.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Mic className="w-4 h-4" />
            <span>Make sure your microphone is enabled</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewWelcome;
