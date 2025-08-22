import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ParticleBackground from "@/components/ParticleBackground";
import { 
  Shield, 
  Sword, 
  Scale, 
  FileText, 
  Gavel, 
  Users,
  MessageSquare,
  Handshake,
  LogOut
} from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [selectedSector, setSelectedSector] = useState<string | null>(null);

  const sectors = {
    reu: {
      title: "BB Réu",
      subtitle: "Setor de Defesa",
      description: "Assistentes especializados em defesa processual",
      icon: Shield,
      gradient: "gradient-reu",
      glow: "glow-reu",
      assistants: [
        {
          id: "recursos",
          name: "Assistente Recursos",
          description: "Especialista em recursos e apelações",
          icon: Scale,
          color: "text-orange-400"
        },
        {
          id: "contestacao",
          name: "Assistente Contestação", 
          description: "Especialista em contestações e defesas",
          icon: Shield,
          color: "text-red-400"
        }
      ]
    },
    autor: {
      title: "BB Autor",
      subtitle: "Setor de Ação",
      description: "Assistentes especializados em ações processuais",
      icon: Sword,
      gradient: "gradient-autor",
      glow: "glow-autor",
      assistants: [
        {
          id: "ajuizamento",
          name: "Assistente Ajuizamento",
          description: "Especialista em petições iniciais",
          icon: Gavel,
          color: "text-green-400"
        },
        {
          id: "processual",
          name: "Assistente Processual",
          description: "Manifestações e dilação de prazo",
          icon: FileText,
          color: "text-cyan-400"
        },
        {
          id: "negocial",
          name: "Assistente Negocial",
          description: "Acordos e negociações",
          icon: Handshake,
          color: "text-purple-400"
        }
      ]
    }
  };

  const handleLogout = () => {
    window.location.href = "/";
  };

  const handleAssistantSelect = (sectorId: string, assistantId: string) => {
    // Navegação para interface específica do assistente
    navigate(`/assistant/${sectorId}/${assistantId}`);
  };

  return (
    <div className="min-h-screen relative">
      <ParticleBackground />
      
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background-secondary to-background-tertiary" />
      
      <div className="relative z-10">
        {/* Header */}
        <header className="flex items-center justify-between p-6 glass border-b border-border/50">
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold logo-gradient ml-3">
                <span className="text-primary">Jus</span>
                <span className="text-accent">Nexus</span>
              </h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-foreground font-medium">Sistema MDR</p>
              <p className="text-xs text-muted-foreground">Usuário Logado</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="glass border-border hover:border-primary"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </header>

        <div className="container mx-auto p-6">
          {!selectedSector ? (
            // Main Sector Selection
            <div>
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-foreground mb-4">
                  Selecione o Setor Jurídico
                </h2>
                <p className="text-xl text-muted-foreground">
                  Escolha entre os setores especializados para acessar os assistentes IA
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {Object.entries(sectors).map(([key, sector]) => {
                  const Icon = sector.icon;
                  return (
                    <Card 
                      key={key}
                      className={`glass border-glow hover-scale cursor-pointer group transition-all duration-300 ${sector.glow} hover:scale-105`}
                      onClick={() => setSelectedSector(key)}
                    >
                      <CardHeader className="text-center pb-4">
                        <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-${sector.gradient} flex items-center justify-center group-hover:animate-pulse-glow`}>
                          <Icon className="w-10 h-10 text-white" />
                        </div>
                        <CardTitle className="text-2xl text-foreground">
                          {sector.title}
                        </CardTitle>
                        <CardDescription className="text-lg text-muted-foreground">
                          {sector.subtitle}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="text-center">
                        <p className="text-foreground mb-4">
                          {sector.description}
                        </p>
                        <div className="flex justify-center">
                          <div className="flex -space-x-2">
                            {sector.assistants.map((assistant, idx) => {
                              const AssistantIcon = assistant.icon;
                              return (
                                <div 
                                  key={idx}
                                  className="w-8 h-8 rounded-full glass border-2 border-border flex items-center justify-center"
                                >
                                  <AssistantIcon className={`w-4 h-4 ${assistant.color}`} />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ) : (
            // Assistant Selection
            <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedSector(null)}
                    className="glass border-border hover:border-primary mb-4"
                  >
                    ← Voltar aos Setores
                  </Button>
                  <h2 className="text-3xl font-bold text-foreground">
                    {sectors[selectedSector as keyof typeof sectors].title}
                  </h2>
                  <p className="text-muted-foreground">
                    {sectors[selectedSector as keyof typeof sectors].description}
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {sectors[selectedSector as keyof typeof sectors].assistants.map((assistant) => {
                  const Icon = assistant.icon;
                  return (
                    <Card 
                      key={assistant.id}
                      className="glass border-glow hover-scale cursor-pointer group transition-all duration-300 hover:glow-cyan"
                      onClick={() => handleAssistantSelect(selectedSector, assistant.id)}
                    >
                      <CardHeader className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full glass flex items-center justify-center group-hover:animate-pulse-glow">
                          <Icon className={`w-8 h-8 ${assistant.color}`} />
                        </div>
                        <CardTitle className="text-xl text-foreground">
                          {assistant.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-center">
                        <p className="text-muted-foreground mb-4">
                          {assistant.description}
                        </p>
                        <Button 
                          variant="outline" 
                          className="w-full glass border-border hover:border-primary group-hover:bg-gradient-brand group-hover:text-primary-foreground"
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Iniciar Atendimento
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;