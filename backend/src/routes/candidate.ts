


import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();
const router = Router();

// --- ENDPOINTS CATALOGS ---
// Obtener todos los tipos de educación
router.get('/education-types', async (req: Request, res: Response) => {
  try {
    const types = await prisma.educationType.findMany();
    res.json(types);
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener todos los tipos de experiencia
router.get('/experience-types', async (req: Request, res: Response) => {
  try {
    const types = await prisma.experienceType.findMany();
    res.json(types);
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener todos los datos de un candidato por id (incluye emails, phones, addresses, educations, experiences)
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });
    const candidate = await prisma.candidate.findUnique({
      where: { id },
      include: {
        emails: true,
        phones: true,
        addresses: true,
        educations: { include: { type: true } },
        experiences: { include: { type: true } },
      },
    });
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });

    // Serializar fechas a string ISO para educations y experiences
    const educations = candidate.educations?.map(e => ({
      ...e,
      startDate: e.startDate ? new Date(e.startDate).toISOString().slice(0, 10) : '',
      endDate: e.endDate ? new Date(e.endDate).toISOString().slice(0, 10) : '',
    })) || [];
    const experiences = candidate.experiences?.map(ex => ({
      ...ex,
      startDate: ex.startDate ? new Date(ex.startDate).toISOString().slice(0, 10) : '',
      endDate: ex.endDate ? new Date(ex.endDate).toISOString().slice(0, 10) : '',
    })) || [];

    res.json({
      ...candidate,
      educations,
      experiences,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// --- ENDPOINTS EMAILS ---
// --- ENDPOINTS EDUCATIONS ---
// Obtener educaciones de un candidato por id
router.get('/:id/educations', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });
    const candidate = await prisma.candidate.findUnique({
      where: { id },
      include: {
        educations: { include: { type: true } },
      },
    });
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
    res.json({ educations: candidate.educations });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// --- ENDPOINTS EXPERIENCES ---
// Obtener experiencias de un candidato por id
router.get('/:id/experiences', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });
    const candidate = await prisma.candidate.findUnique({
      where: { id },
      include: {
        experiences: { include: { type: true } },
      },
    });
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
    res.json({ experiences: candidate.experiences });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});
// Obtener emails de un candidato por id
router.get('/:id/emails', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });
    const candidate = await prisma.candidate.findUnique({
      where: { id },
      include: {
        emails: true,
      },
    });
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
    res.json({ emails: candidate.emails });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// --- ENDPOINTS PHONES ---
// Obtener teléfonos de un candidato por id
router.get('/:id/phones', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });
    const candidate = await prisma.candidate.findUnique({
      where: { id },
      include: {
        phones: true,
      },
    });
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
    res.json({ phones: candidate.phones });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Agregar un teléfono a un candidato
router.post('/:id/phones', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });
    const phoneSchema = z.object({
      // Solo acepta números válidos (10-15 dígitos, opcional +, espacios, guiones)
      phone: z.string().regex(/^\+?[0-9\-\s]{10,15}$/,
        'El número de teléfono debe ser válido (10-15 dígitos, puede incluir +, espacios o guiones)'),
      typeId: z.number(),
      isPrimary: z.boolean().optional(),
    });
    const data = phoneSchema.parse(req.body);
    const candidate = await prisma.candidate.findUnique({ where: { id } });
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
    if (data.isPrimary) {
      await prisma.candidatePhone.updateMany({
        where: { candidateId: id },
        data: { isPrimary: false },
      });
    }
    const newPhone = await prisma.candidatePhone.create({
      data: {
        candidateId: id,
        phone: data.phone,
        typeId: data.typeId,
        isPrimary: data.isPrimary || false,
      },
    });
    res.status(201).json(newPhone);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Editar un teléfono de un candidato
