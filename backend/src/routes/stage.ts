import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();
const router = Router();

const stageSchema = z.object({
  name: z.string().min(2).max(100),
});

// Crear etapa
router.post('/', async (req, res) => {
  try {
    const data = stageSchema.parse(req.body);
    const stage = await prisma.stage.create({ data });
    res.status(201).json(stage);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Listar etapas
router.get('/', async (req, res) => {
  const stages = await prisma.stage.findMany();
  res.json(stages);
});

export default router;