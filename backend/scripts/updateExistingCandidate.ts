import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateExistingCandidate() {
  try {
    // Buscar el candidato existente (asumiendo que es el único por ahora)
    const existingCandidate = await prisma.candidate.findFirst();
    
    if (existingCandidate) {
      console.log('Candidato encontrado:', existingCandidate.name);
      
      // Actualizar con la fecha actual
      const updatedCandidate = await prisma.candidate.update({
        where: { id: existingCandidate.id },
        data: {
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      
      console.log('Candidato actualizado con fecha actual:', updatedCandidate);
    } else {
      console.log('No se encontraron candidatos para actualizar');
    }
  } catch (error) {
    console.error('Error actualizando candidato:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateExistingCandidate(); 