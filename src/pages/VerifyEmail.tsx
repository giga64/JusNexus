// src/pages/VerifyEmail.tsx

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ParticleBackground from "@/components/ParticleBackground";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');
  
  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Token de verificação não encontrado.');
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await fetch(`http://localhost:8000/auth/verify-email?token=${token}`);
        const data = await response.json();
        
        if (response.ok) {
          setStatus('success');
          setMessage(data.message);
        } else {
          setStatus('error');
          setMessage(data.detail || 'Falha na verificação do e-mail.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Ocorreu um erro ao conectar com o servidor.');
        console.error(error);
      }
    };

    verifyToken();
  }, [searchParams]);

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6">
      <ParticleBackground />
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background-secondary to-background-tertiary" />
      <div className="relative z-10 w-full max-w-md">
        <Card className="glass border-glow text-center">
          <CardHeader>
            <CardTitle className="text-xl text-foreground">
              {status === 'verifying' ? 'Verificando E-mail...' : 'Status da Verificação'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {status === 'verifying' && (
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <p className="mt-4 text-muted-foreground">Aguarde um momento...</p>
              </div>
            )}
            {status === 'success' && (
              <div className="flex flex-col items-center space-y-4">
                <CheckCircle className="w-12 h-12 text-green-400" />
                <p className="text-foreground">{message}</p>
                <p className="text-sm text-muted-foreground">Você será redirecionado para a página de login em breve.</p>
              </div>
            )}
            {status === 'error' && (
              <div className="flex flex-col items-center space-y-4">
                <XCircle className="w-12 h-12 text-destructive" />
                <p className="text-foreground">{message}</p>
                <p className="text-sm text-muted-foreground">Tente novamente ou entre em contato com o suporte.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VerifyEmail;
