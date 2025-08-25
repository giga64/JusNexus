import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET as string;

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    console.log(`Novo usuário registrado e aguardando aprovação: ${email}`);

    res.status(201).json({ message: 'Cadastro realizado com sucesso! Aguardando aprovação do administrador.' });
  } catch (error) {
    res.status(400).json({ error: 'Este e-mail já está em uso.' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return res.status(401).json({ error: 'Credenciais inválidas.' });
  }

  if (user.status !== 'APPROVED') {
    return res.status(403).json({ error: 'Seu acesso ainda não foi aprovado por um administrador.' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ error: 'Credenciais inválidas.' });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role, name: user.name, email: user.email },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    token,
    user: { name: user.name, email: user.email, role: user.role.toLowerCase() },
  });
};
