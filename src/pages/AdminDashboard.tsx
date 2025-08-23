import { useEffect, useState } from "react";
import { Shield, Users, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface User {
  id: number;
  full_name: string;
  email: string;
  is_active: boolean;
  is_pending: boolean;
  role: 'user' | 'admin';
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    const fetchUsers = async () => {
      try {
        setError(null);
        setIsLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
          throw new Error("Você não tem permissão para ver esta página.");
        }
        
        const data: User[] = await response.json();
        setUsers(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [token]);

  const handleUpdateStatus = async (userId: number, isActive: boolean, isPending: boolean) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_active: isActive, is_pending: isPending })
      });

      if (!response.ok) {
        throw new Error("Falha ao atualizar o status do usuário.");
      }

      setUsers(users.map(user => 
        user.id === userId ? { ...user, is_active: isActive, is_pending: isPending } : user
      ));
      toast.success("Status do usuário atualizado com sucesso!");
    } catch (err: any) {
      toast.error("Erro na Operação", { description: err.message });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Painel Administrativo</h1>
        </div>
        <Button variant="outline" onClick={() => navigate('/dashboard')}>
          Voltar para o Dashboard
        </Button>
      </header>

      <Card className="glass border-glow">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-6 h-6 mr-3" />
            Gerenciamento de Usuários
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Carregando usuários...</p>
          ) : error ? (
            <p className="text-destructive">{error}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.is_pending ? (
                        <Badge variant="destructive">Pendente</Badge>
                      ) : user.is_active ? (
                        <Badge variant="default">Ativo</Badge>
                      ) : (
                        <Badge variant="secondary">Inativo</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {user.is_pending && (
                        <div className="space-x-2">
                          <Button size="sm" onClick={() => handleUpdateStatus(user.id, true, false)}>
                            <Check className="w-4 h-4 mr-2" />
                            Aprovar
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleUpdateStatus(user.id, false, false)}>
                            <X className="w-4 h-4 mr-2" />
                            Rejeitar
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
