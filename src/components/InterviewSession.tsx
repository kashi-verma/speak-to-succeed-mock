import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, Volume2, ArrowLeft, Square } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import VoiceVisualizer from './VoiceVisualizer';

interface InterviewSessionProps {
  role: string;
  onCompleteInterview: (data: any) => void;
  onBackToWelcome: () => void;
}

const InterviewSession = ({ role, onCompleteInterview, onBackToWelcome }: InterviewSessionProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [questionCount, setQuestionCount] = useState(0);
  const [conversation, setConversation] = useState<Array<{ type: 'ai' | 'user', content: string }>>([]);
  const [hasStarted, setHasStarted] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);

  // AI Interview Logic
  const interviewQuestions = {
    'Software Engineer': [
      "Hello, welcome to your mock interview session. Can you tell me a bit about yourself and your background in software engineering?",
      "What programming languages are you most comfortable with and why?",
      "Tell me about a challenging technical problem you've solved recently.",
      "How do you approach debugging complex issues in your code?",
      "What's your experience with version control systems like Git?"
    ],
    'Data Analyst': [
      "Hello, welcome to your mock interview session. Can you tell me about your experience with data analysis?",
      "What data visualization tools have you worked with?",
      "How do you ensure data quality in your analysis?",
      "Tell me about a time when you discovered an interesting insight from data.",
      "What's your approach to presenting complex data to non-technical stakeholders?"
    ],
    'Product Manager': [
      "Hello, welcome to your mock interview session. What drew you to product management?",
      "How do you prioritize features in a product roadmap?",
      "Tell me about a time you had to make a difficult product decision.",
      "How do you gather and incorporate user feedback?",
      "What metrics do you use to measure product success?"
    ],
    'Marketing Manager': [
      "Hello, welcome to your mock interview session. What's your experience in marketing?",
      "How do you measure the success of a marketing campaign?",
      "Tell me about a marketing challenge you've overcome.",
      "What's your approach to understanding target audiences?",
      "How do you stay updated with marketing trends?"
    ]
  };

  const currentQuestions = interviewQuestions[role as keyof typeof interviewQuestions] || interviewQuestions['Software Engineer'];

  useEffect(() => {
    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognitionConstructor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognitionConstructor();
      recognitionRef.current!.continuous = true;
      recognitionRef.current!.interimResults = true;
      recognitionRef.current!.lang = 'en-US';

      recognitionRef.current!.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');

        if (event.results[event.results.length - 1].isFinal) {
          handleUserResponse(transcript);
        }
      };

      recognitionRef.current!.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Speech Recognition Error",
          description: "Please try again or check your microphone permissions.",
          variant: "destructive"
        });
      };
    }

    // Initiative Speech Synthesis
    synthesisRef.current = window.speechSynthesis;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthesisRef.current) {
        synthesisRef.current.cancel();
      }
    };
  }, []);

  const startInterview = () => {
    setHasStarted(true);
    speakQuestion(currentQuestions[0]);
    setCurrentQuestion(currentQuestions[0]);
    setConversation([{ type: 'ai', content: currentQuestions[0] }]);
  };

  const speakQuestion = (question: string) => {
    if (synthesisRef.current) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(question);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onend = () => {
        setIsSpeaking(false);
        startListening();
      };
      
      synthesisRef.current.speak(utterance);
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      setIsListening(false);
      recognitionRef.current.stop();
    }
  };

  const handleUserResponse = (response: string) => {
    if (response.trim().length === 0) return;
    
    stopListening();
    setConversation(prev => [...prev, { type: 'user', content: response }]);
    
    // Check if interview should end
    if (response.toLowerCase().includes('end interview') || questionCount >= currentQuestions.length - 1) {
      endInterview();
      return;
    }

    // Move to next question
    setTimeout(() => {
      const nextQuestionIndex = questionCount + 1;
      if (nextQuestionIndex < currentQuestions.length) {
        const nextQuestion = currentQuestions[nextQuestionIndex];
        setCurrentQuestion(nextQuestion);
        setQuestionCount(nextQuestionIndex);
        setConversation(prev => [...prev, { type: 'ai', content: nextQuestion }]);
        speakQuestion(nextQuestion);
      } else {
        endInterview();
      }
    }, 1000);
  };

  const endInterview = () => {
    stopListening();
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
    }
    
    const finalMessage = "Thank you for completing the mock interview. You did great!";
    speakQuestion(finalMessage);
    
    setTimeout(() => {
      onCompleteInterview({
        role,
        questionsAnswered: questionCount + 1,
        conversation,
        duration: Date.now() // Simple timestamp for demo
      });
    }, 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Button 
          variant="ghost" 
          onClick={onBackToWelcome}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Roles
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {role} Interview
        </h1>
        <Button 
          variant="destructive" 
          onClick={endInterview}
          className="flex items-center gap-2"
        >
          <Square className="w-4 h-4" />
          End Interview
        </Button>
      </div>

      {!hasStarted ? (
        <Card className="text-center p-8">
          <CardHeader>
            <CardTitle className="text-3xl mb-4">Ready to Begin?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-gray-600 mb-8">
              This is your {role} mock interview. The AI interviewer will ask you questions 
              and you can respond naturally using your voice.
            </p>
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-center gap-2 text-gray-500">
                <Mic className="w-5 h-5" />
                <span>Ensure your microphone is working</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-gray-500">
                <Volume2 className="w-5 h-5" />
                <span>Make sure your speakers are on</span>
              </div>
            </div>
            <Button 
              size="lg" 
              onClick={startInterview}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Start Interview
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Progress */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">Progress</span>
              <span className="text-sm text-gray-500">
                {questionCount + 1} of {currentQuestions.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((questionCount + 1) / currentQuestions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Current Question */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-blue-600" />
                Current Question
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-gray-800 leading-relaxed">
                {currentQuestion}
              </p>
            </CardContent>
          </Card>

          {/* Voice Controls */}
          <div className="text-center">
            <VoiceVisualizer isListening={isListening} isSpeaking={isSpeaking} />
            
            <div className="mt-6 space-y-2">
              {isSpeaking && (
                <div className="flex items-center justify-center gap-2 text-blue-600">
                  <Volume2 className="w-5 h-5 animate-pulse" />
                  <span className="font-medium">AI is speaking...</span>
                </div>
              )}
              
              {isListening && (
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <Mic className="w-5 h-5 animate-pulse" />
                  <span className="font-medium">Listening for your response...</span>
                </div>
              )}
              
              {!isSpeaking && !isListening && (
                <div className="flex items-center justify-center gap-2 text-gray-500">
                  <MicOff className="w-5 h-5" />
                  <span>Click the microphone to respond</span>
                </div>
              )}
            </div>

            {!isSpeaking && (
              <Button
                size="lg"
                onClick={isListening ? stopListening : startListening}
                className={`mt-4 ${isListening ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-5 h-5 mr-2" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5 mr-2" />
                    Start Recording
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewSession;
