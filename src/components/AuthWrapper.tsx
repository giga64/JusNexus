// src/components/AuthWrapper.tsx
import { useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";

interface AuthWrapperProps {
  children: ReactNode;
}

const AuthWrapper = ({ children }: AuthWrapperProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  return <>{children}</>;
};

export default AuthWrapper;