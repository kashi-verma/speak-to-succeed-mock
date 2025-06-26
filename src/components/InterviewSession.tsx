
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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [hasStarted, setHasStarted] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);

  // Predefined questions based on role
  const getQuestionsForRole = (role: string) => {
    const baseQuestions = [
      "Tell me about yourself and your background.",
      "Why are you interested in this position?",
      "What are your greatest strengths?",
      "Describe a challenging situation you faced and how you handled it.",
      "Where do you see yourself in 5 years?"
    ];

    const roleSpecificQuestions: { [key: string]: string[] } = {
      'software-engineer': [
        "Explain a complex technical problem you've solved.",
        "How do you approach debugging and troubleshooting?",
        "Describe your experience with different programming languages.",
        "How do you stay updated with new technologies?",
        "Tell me about a project you're particularly proud of."
      ],
      'product-manager': [
        "How do you prioritize features in a product roadmap?",
        "Describe how you would handle conflicting stakeholder requirements.",
        "How do you measure product success?",
        "Tell me about a time you had to make a difficult product decision.",
        "How do you work with engineering teams?"
      ],
      'business-analyst': [
        "How do you gather and analyze business requirements?",
        "Describe your experience with data analysis tools.",
        "How do you handle stakeholder management?",
        "Tell me about a process improvement you implemented.",
        "How do you ensure your analysis leads to actionable insights?"
      ]
    };

    return [...baseQuestions, ...(roleSpecificQuestions[role] || [])];
  };

  const questions = getQuestionsForRole(role);
  const currentQuestion = questions[currentQuestionIndex] || "Thank you for your time today.";

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
          handleAnswer(transcript);
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

  useEffect(() => {
    if (hasStarted && currentQuestionIndex < questions.length) {
      speakQuestion(currentQuestion);
    } else if (hasStarted && currentQuestionIndex >= questions.length) {
      endInterview();
    }
  }, [currentQuestionIndex, hasStarted]);

  const startInterview = () => {
    setHasStarted(true);
    toast({
      title: "Interview Started",
      description: "Listen to the question and respond when prompted.",
    });
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
        if (currentQuestionIndex < questions.length) {
          startListening();
        }
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

  const handleAnswer = (answer: string) => {
    if (answer.trim().length === 0) return;
    
    stopListening();
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);
    
    setTimeout(() => {
      setCurrentQuestionIndex(prev => prev + 1);
    }, 1000);
  };

  const endInterview = () => {
    stopListening();
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
    }
    
    setTimeout(() => {
      onCompleteInterview({
        role,
        questionsAnswered: answers.length,
        conversation: questions.slice(0, answers.length).flatMap((q, i) => [
          { type: 'ai' as const, content: q },
          { type: 'user' as const, content: answers[i] || '' }
        ]),
        duration: Date.now(),
        aiPowered: false
      });
    }, 1000);
  };

  if (!hasStarted) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
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
            {role.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Interview
          </h1>
          <div></div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Start Your Mock Interview?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            You'll be asked {questions.length} questions designed specifically for the {role.replace('-', ' ')} role. 
            Speak naturally and we'll record your responses for feedback.
          </p>
        </div>

        <div className="text-center">
          <Button 
            size="lg" 
            onClick={startInterview}
            className="px-8 py-3 text-lg bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
          >
            Start Interview
          </Button>
        </div>
      </div>
    );
  }

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
          {role.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Interview
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

      <div className="space-y-6">
        {/* Progress */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span className="text-sm text-gray-500">
              Mock Interview
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Current Question */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-blue-600" />
              Interview Question
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
                <span className="font-medium">Playing question...</span>
              </div>
            )}
            
            {isListening && (
              <div className="flex items-center justify-center gap-2 text-green-600">
                <Mic className="w-5 h-5 animate-pulse" />
                <span className="font-medium">Listening for your answer...</span>
              </div>
            )}
            
            {!isSpeaking && !isListening && (
              <div className="flex items-center justify-center gap-2 text-gray-500">
                <MicOff className="w-5 h-5" />
                <span>Waiting for next question...</span>
              </div>
            )}
          </div>

          {!isSpeaking && (
            <Button
              size="lg"
              onClick={isListening ? stopListening : startListening}
              className={`mt-4 ${isListening ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
              disabled={currentQuestionIndex >= questions.length}
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
    </div>
  );
};

export default InterviewSession;
