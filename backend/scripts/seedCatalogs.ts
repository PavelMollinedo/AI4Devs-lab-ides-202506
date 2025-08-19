import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Poblar tipos de teléfono
  await prisma.phoneType.createMany({
    data: [
      { name: 'Celular' },
      { name: 'Casa' },
      { name: 'Trabajo' },
    ],
    skipDuplicates: true,
  });

  // Poblar tipos de dirección
  await prisma.addressType.createMany({
    data: [
      { name: 'Casa' },
      { name: 'Trabajo' },
      { name: 'Otro' },
    ],
    skipDuplicates: true,
  });

  console.log('Catálogos poblados correctamente');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });