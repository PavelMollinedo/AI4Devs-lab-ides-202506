import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const candidates = await prisma.candidate.findMany();
  for (const candidate of candidates) {
    await prisma.candidate.update({
      where: { id: candidate.id },
      data: {
        personalId: candidate.personalId ?? `PID${candidate.id}`,
        firstName: candidate.firstName ?? `Nombre${candidate.id}`,
        secondName: candidate.secondName ?? `Segundo${candidate.id}`,
        firstSurname: candidate.firstSurname ?? `Apellido${candidate.id}`,
        secondSurname: candidate.secondSurname ?? `SegundoApellido${candidate.id}`,
        address: candidate.address ?? `Dirección inventada ${candidate.id}`,
        education: candidate.education ?? `Educación inventada ${candidate.id}`,
        workExperience: candidate.workExperience ?? `Experiencia inventada ${candidate.id}`,
      },
    });
    console.log(`Candidato ${candidate.id} actualizado`);
  }
}

main().finally(() => prisma.$disconnect());