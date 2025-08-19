import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();
const router = Router();

// Validación para crear un cambio de etapa
const stageHistorySchema = z.object({
  candidateId: z.number().int().positive(),
  stageId: z.number().int().positive(),
  notes: z.string().max(500).optional(),
});

// Crear un registro de cambio de etapa
router.post('/', async (req, res) => {
  try {
    const data = stageHistorySchema.parse(req.body);

    // Verifica que el candidato y la etapa existan
    const candidate = await prisma.candidate.findUnique({ where: { id: data.candidateId } });
    const stage = await prisma.stage.findUnique({ where: { id: data.stageId } });
    if (!candidate || !stage) {
      return res.status(404).json({ error: 'Candidate or Stage not found' });
    }

    const history = await prisma.candidateStageHistory.create({
      data: {
        candidateId: data.candidateId,
        stageId: data.stageId,
        notes: data.notes,
      },
      include: { stage: true },
    });
    res.status(201).json(history);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Obtener la bitácora de un candidato
router.get('/candidate/:candidateId', async (req, res) => {
  const candidateId = Number(req.params.candidateId);
  if (isNaN(candidateId)) return res.status(400).json({ error: 'Invalid candidateId' });

  const history = await prisma.candidateStageHistory.findMany({
    where: { candidateId },
    include: { stage: true },
    orderBy: { changedAt: 'desc' },
  });
  res.json(history);
});

export default router;