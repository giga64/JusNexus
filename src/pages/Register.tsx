import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ParticleBackground from "@/components/ParticleBackground";
import { toast } from "sonner";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirm_password) {
      toast.error("Erro no Cadastro", { description: "As senhas não coincidem." });
      return;
    }

    try {
      // TODO: Substituir por chamada real à API:
      // const response = await fetch('/auth/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // });
      // if (!response.ok) {
      //   const data = await response.json();
      //   throw new Error(data.detail || "Erro ao registrar.");
      // }
      
      // Simulação de chamada à API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Cadastro realizado com sucesso!", {
        description: "Verifique sua caixa de entrada para confirmar seu e-mail.",
      });
      setFormData({ full_name: "", email: "", password: "", confirm_password: "" });

    } catch (err: any) {
      toast.error("Erro no Cadastro", { description: err.message });
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6">
      <ParticleBackground />
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background-secondary to-background-tertiary" />
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
           <h1 className="text-5xl font-bold logo-gradient mb-2">
            <span className="text-primary">Jus</span>
            <span className="text-accent">Nexus</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Cadastro de Novo Usuário
          </p>
        </div>

        <Card className="glass border-glow">
          <CardHeader>
            <CardTitle className="text-center text-xl text-foreground">
              Crie sua Conta
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Seu acesso será liberado após aprovação.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="full_name">Nome Completo</Label>
                <Input id="full_name" type="text" value={formData.full_name} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" value={formData.password} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirmar Senha</Label>
                <Input id="confirm_password" type="password" value={formData.confirm_password} onChange={handleChange} required />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}
              {success && <p className="text-sm text-green-400">{success}</p>}

              <Button type="submit" className="w-full bg-gradient-brand hover:scale-105 transition-all duration-300">
                Registrar
              </Button>
            </form>
          </CardContent>
        </Card>
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Já tem uma conta?{" "}
            <a href="/" className="text-primary hover:underline">
              Faça o login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
