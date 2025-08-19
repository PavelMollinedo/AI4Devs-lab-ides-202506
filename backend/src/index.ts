import { Request, Response, NextFunction } from 'express';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import candidateRoutes from './routes/candidate';
import stageHistoryRoutes from './routes/stageHistory';
import stageRoutes from './routes/stage';

dotenv.config();
const prisma = new PrismaClient();

export const app = express();
export default prisma;

const port = 3001;

// Configurar middleware ANTES de las rutas
app.use(helmet());
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Rate limiting
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Máximo 100 peticiones por IP
}));

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Hola LTI!');
});

// Rutas de la API
app.use('/api/candidates', candidateRoutes);
app.use('/api/stage-history', stageHistoryRoutes);
app.use('/api/stages', stageRoutes);

// Middleware de manejo de errores AL FINAL
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.type('text/plain'); 
  res.status(500).send('Something broke!');
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
