// src/components/AuthWrapper.tsx

import { useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface AuthWrapperProps {
  children: ReactNode;
  adminOnly?: boolean;
}

const AuthWrapper = ({ children, adminOnly = false }: AuthWrapperProps) => {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
      return;
    }

    if (adminOnly && !isAdmin) {
      // Se a rota é apenas para admin e o usuário não é, redireciona para o dashboard
      navigate("/dashboard");
    }
  }, [isAuthenticated, isAdmin, adminOnly, navigate]);

  // Se a rota for admin e o usuário não for, não renderiza nada enquanto redireciona
  if (adminOnly && !isAdmin) {
    return null;
  }

  return <>{children}</>;
};

export default AuthWrapper;