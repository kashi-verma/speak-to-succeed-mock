
interface VoiceVisualizerProps {
  isListening: boolean;
  isSpeaking: boolean;
}

const VoiceVisualizer = ({ isListening, isSpeaking }: VoiceVisualizerProps) => {
  return (
    <div className="flex items-center justify-center">
      <div className="relative w-32 h-32">
        {/* Outer ring */}
        <div 
          className={`absolute inset-0 rounded-full border-4 transition-all duration-300 ${
            isListening ? 'border-green-400 animate-pulse' : 
            isSpeaking ? 'border-blue-400 animate-pulse' : 
            'border-gray-300'
          }`}
        />
        
        {/* Middle ring */}
        <div 
          className={`absolute inset-4 rounded-full border-2 transition-all duration-300 ${
            isListening ? 'border-green-300 animate-ping' : 
            isSpeaking ? 'border-blue-300 animate-ping' : 
            'border-gray-200'
          }`}
        />
        
        {/* Inner circle */}
        <div 
          className={`absolute inset-8 rounded-full transition-all duration-300 ${
            isListening ? 'bg-green-500 animate-pulse' : 
            isSpeaking ? 'bg-blue-500 animate-pulse' : 
            'bg-gray-400'
          }`}
        />
        
        {/* Microphone icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg 
            className={`w-8 h-8 transition-colors duration-300 ${
              isListening ? 'text-white' : 
              isSpeaking ? 'text-white' : 
              'text-gray-600'
            }`}
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path 
              fillRule="evenodd" 
              d="M7 4a3 3 0 016 0v4a3 3 0 01-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" 
              clipRule="evenodd" 
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default VoiceVisualizer;
