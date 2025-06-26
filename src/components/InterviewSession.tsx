
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, Volume2, ArrowLeft, Square } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import VoiceVisualizer from './VoiceVisualizer';
import ApiKeyInput from './ApiKeyInput';
import { AIInterviewService, AIInterviewConfig } from '../services/aiInterviewService';

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
  const [currentTopic, setCurrentTopic] = useState('Introduction');
  const [apiKey, setApiKey] = useState<string>('');
  const [aiService, setAiService] = useState<AIInterviewService | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
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

  const handleApiKeySubmit = async (key: string) => {
    setApiKey(key);
    const service = new AIInterviewService(key);
    setAiService(service);
    setHasStarted(true);
    
    // Start with AI-generated first question
    setIsProcessing(true);
    try {
      const config: AIInterviewConfig = {
        role,
        currentTopic: 'Introduction',
        conversationHistory: [],
        questionCount: 0
      };
      
      const response = await service.generateNextQuestion(config);
      const firstQuestion = response.question;
      
      setCurrentQuestion(firstQuestion);
      setConversation([{ type: 'ai' as const, content: firstQuestion }]);
      if (response.newTopic) {
        setCurrentTopic(response.newTopic);
      }
      
      speakQuestion(firstQuestion);
    } catch (error) {
      toast({
        title: "Error starting interview",
        description: "Please check your API key and try again.",
        variant: "destructive"
      });
      setHasStarted(false);
    } finally {
      setIsProcessing(false);
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
        if (hasStarted) {
          startListening();
        }
      };
      
      synthesisRef.current.speak(utterance);
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening && !isProcessing) {
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

  const handleUserResponse = async (response: string) => {
    if (response.trim().length === 0 || !aiService) return;
    
    stopListening();
    setIsProcessing(true);
    
    const updatedConversation = [...conversation, { type: 'user' as const, content: response }];
    setConversation(updatedConversation);
    
    // Check if user wants to end interview
    if (response.toLowerCase().includes('end interview') || response.toLowerCase().includes('finish interview')) {
      endInterview();
      return;
    }

    try {
      const config: AIInterviewConfig = {
        role,
        currentTopic,
        conversationHistory: updatedConversation,
        questionCount: questionCount + 1
      };
      
      const aiResponse = await aiService.generateNextQuestion(config);
      
      if (!aiResponse.shouldContinue) {
        // AI decided to end the interview
        const finalMessage = aiResponse.question;
        setConversation(prev => [...prev, { type: 'ai' as const, content: finalMessage }]);
        speakQuestion(finalMessage);
        
        setTimeout(() => {
          endInterview();
        }, 3000);
        return;
      }
      
      // Continue with next question
      setCurrentQuestion(aiResponse.question);
      setQuestionCount(prev => prev + 1);
      
      if (aiResponse.newTopic) {
        setCurrentTopic(aiResponse.newTopic);
      }
      
      const finalConversation = [...updatedConversation, { type: 'ai' as const, content: aiResponse.question }];
      setConversation(finalConversation);
      speakQuestion(aiResponse.question);
      
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast({
        title: "AI Error",
        description: "There was an issue with the AI service. Please try again.",
        variant: "destructive"
      });
      
      // Fallback question
      const fallbackQuestion = "Can you tell me more about that experience?";
      setCurrentQuestion(fallbackQuestion);
      setConversation(prev => [...prev, { type: 'ai' as const, content: fallbackQuestion }]);
      speakQuestion(fallbackQuestion);
    } finally {
      setIsProcessing(false);
    }
  };

  const endInterview = () => {
    stopListening();
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
    }
    
    setTimeout(() => {
      onCompleteInterview({
        role,
        questionsAnswered: questionCount,
        conversation,
        duration: Date.now(),
        aiPowered: true
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
            AI {role} Interview
          </h1>
          <div></div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            AI-Powered Interview Experience
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Experience a dynamic interview with our AI interviewer that adapts questions based on your responses, 
            asks intelligent follow-ups, and provides a realistic interview simulation.
          </p>
        </div>

        <ApiKeyInput 
          onApiKeySubmit={handleApiKeySubmit} 
          isLoading={isProcessing}
        />
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
          AI {role} Interview
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
              Current Topic: {currentTopic}
            </span>
            <span className="text-sm text-gray-500">
              AI-Powered Interview
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {questionCount} questions asked
          </div>
        </div>

        {/* Current Question */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-blue-600" />
              AI Interviewer
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
            
            {isProcessing && (
              <div className="flex items-center justify-center gap-2 text-purple-600">
                <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                <span className="font-medium">AI is thinking...</span>
              </div>
            )}
            
            {isListening && !isProcessing && (
              <div className="flex items-center justify-center gap-2 text-green-600">
                <Mic className="w-5 h-5 animate-pulse" />
                <span className="font-medium">Listening for your response...</span>
              </div>
            )}
            
            {!isSpeaking && !isListening && !isProcessing && (
              <div className="flex items-center justify-center gap-2 text-gray-500">
                <MicOff className="w-5 h-5" />
                <span>Click the microphone to respond</span>
              </div>
            )}
          </div>

          {!isSpeaking && !isProcessing && (
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
    </div>
  );
};

export default InterviewSession;
