import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const candidateSchema = z.object({
  personalId: z.string().min(1),
  firstName: z.string().min(1),
  secondName: z.string().optional(),
  firstSurname: z.string().min(1),
  secondSurname: z.string().optional(),
  resumeUrl: z.string().url().optional(),

  emails: z.array(z.object({
    email: z.string().email(),
    isPrimary: z.boolean().optional(),
  })).min(1),

  phones: z.array(z.object({
    phone: z.string().min(5),
    typeId: z.number(), // Debe ser un id válido de PhoneType
    isPrimary: z.boolean().optional(),
  })).min(1),

  addresses: z.array(z.object({
    address: z.string().min(5),
    typeId: z.number(), // Debe ser un id válido de AddressType
    isPrimary: z.boolean().optional(),
  })).min(1),

  educations: z.array(z.object({
    institution: z.string().min(2),
    degree: z.string().min(2),
    startDate: z.string(), // ISO date
    endDate: z.string().optional(), // ISO date
    typeId: z.number(), // Debe ser un id válido de EducationType
  })).optional(),

  experiences: z.array(z.object({
    company: z.string().min(2),
    position: z.string().min(2),
    startDate: z.string(), // ISO date
    endDate: z.string().optional(), // ISO date
    description: z.string().optional(),
    typeId: z.number(), // Debe ser un id válido de ExperienceType
  })).optional(),
});

async function main() {
  // Poblar tipos de educación
  await prisma.educationType.createMany({
    data: [
      { name: 'Universidad' },
      { name: 'Maestría' },
      { name: 'Curso' },
    ],
    skipDuplicates: true,
  });

  // Poblar tipos de experiencia
  await prisma.experienceType.createMany({
    data: [
      { name: 'Trabajo' },
      { name: 'Práctica' },
      { name: 'Voluntariado' },
    ],
    skipDuplicates: true,
  });

  console.log('Catálogos de educación y experiencia poblados correctamente');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });