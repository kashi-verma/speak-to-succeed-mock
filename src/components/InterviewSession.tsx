
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, Volume2, ArrowLeft, Square, Brain } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import VoiceVisualizer from './VoiceVisualizer';
import { geminiService } from '../services/geminiService';

interface InterviewSessionProps {
  role: string;
  onCompleteInterview: (data: any) => void;
  onBackToWelcome: () => void;
}

const InterviewSession = ({ role, onCompleteInterview, onBackToWelcome }: InterviewSessionProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [conversation, setConversation] = useState<Array<{ type: 'ai' | 'user', content: string }>>([]);
  const [hasStarted, setHasStarted] = useState(false);
  const [questionsAsked, setQuestionsAsked] = useState<string[]>([]);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);

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

  const startInterview = async () => {
    setHasStarted(true);
    setIsLoadingQuestion(true);
    
    toast({
      title: "AI Interview Started",
      description: "Generating your first question...",
    });

    try {
      const firstQuestion = await geminiService.generateQuestion(role);
      setCurrentQuestion(firstQuestion);
      setQuestionsAsked([firstQuestion]);
      setConversation([{ type: 'ai', content: firstQuestion }]);
      speakQuestion(firstQuestion);
    } catch (error) {
      console.error('Error starting interview:', error);
      toast({
        title: "Error",
        description: "Failed to start AI interview. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingQuestion(false);
    }
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

  const handleAnswer = async (answer: string) => {
    if (answer.trim().length === 0) return;
    
    stopListening();
    const newConversation = [...conversation, { type: 'user' as const, content: answer }];
    setConversation(newConversation);
    
    // Check if we should end the interview (after 8-10 questions)
    if (questionsAsked.length >= 8) {
      endInterview(newConversation);
      return;
    }

    setIsLoadingQuestion(true);
    
    try {
      const nextQuestion = await geminiService.generateQuestion(role, questionsAsked, answer);
      setCurrentQuestion(nextQuestion);
      setQuestionsAsked(prev => [...prev, nextQuestion]);
      
      const updatedConversation = [...newConversation, { type: 'ai' as const, content: nextQuestion }];
      setConversation(updatedConversation);
      
      setTimeout(() => {
        speakQuestion(nextQuestion);
      }, 1000);
    } catch (error) {
      console.error('Error generating next question:', error);
      toast({
        title: "Error",
        description: "Failed to generate next question. Ending interview.",
        variant: "destructive"
      });
      endInterview(newConversation);
    } finally {
      setIsLoadingQuestion(false);
    }
  };

  const endInterview = (finalConversation = conversation) => {
    stopListening();
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
    }
    
    // Reset the Gemini service conversation
    geminiService.resetConversation();
    
    setTimeout(() => {
      onCompleteInterview({
        role,
        questionsAnswered: Math.ceil(finalConversation.length / 2),
        conversation: finalConversation,
        duration: Date.now(),
        aiPowered: true
      });
    }, 1000);
  };

  if (!hasStarted) {
    return (
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <Button 
            variant="ghost" 
            onClick={onBackToWelcome}
            className="flex items-center gap-2 text-sm md:text-base"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Roles</span>
            <span className="sm:hidden">Back</span>
          </Button>
          <h1 className="text-lg md:text-2xl font-bold text-gray-900 text-center flex-1 mx-4">
            AI {role.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Interview
          </h1>
          <div className="w-16 md:w-20"></div>
        </div>

        <div className="text-center mb-6 md:mb-8">
          <div className="flex justify-center mb-4">
            <Brain className="w-12 h-12 md:w-16 md:h-16 text-purple-600" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4 px-2">
            Ready for Your AI Mock Interview?
          </h2>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto mb-6 md:mb-8 px-4">
            Experience a dynamic AI-powered interview that adapts to your responses. 
            The AI interviewer will ask follow-up questions and provide a realistic interview experience 
            tailored specifically for the {role.replace('-', ' ')} role.
          </p>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 md:p-6 mb-6 mx-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Brain className="w-5 h-5 text-purple-600" />
              <span className="font-semibold text-purple-800">AI-Powered Features</span>
            </div>
            <ul className="text-sm md:text-base text-purple-700 space-y-1">
              <li>• Adaptive questioning based on your responses</li>
              <li>• Dynamic follow-up questions</li>
              <li>• Realistic interview conversation flow</li>
              <li>• Role-specific question generation</li>
            </ul>
          </div>
        </div>

        <div className="text-center px-4">
          <Button 
            size="lg" 
            onClick={startInterview}
            className="w-full sm:w-auto px-6 md:px-8 py-3 text-base md:text-lg bg-gradient-to-r from-purple-600 to-blue-700 hover:from-purple-700 hover:to-blue-800"
          >
            <Brain className="w-4 h-4 md:w-5 md:h-5 mr-2" />
            Start AI Interview
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <Button 
          variant="ghost" 
          onClick={onBackToWelcome}
          className="flex items-center gap-2 text-sm md:text-base"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Roles</span>
          <span className="sm:hidden">Back</span>
        </Button>
        <h1 className="text-lg md:text-2xl font-bold text-gray-900 text-center flex-1 mx-2 md:mx-4 flex items-center justify-center gap-2">
          <Brain className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
          AI {role.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Interview
        </h1>
        <Button 
          variant="destructive" 
          onClick={() => endInterview()}
          className="flex items-center gap-2 text-sm md:text-base"
        >
          <Square className="w-4 h-4" />
          <span className="hidden sm:inline">End Interview</span>
          <span className="sm:hidden">End</span>
        </Button>
      </div>

      <div className="space-y-4 md:space-y-6">
        {/* Progress */}
        <div className="bg-white rounded-lg p-3 md:p-4 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-600" />
              Question {questionsAsked.length}
            </span>
            <span className="text-sm text-purple-600 font-medium">
              AI-Powered Interview
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (questionsAsked.length / 8) * 100)}%` }}
            />
          </div>
        </div>

        {/* Current Question */}
        <Card>
          <CardHeader className="pb-3 md:pb-4">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Volume2 className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
              AI Interview Question
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingQuestion ? (
              <div className="flex items-center gap-2 text-purple-600">
                <Brain className="w-5 h-5 animate-pulse" />
                <span className="text-base md:text-lg">AI is generating your next question...</span>
              </div>
            ) : (
              <p className="text-base md:text-lg text-gray-800 leading-relaxed">
                {currentQuestion || "Welcome! Let's begin your interview."}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Voice Controls */}
        <div className="text-center">
          <VoiceVisualizer isListening={isListening} isSpeaking={isSpeaking} />
          
          <div className="mt-4 md:mt-6 space-y-2">
            {isSpeaking && (
              <div className="flex items-center justify-center gap-2 text-blue-600">
                <Volume2 className="w-4 h-4 md:w-5 md:h-5 animate-pulse" />
                <span className="font-medium text-sm md:text-base">AI is asking question...</span>
              </div>
            )}
            
            {isLoadingQuestion && (
              <div className="flex items-center justify-center gap-2 text-purple-600">
                <Brain className="w-4 h-4 md:w-5 md:h-5 animate-pulse" />
                <span className="font-medium text-sm md:text-base">AI is thinking...</span>
              </div>
            )}
            
            {isListening && (
              <div className="flex items-center justify-center gap-2 text-green-600">
                <Mic className="w-4 h-4 md:w-5 md:h-5 animate-pulse" />
                <span className="font-medium text-sm md:text-base">Listening for your answer...</span>
              </div>
            )}
            
            {!isSpeaking && !isListening && !isLoadingQuestion && (
              <div className="flex items-center justify-center gap-2 text-gray-500">
                <MicOff className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-sm md:text-base">Ready for your response...</span>
              </div>
            )}
          </div>

          {!isSpeaking && !isLoadingQuestion && (
            <Button
              size="lg"
              onClick={isListening ? stopListening : startListening}
              className={`mt-4 w-full sm:w-auto text-sm md:text-base ${isListening ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 md:w-5 md:h-5 mr-2" />
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
