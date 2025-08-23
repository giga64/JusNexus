import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ParticleBackground from "@/components/ParticleBackground";
import RobotAssistant from "@/components/RobotAssistant"; 
import FileUpload from "@/components/FileUpload";
import DocumentTemplates from "@/components/DocumentTemplates";
import { ProcessData } from "@/utils/documentProcessor";
import { useAuth } from "@/context/AuthContext";
import { Shield, ArrowLeft, Send } from "lucide-react";

interface Message {
  id: number;
  type: 'user' | 'assistant';
  content: string;
}

const AssistantChat = () => {
  const { assistant } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ProcessData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const assistantConfig = {
    recursos: {
      name: "Assistente de Recursos",
      description: "Especialista em recursos e apelações",
      sector: "BB Réu - Defesa"
    },
    contestacao: {
      name: "Assistente de Contestação",
      description: "Especialista em contestações e defesas",
      sector: "BB Réu - Defesa"
    },
    ajuizamento: {
      name: "Assistente de Ajuizamento",
      description: "Especialista em petições iniciais",
      sector: "BB Autor - Ação"
    },
    processual: {
      name: "Assistente Processual",
      description: "Manifestações e dilação de prazo",
      sector: "BB Autor - Ação"
    },
    negocial: {
      name: "Assistente Negocial",
      description: "Acordos e negociações",
      sector: "BB Autor - Ação"
    }
  };

  const currentAssistant = assistantConfig[assistant as keyof typeof assistantConfig];

  useEffect(() => {
    // Welcome message
    setMessages([{
      id: 1,
      type: 'assistant',
      content: `Olá! Sou o ${currentAssistant?.name}. Você pode fazer upload do arquivo do processo para começarmos.`
    }]);
  }, [currentAssistant]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileProcessed = (data: ProcessData) => {
    setExtractedData(data);
    const newMessage: Message = {
      id: messages.length + 1,
      type: 'assistant',
      content: `✅ **Arquivo processado!** Os dados do processo foram carregados. Agora você pode me fazer perguntas sobre o caso ou gerar um documento ao lado.`
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleDocumentGenerated = (document: string) => {
    const newMessage: Message = {
      id: messages.length + 1,
      type: 'assistant',
      content: `📄 **Documento gerado!** O preview está disponível ao lado e você pode fazer o download.`
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !extractedData || !token) return;

    const userMessage: Message = { id: Date.now(), type: 'user', content: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsProcessing(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/process/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          history: messages,
          message: inputMessage,
          processData: extractedData,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.detail || "Erro na API de chat.");

      const assistantMessage: Message = { id: Date.now() + 1, type: 'assistant', content: result.reply };
      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error(error);
      const errorMessage: Message = { id: Date.now() + 1, type: 'assistant', content: "Desculpe, não consegui processar sua solicitação no momento." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!currentAssistant) return <div>Assistente não encontrado</div>;

  return (
    <div className="min-h-screen relative">
      <ParticleBackground />
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background-secondary to-background-tertiary" />
      <div className="relative z-10">
        {/* Header */}
        <header className="flex items-center justify-between p-6 glass border-b border-border/50">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
              className="glass border-border hover:border-primary"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            
            <div className="flex items-center space-x-3">
              <Shield className="w-6 h-6 text-primary" />
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  {currentAssistant.name}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {currentAssistant.sector}
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto p-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Robot Assistant Panel + Process Data/Templates */}
            <div className="lg:col-span-1 space-y-6">
              {/* Robot Assistant */}
              <Card className="glass border-glow">
                <CardHeader>
                  <CardTitle className="text-center text-foreground">
                    Assistente IA
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RobotAssistant 
                    name={currentAssistant.name}
                    type={assistant as any}
                    isActive={isProcessing}
                  />
                </CardContent>
              </Card>

              {/* Process Input Panel or Document Templates */}
              {!extractedData ? (
                <Card className="glass border-glow">
                  <CardHeader>
                    <CardTitle className="text-lg text-foreground">
                      Dados do Processo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FileUpload 
                      onFileProcessed={handleFileProcessed}
                      isProcessing={isProcessing}
                    />
                  </CardContent>
                </Card>
              ) : (
                <DocumentTemplates 
                  processData={extractedData}
                  assistantType={assistant || ""}
                  onDocumentGenerated={handleDocumentGenerated}
                />
              )}
            </div>

            {/* Right Column - Chat Panel */}
            <div className="lg:col-span-2">
              <Card className="glass border-glow h-[75vh] flex flex-col">
                <CardHeader>
                  <CardTitle className="text-lg text-foreground">
                    Conversa com o Assistente
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col overflow-hidden">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-4">
                    {messages.map((message) => (
                      <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-lg ${message.type === 'user' ? 'bg-gradient-brand text-primary-foreground' : 'glass border border-border text-foreground'}`}>
                          <p className="whitespace-pre-wrap text-sm font-sans">{message.content}</p>
                        </div>
                      </div>
                    ))}
                    {isProcessing && (
                      <div className="flex justify-start">
                        <div className="glass border border-border p-3 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0s' }}/>
                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}/>
                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}/>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                  
                  <form onSubmit={handleSendMessage} className="flex items-center space-x-2 border-t border-border/50 pt-4">
                    <Input
                      placeholder={extractedData ? "Faça uma pergunta sobre o processo..." : "Faça upload de um arquivo para começar."}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      disabled={!extractedData || isProcessing}
                      className="flex-1 glass"
                    />
                    <Button type="submit" size="icon" disabled={!inputMessage.trim() || isProcessing}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssistantChat;