import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import adminRoutes from './routes/adminRoutes';

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001; // Usaremos a porta 3001 para o backend

// Middlewares essenciais
app.use(cors()); // Permite requisições de origens diferentes (nosso frontend)
app.use(express.json()); // Permite que o servidor entenda JSON no corpo das requisições

// Rotas da aplicação
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Servidor JusNexus rodando na porta ${PORT}`);
});
