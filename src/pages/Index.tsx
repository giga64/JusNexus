import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ParticleBackground from "@/components/ParticleBackground";
import { LogIn, Scale } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative flex items-center justify-center">
      <ParticleBackground />
      
      {/* Background Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background-secondary to-background-tertiary" />
      
      <div className="relative z-10 text-center">
        <div className="flex items-center justify-center mb-8">
          <Scale className="w-16 h-16 text-primary" />
        </div>
        <h1 className="text-5xl font-bold mb-4">
          <span className="text-primary">Jus</span>
          <span className="text-accent">Nexus</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Sistema Jurídico Inteligente
        </p>
        <Button 
          onClick={() => navigate('/login')} 
          className="bg-gradient-brand hover:scale-105 transition-all duration-300"
        >
          <LogIn className="w-4 h-4 mr-2" />
          Acessar Sistema
        </Button>
      </div>
    </div>
  );
};

export default Index;
