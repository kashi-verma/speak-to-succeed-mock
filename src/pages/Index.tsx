
import { useState } from 'react';
import InterviewWelcome from '../components/InterviewWelcome';
import InterviewSession from '../components/InterviewSession';
import InterviewResults from '../components/InterviewResults';

export type InterviewPhase = 'welcome' | 'active' | 'completed';

const Index = () => {
  const [currentPhase, setCurrentPhase] = useState<InterviewPhase>('welcome');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [interviewData, setInterviewData] = useState<any>(null);

  const startInterview = (role: string) => {
    setSelectedRole(role);
    setCurrentPhase('active');
  };

  const completeInterview = (data: any) => {
    setInterviewData(data);
    setCurrentPhase('completed');
  };

  const resetInterview = () => {
    setCurrentPhase('welcome');
    setSelectedRole('');
    setInterviewData(null);
  };

  return (
    <div className="min-h-screen">
      {currentPhase === 'welcome' && (
        <InterviewWelcome onStartInterview={startInterview} />
      )}
      
      {currentPhase === 'active' && (
        <InterviewSession 
          role={selectedRole}
          onCompleteInterview={completeInterview}
          onBackToWelcome={resetInterview}
        />
      )}
      
      {currentPhase === 'completed' && (
        <InterviewResults 
          data={interviewData}
          onStartNew={resetInterview}
        />
      )}
    </div>
  );
};

export default Index;
