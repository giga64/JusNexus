// ... (código anterior) ...

const Login = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    email: "",
    password: ""
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Erro ao fazer login.");
      }

      const data = await response.json();
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user_info", JSON.stringify(data.user));
      
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Falha no login:", error);
      // Aqui você pode usar uma notificação de erro, como toast, para uma melhor experiência
      alert(error.message);
    }
  };

// ... (resto do código) ...