import { useState, useEffect } from "react";
import { Bot, MessageSquare, Sparkles } from "lucide-react";

interface RobotAssistantProps {
  name: string;
  type: "recursos" | "contestacao" | "ajuizamento" | "processual" | "negocial";
  isActive?: boolean;
}

const RobotAssistant = ({ name, type, isActive = false }: RobotAssistantProps) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);

  // Breathing animation effect
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 200);
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  // Simulated thinking animation when active
  useEffect(() => {
    if (isActive) {
      const thinkingInterval = setInterval(() => {
        setIsThinking(prev => !prev);
      }, 1500);

      return () => clearInterval(thinkingInterval);
    }
  }, [isActive]);

  const getColorScheme = () => {
    switch (type) {
      case "recursos":
        return {
          body: "text-orange-400",
          eyes: "text-orange-300",
          glow: "glow-reu"
        };
      case "contestacao":
        return {
          body: "text-red-400",
          eyes: "text-red-300",
          glow: "glow-reu"
        };
      case "ajuizamento":
        return {
          body: "text-green-400",
          eyes: "text-green-300",
          glow: "glow-autor"
        };
      case "processual":
        return {
          body: "text-cyan-400",
          eyes: "text-cyan-300",
          glow: "glow-cyan"
        };
      case "negocial":
        return {
          body: "text-purple-400",
          eyes: "text-purple-300",
          glow: "glow-purple"
        };
      default:
        return {
          body: "text-primary",
          eyes: "text-primary",
          glow: "glow-cyan"
        };
    }
  };

  const colors = getColorScheme();

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Robot Avatar */}
      <div className={`relative transition-all duration-300 ${isActive ? 'animate-pulse-glow' : ''} ${colors.glow}`}>
        <div className="relative w-24 h-24 glass rounded-full flex items-center justify-center border-glow">
          {/* Robot Body */}
          <Bot className={`w-16 h-16 ${colors.body} transition-all duration-300`} />
          
          {/* Eyes (blinking animation) */}
          <div className="absolute top-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
            <div 
              className={`w-2 h-2 rounded-full ${colors.eyes} transition-all duration-200 ${
                isBlinking ? 'scale-y-0' : 'scale-y-100'
              }`}
            />
            <div 
              className={`w-2 h-2 rounded-full ${colors.eyes} transition-all duration-200 ${
                isBlinking ? 'scale-y-0' : 'scale-y-100'
              }`}
            />
          </div>

          {/* Thinking indicator */}
          {isThinking && (
            <div className="absolute -top-2 -right-2">
              <Sparkles className="w-6 h-6 text-primary animate-spin" />
            </div>
          )}

          {/* Activity indicator */}
          {isActive && (
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
              <MessageSquare className="w-4 h-4 text-primary animate-bounce" />
            </div>
          )}
        </div>

        {/* Glow ring */}
        <div className="absolute inset-0 rounded-full border-2 border-transparent animate-pulse" 
             style={{
               background: `linear-gradient(45deg, transparent, ${colors.eyes}, transparent)`,
               borderRadius: '50%',
               opacity: isActive ? 0.3 : 0.1
             }}
        />
      </div>

      {/* Robot Name */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-foreground">{name}</h3>
        <p className="text-sm text-muted-foreground">
          {isActive ? "Processando..." : "Aguardando"}
        </p>
      </div>

      {/* Status indicators */}
      <div className="flex space-x-1">
        <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-400 animate-pulse' : 'bg-muted'}`} />
        <div className={`w-2 h-2 rounded-full ${isThinking ? 'bg-yellow-400 animate-pulse' : 'bg-muted'}`} />
        <div className={`w-2 h-2 rounded-full ${isActive && isThinking ? 'bg-primary animate-pulse' : 'bg-muted'}`} />
      </div>
    </div>
  );
};

export default RobotAssistant;