
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Users, Code, Mic, Volume2, MessageSquare } from 'lucide-react';
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
      description: 'Technical questions covering algorithms, data structures, system design, and coding challenges.',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      iconColor: 'text-blue-600'
    },
    {
      id: 'product-manager',
      title: 'Product Manager',
      icon: Users,
      description: 'Strategic questions about product vision, stakeholder management, and decision-making.',
      color: 'bg-green-100 text-green-800 border-green-200',
      iconColor: 'text-green-600'
    },
    {
      id: 'business-analyst',
      title: 'Business Analyst',
      icon: Briefcase,
      description: 'Questions focused on business processes, requirements gathering, and analytical thinking.',
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      iconColor: 'text-purple-600'
    }
  ];

  const features = [
    {
      icon: MessageSquare,
      title: 'Structured Questions',
      description: 'Curated questions designed specifically for each role'
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
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header with Logo */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-6">
          <Logo className="scale-125" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Master Your Interview Skills
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Practice with our structured interview simulator designed to help you succeed in your next job interview.
          Get role-specific questions, real-time feedback, and build confidence.
        </p>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {features.map((feature, index) => (
          <div key={index} className="text-center p-6 bg-white rounded-lg shadow-sm border">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <feature.icon className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* Role Selection */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
          Choose Your Interview Role
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Select the position you're preparing for to get tailored questions
        </p>
        
        <div className="grid md:grid-cols-3 gap-6">
          {roles.map((role) => (
            <Card 
              key={role.id} 
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedRole === role.id 
                  ? 'ring-2 ring-blue-500 shadow-lg' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedRole(role.id)}
            >
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <role.icon className={`w-8 h-8 ${role.iconColor}`} />
                </div>
                <CardTitle className="text-xl">{role.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center mb-4">{role.description}</p>
                <div className="flex justify-center">
                  <Badge variant="secondary" className={role.color}>
                    {selectedRole === role.id ? 'Selected' : 'Available'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Start Button */}
      <div className="text-center">
        <Button 
          size="lg" 
          onClick={() => selectedRole && onStartInterview(selectedRole)}
          disabled={!selectedRole}
          className="px-8 py-3 text-lg bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
        >
          Start Mock Interview
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
