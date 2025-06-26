
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
  const [currentTopic, setCurrentTopic] = useState(0);
  const [questionsPerTopic, setQuestionsPerTopic] = useState(0);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);

  // Enhanced AI Interview Logic with multiple topics and follow-ups
  const interviewStructure = {
    'Software Engineer': {
      topics: [
        {
          name: 'Background & Experience',
          questions: [
            "Hello, welcome to your mock interview session. Can you tell me about yourself and your software engineering background?",
            "What programming languages are you most comfortable with and why did you choose them?",
            "How many years of experience do you have in software development?",
            "What type of projects have you worked on recently?"
          ],
          followUps: [
            "Can you elaborate more on that specific technology?",
            "What challenges did you face in that project?",
            "How did you overcome those technical difficulties?",
            "What would you do differently if you had to redo that project?"
          ]
        },
        {
          name: 'Technical Skills',
          questions: [
            "Tell me about a challenging technical problem you've solved recently.",
            "How do you approach debugging complex issues in your code?",
            "What's your experience with version control systems like Git?",
            "How do you ensure code quality in your projects?"
          ],
          followUps: [
            "Can you walk me through your debugging process step by step?",
            "What tools do you use for code review?",
            "How do you handle merge conflicts?",
            "What testing strategies do you implement?"
          ]
        },
        {
          name: 'Problem Solving',
          questions: [
            "Describe a time when you had to learn a new technology quickly.",
            "How do you stay updated with the latest technology trends?",
            "Tell me about a time you disagreed with a technical decision.",
            "How do you handle tight deadlines in development projects?"
          ],
          followUps: [
            "What resources did you use to learn that technology?",
            "How long did it take you to become proficient?",
            "What was the outcome of that disagreement?",
            "How do you prioritize tasks when under pressure?"
          ]
        }
      ]
    },
    'Data Analyst': {
      topics: [
        {
          name: 'Background & Experience',
          questions: [
            "Hello, welcome to your mock interview session. Can you tell me about your experience with data analysis?",
            "What data analysis tools and technologies are you proficient in?",
            "What types of datasets have you worked with?",
            "How do you approach a new data analysis project?"
          ],
          followUps: [
            "Which tool do you prefer and why?",
            "What was the largest dataset you've analyzed?",
            "How do you handle missing or inconsistent data?",
            "What's your process for data validation?"
          ]
        },
        {
          name: 'Technical Skills',
          questions: [
            "What data visualization tools have you worked with?",
            "How do you ensure data quality in your analysis?",
            "Tell me about your experience with SQL and databases.",
            "What statistical methods do you commonly use?"
          ],
          followUps: [
            "Can you describe a complex visualization you've created?",
            "What's your approach to data cleaning?",
            "How do you optimize SQL queries for large datasets?",
            "When would you use regression analysis versus other methods?"
          ]
        },
        {
          name: 'Business Impact',
          questions: [
            "Tell me about a time when you discovered an interesting insight from data.",
            "How do you present complex data to non-technical stakeholders?",
            "Describe a project where your analysis influenced business decisions.",
            "How do you measure the success of your analysis?"
          ],
          followUps: [
            "What was the business impact of that insight?",
            "How do you simplify technical concepts for executives?",
            "What was the outcome of that business decision?",
            "What metrics do you track to validate your analysis?"
          ]
        }
      ]
    },
    'Product Manager': {
      topics: [
        {
          name: 'Background & Experience',
          questions: [
            "Hello, welcome to your mock interview session. What drew you to product management?",
            "What products have you managed in your career?",
            "How do you define a successful product?",
            "What's your experience with product lifecycle management?"
          ],
          followUps: [
            "What aspects of product management do you enjoy most?",
            "What was your biggest product success?",
            "How do you measure product success?",
            "How do you handle product failures or setbacks?"
          ]
        },
        {
          name: 'Strategy & Prioritization',
          questions: [
            "How do you prioritize features in a product roadmap?",
            "Tell me about a time you had to make a difficult product decision.",
            "How do you balance user needs with business objectives?",
            "What frameworks do you use for product planning?"
          ],
          followUps: [
            "What criteria do you use for prioritization?",
            "How did you gather data to make that decision?",
            "Can you give me an example of this balance?",
            "How do you adapt your roadmap when priorities change?"
          ]
        },
        {
          name: 'User & Market Focus',
          questions: [
            "How do you gather and incorporate user feedback?",
            "What metrics do you use to measure product success?",
            "How do you conduct market research for new features?",
            "Tell me about a time you pivoted based on user feedback."
          ],
          followUps: [
            "What methods do you use to collect feedback?",
            "Which metrics are most important for your products?",
            "How do you validate market demand?",
            "What was the result of that pivot?"
          ]
        }
      ]
    },
    'Marketing Manager': {
      topics: [
        {
          name: 'Background & Experience',
          questions: [
            "Hello, welcome to your mock interview session. What's your experience in marketing?",
            "What marketing channels have you worked with?",
            "How do you approach developing a marketing strategy?",
            "What types of campaigns have you managed?"
          ],
          followUps: [
            "Which marketing channel has been most effective for you?",
            "What's your process for market research?",
            "Can you describe your most successful campaign?",
            "How do you adapt strategies for different audiences?"
          ]
        },
        {
          name: 'Campaign Management',
          questions: [
            "How do you measure the success of a marketing campaign?",
            "Tell me about a marketing challenge you've overcome.",
            "What's your approach to budget allocation across channels?",
            "How do you A/B test your marketing initiatives?"
          ],
          followUps: [
            "What KPIs do you focus on most?",
            "What strategies did you use to overcome that challenge?",
            "How do you determine ROI for different channels?",
            "Can you share an example of a successful A/B test?"
          ]
        },
        {
          name: 'Audience & Analytics',
          questions: [
            "What's your approach to understanding target audiences?",
            "How do you stay updated with marketing trends?",
            "Tell me about your experience with marketing analytics.",
            "How do you personalize marketing messages for different segments?"
          ],
          followUps: [
            "What research methods do you use for audience analysis?",
            "Which trends are you most excited about currently?",
            "What analytics tools do you prefer?",
            "Can you give me an example of successful personalization?"
          ]
        }
      ]
    }
  };

  const currentStructure = interviewStructure[role as keyof typeof interviewStructure] || interviewStructure['Software Engineer'];

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

  const startInterview = () => {
    setHasStarted(true);
    setCurrentTopic(0);
    setQuestionsPerTopic(0);
    const firstQuestion = currentStructure.topics[0].questions[0];
    speakQuestion(firstQuestion);
    setCurrentQuestion(firstQuestion);
    setConversation([{ type: 'ai', content: firstQuestion }]);
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

  const getNextQuestion = () => {
    const currentTopicData = currentStructure.topics[currentTopic];
    
    // If we haven't asked all main questions for this topic
    if (questionsPerTopic < currentTopicData.questions.length) {
      return currentTopicData.questions[questionsPerTopic];
    }
    
    // If we've asked all main questions, ask follow-ups (up to 2 per topic)
    if (questionsPerTopic < currentTopicData.questions.length + 2) {
      const followUpIndex = questionsPerTopic - currentTopicData.questions.length;
      return currentTopicData.followUps[followUpIndex % currentTopicData.followUps.length];
    }
    
    // Move to next topic
    const nextTopic = currentTopic + 1;
    if (nextTopic < currentStructure.topics.length) {
      setCurrentTopic(nextTopic);
      setQuestionsPerTopic(0);
      return currentStructure.topics[nextTopic].questions[0];
    }
    
    return null; // End interview
  };

  const handleUserResponse = (response: string) => {
    if (response.trim().length === 0) return;
    
    stopListening();
    setConversation(prev => [...prev, { type: 'user', content: response }]);
    
    // Check if user wants to end interview
    if (response.toLowerCase().includes('end interview') || response.toLowerCase().includes('finish interview')) {
      endInterview();
      return;
    }

    // Move to next question
    setTimeout(() => {
      const nextQuestion = getNextQuestion();
      
      if (nextQuestion) {
        setCurrentQuestion(nextQuestion);
        setQuestionCount(prev => prev + 1);
        setQuestionsPerTopic(prev => prev + 1);
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
    
    const finalMessage = "Thank you for completing the mock interview. You've covered multiple topics and provided detailed responses. Great job!";
    speakQuestion(finalMessage);
    
    setTimeout(() => {
      onCompleteInterview({
        role,
        questionsAnswered: questionCount + 1,
        topicsCovered: currentTopic + 1,
        conversation,
        duration: Date.now()
      });
    }, 3000);
  };

  const getTotalProgress = () => {
    const totalTopics = currentStructure.topics.length;
    const questionsPerTopicTarget = 6; // 4 main + 2 follow-ups per topic
    const totalQuestions = totalTopics * questionsPerTopicTarget;
    const currentProgress = (currentTopic * questionsPerTopicTarget) + questionsPerTopic;
    return Math.min(100, (currentProgress / totalQuestions) * 100);
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
              This is your comprehensive {role} mock interview. The AI interviewer will ask you questions 
              across multiple topics with follow-up questions to dive deeper into your experience.
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
            <div className="bg-blue-50 p-4 rounded-lg mb-8">
              <h3 className="font-semibold text-blue-900 mb-2">Interview Topics:</h3>
              <div className="text-sm text-blue-800 space-y-1">
                {currentStructure.topics.map((topic, index) => (
                  <div key={index}>• {topic.name}</div>
                ))}
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
              <span className="text-sm font-medium text-gray-600">
                Progress: {currentStructure.topics[currentTopic]?.name}
              </span>
              <span className="text-sm text-gray-500">
                Topic {currentTopic + 1} of {currentStructure.topics.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getTotalProgress()}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {questionCount + 1} questions asked
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