router.put('/:id/phones/:phoneId', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const phoneId = Number(req.params.phoneId);
    if (isNaN(id) || isNaN(phoneId)) return res.status(400).json({ error: 'Invalid ID' });
    const phoneSchema = z.object({
      phone: z.string().regex(/^\+?[0-9\-\s]{10,15}$/,
        'El número de teléfono debe ser válido (10-15 dígitos, puede incluir +, espacios o guiones)').optional(),
      typeId: z.number().optional(),
      isPrimary: z.boolean().optional(),
    });
    const data = phoneSchema.parse(req.body);
    const phoneRecord = await prisma.candidatePhone.findUnique({ where: { id: phoneId } });
    if (!phoneRecord || phoneRecord.candidateId !== id) return res.status(404).json({ error: 'Phone not found for candidate' });
    if (data.isPrimary) {
      await prisma.candidatePhone.updateMany({
        where: { candidateId: id },
        data: { isPrimary: false },
      });
    }
    const updatedPhone = await prisma.candidatePhone.update({
      where: { id: phoneId },
      data: {
        phone: data.phone,
        typeId: data.typeId,
        isPrimary: data.isPrimary,
      },
    });
    res.json(updatedPhone);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar un teléfono de un candidato
router.delete('/:id/phones/:phoneId', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const phoneId = Number(req.params.phoneId);
    if (isNaN(id) || isNaN(phoneId)) return res.status(400).json({ error: 'Invalid ID' });
    const phoneRecord = await prisma.candidatePhone.findUnique({ where: { id: phoneId } });
    if (!phoneRecord || phoneRecord.candidateId !== id) return res.status(404).json({ error: 'Phone not found for candidate' });
    await prisma.candidatePhone.delete({ where: { id: phoneId } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// --- ENDPOINTS ADDRESSES ---
// Obtener direcciones de un candidato por id
router.get('/:id/addresses', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });
    const candidate = await prisma.candidate.findUnique({
      where: { id },
      include: {
        addresses: true,
      },
    });
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
    res.json({ addresses: candidate.addresses });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Agregar una dirección a un candidato
router.post('/:id/addresses', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });
    const addressSchema = z.object({
      address: z.string().min(5),
      typeId: z.number(),
      isPrimary: z.boolean().optional(),
    });
    const data = addressSchema.parse(req.body);
    const candidate = await prisma.candidate.findUnique({ where: { id } });
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
    if (data.isPrimary) {
      await prisma.candidateAddress.updateMany({
        where: { candidateId: id },
        data: { isPrimary: false },
      });
    }
    const newAddress = await prisma.candidateAddress.create({
      data: {
        candidateId: id,
        address: data.address,
        typeId: data.typeId,
        isPrimary: data.isPrimary || false,
      },
    });
    res.status(201).json(newAddress);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Editar una dirección de un candidato
router.put('/:id/addresses/:addressId', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const addressId = Number(req.params.addressId);
    if (isNaN(id) || isNaN(addressId)) return res.status(400).json({ error: 'Invalid ID' });
    const addressSchema = z.object({
      address: z.string().min(5).optional(),
      typeId: z.number().optional(),
      isPrimary: z.boolean().optional(),
    });
    const data = addressSchema.parse(req.body);
    const addressRecord = await prisma.candidateAddress.findUnique({ where: { id: addressId } });
    if (!addressRecord || addressRecord.candidateId !== id) return res.status(404).json({ error: 'Address not found for candidate' });
    if (data.isPrimary) {
      await prisma.candidateAddress.updateMany({
        where: { candidateId: id },
        data: { isPrimary: false },
      });
    }
    const updatedAddress = await prisma.candidateAddress.update({
      where: { id: addressId },
      data: {
        address: data.address,
        typeId: data.typeId,
        isPrimary: data.isPrimary,
      },
    });
    res.json(updatedAddress);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar una dirección de un candidato
router.delete('/:id/addresses/:addressId', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const addressId = Number(req.params.addressId);
    if (isNaN(id) || isNaN(addressId)) return res.status(400).json({ error: 'Invalid ID' });
    const addressRecord = await prisma.candidateAddress.findUnique({ where: { id: addressId } });
    if (!addressRecord || addressRecord.candidateId !== id) return res.status(404).json({ error: 'Address not found for candidate' });
    await prisma.candidateAddress.delete({ where: { id: addressId } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Agregar un email a un candidato
router.post('/:id/emails', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });
    const emailSchema = z.object({
      email: z.string().email(),
      isPrimary: z.boolean().optional(),
    });
    const data = emailSchema.parse(req.body);
    // Verifica que el candidato exista
    const candidate = await prisma.candidate.findUnique({ where: { id } });
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
    // Si isPrimary, desmarcar otros emails como primarios
    if (data.isPrimary) {
      await prisma.candidateEmail.updateMany({
        where: { candidateId: id },
        data: { isPrimary: false },
      });
    }
    const newEmail = await prisma.candidateEmail.create({
      data: {
        candidateId: id,
        email: data.email,
        isPrimary: data.isPrimary || false,
      },
    });
    res.status(201).json(newEmail);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Editar un email de un candidato
router.put('/:id/emails/:emailId', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const emailId = Number(req.params.emailId);
    if (isNaN(id) || isNaN(emailId)) return res.status(400).json({ error: 'Invalid ID' });
    const emailSchema = z.object({
      email: z.string().email().optional(),
      isPrimary: z.boolean().optional(),
    });
    const data = emailSchema.parse(req.body);
    // Verifica que el email exista y pertenezca al candidato
    const emailRecord = await prisma.candidateEmail.findUnique({ where: { id: emailId } });
    if (!emailRecord || emailRecord.candidateId !== id) return res.status(404).json({ error: 'Email not found for candidate' });
    // Si isPrimary, desmarcar otros emails como primarios
    if (data.isPrimary) {
      await prisma.candidateEmail.updateMany({
        where: { candidateId: id },
        data: { isPrimary: false },
      });
    }
    const updatedEmail = await prisma.candidateEmail.update({
      where: { id: emailId },
      data: {
        email: data.email,
        isPrimary: data.isPrimary,
      },
    });
    res.json(updatedEmail);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar un email de un candidato
router.delete('/:id/emails/:emailId', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const emailId = Number(req.params.emailId);
    if (isNaN(id) || isNaN(emailId)) return res.status(400).json({ error: 'Invalid ID' });
    // Verifica que el email exista y pertenezca al candidato
    const emailRecord = await prisma.candidateEmail.findUnique({ where: { id: emailId } });
    if (!emailRecord || emailRecord.candidateId !== id) return res.status(404).json({ error: 'Email not found for candidate' });
    await prisma.candidateEmail.delete({ where: { id: emailId } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Validación con Zod
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
    typeId: z.number(),
    isPrimary: z.boolean().optional(),
  })).min(1),

  addresses: z.array(z.object({
    address: z.string().min(5),
    typeId: z.number(),
    isPrimary: z.boolean().optional(),
  })).min(1),

  educations: z.array(z.object({
    institution: z.string().min(2),
    degree: z.string().min(2),
    startDate: z.string(),
    endDate: z.string().optional(),
    typeId: z.number(),
  })).optional(),

  experiences: z.array(z.object({
    company: z.string().min(2),
    position: z.string().min(2),
    startDate: z.string(),
    endDate: z.string().optional(),
    description: z.string().optional(),
    typeId: z.number(),
  })).optional(),
});

// Crear candidato
router.post('/', async (req: Request, res: Response) => {
  try {
    const data = candidateSchema.parse(req.body);

    // Convertir fechas y conectar type en educations y experiences
    const educations = data.educations
      ? data.educations.map(e => ({
          institution: e.institution,
          degree: e.degree,
          startDate: new Date(e.startDate),
          endDate: e.endDate ? new Date(e.endDate) : null,
          type: { connect: { id: e.typeId } },
        }))
      : undefined;
    const experiences = data.experiences
      ? data.experiences.map(e => ({
          company: e.company,
          position: e.position,
          startDate: new Date(e.startDate),
          endDate: e.endDate ? new Date(e.endDate) : null,
          description: e.description,
          type: { connect: { id: e.typeId } },
        }))
      : undefined;

    const candidate = await prisma.candidate.create({
      data: {
        personalId: data.personalId,
        firstName: data.firstName,
        secondName: data.secondName || '',
        firstSurname: data.firstSurname,
        secondSurname: data.secondSurname || '',
        resumeUrl: data.resumeUrl || '',

        emails: { create: data.emails },
        phones: { create: data.phones },
        addresses: { create: data.addresses },
        educations: educations ? { create: educations } : undefined,
        experiences: experiences ? { create: experiences } : undefined,
      },
      include: {
        emails: true,
        phones: { include: { type: true } },
        addresses: { include: { type: true } },
        educations: { include: { type: true } },
        experiences: { include: { type: true } },
      },
    });

    res.status(201).json(candidate);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Actualizar candidato
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });
    const data = candidateSchema.partial().parse(req.body);

    // Actualiza los campos simples
    const candidate = await prisma.candidate.update({
      where: { id },
      data: {
        personalId: data.personalId,
        firstName: data.firstName,
        secondName: data.secondName,
        firstSurname: data.firstSurname,
        secondSurname: data.secondSurname,
        resumeUrl: data.resumeUrl,
      },
    });

    // Si se envían emails, actualiza la relación
    if (data.emails) {
      // Elimina todos los emails existentes del candidato
      await prisma.candidateEmail.deleteMany({ where: { candidateId: id } });
      // Crea los nuevos emails
      await prisma.candidate.update({
        where: { id },
        data: {
          emails: { create: data.emails }
        }
      });
    }

    // Si se envían phones, actualiza la relación
    if (data.phones) {
      await prisma.candidatePhone.deleteMany({ where: { candidateId: id } });
      await prisma.candidate.update({
        where: { id },
        data: {
          phones: { create: data.phones }
        }
      });
    }

    // Si se envían addresses, actualiza la relación
    if (data.addresses) {
      await prisma.candidateAddress.deleteMany({ where: { candidateId: id } });
      await prisma.candidate.update({
        where: { id },
        data: {
          addresses: { create: data.addresses }
        }
      });
    }

    // Si se envían educations, actualiza la relación
    if (data.educations) {
      const educations = data.educations.map(e => ({
        institution: e.institution,
        degree: e.degree,
        startDate: new Date(e.startDate),
        endDate: e.endDate ? new Date(e.endDate) : null,
        type: { connect: { id: e.typeId } },
      }));
      await prisma.candidateEducation.deleteMany({ where: { candidateId: id } });
      await prisma.candidate.update({
        where: { id },
        data: {
          educations: { create: educations }
        }
      });
    }

    // Si se envían experiences, actualiza la relación
    if (data.experiences) {
      const experiences = data.experiences.map(e => ({
        company: e.company,
        position: e.position,
        startDate: new Date(e.startDate),
        endDate: e.endDate ? new Date(e.endDate) : null,
        description: e.description,
        type: { connect: { id: e.typeId } },
      }));
      await prisma.candidateExperience.deleteMany({ where: { candidateId: id } });
      await prisma.candidate.update({
        where: { id },
        data: {
          experiences: { create: experiences }
        }
      });
    }

    // Devuelve el candidato actualizado con los emails
    const updatedCandidate = await prisma.candidate.findUnique({
      where: { id },
      include: {
        emails: true,
        phones: { include: { type: true } },
        addresses: { include: { type: true } },
        educations: { include: { type: true } },
        experiences: { include: { type: true } },
      },
    });

    res.json(updatedCandidate);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as any).code === 'P2025'
    ) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Eliminar candidato
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });
    await prisma.candidate.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Listar candidatos
router.get('/', async (req: Request, res: Response) => {
  try {
    const candidates = await prisma.candidate.findMany({
      include: {
        emails: true,
        phones: true,
        addresses: true,
        educations: true,
        experiences: true,
      },
    });

    // Mapear los datos al formato plano esperado por el frontend y en el orden solicitado
    const mapped = candidates.map(c => {
      const fullName = [c.firstName, c.secondName, c.firstSurname, c.secondSurname]
        .filter(Boolean)
        .join(' ');
      const emailObj = c.emails.find(e => e.isPrimary) || c.emails[0];
      const email = emailObj ? emailObj.email : '';
      const phoneObj = c.phones.find(p => p.isPrimary) || c.phones[0];
      const phone = phoneObj ? phoneObj.phone : '';
      return {
        id: c.id,
        entryDate: c.createdAt, // Fecha de ingreso
        personalId: c.personalId,
        fullName,
        firstName: c.firstName,
        secondName: c.secondName,
        firstSurname: c.firstSurname,
        secondSurname: c.secondSurname,
        resumeUrl: c.resumeUrl,
        email,
        phone,
        updatedAt: c.updatedAt,
      };
    });
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;