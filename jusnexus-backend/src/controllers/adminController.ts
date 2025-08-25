import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getPendingUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      where: { status: 'PENDING' },
      select: { id: true, name: true, email: true, createdAt: true },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar usuários pendentes.' });
  }
};

export const approveUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { status: 'APPROVED' },
    });

    console.log(`Usuário ${updatedUser.email} aprovado.`);

    res.json({ message: 'Usuário aprovado com sucesso!' });
  } catch (error) {
    res.status(404).json({ error: 'Usuário não encontrado.' });
  }
};
