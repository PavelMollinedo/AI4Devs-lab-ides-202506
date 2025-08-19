import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Typography,
} from '@mui/material';
import { Close as CloseIcon, Save as SaveIcon } from '@mui/icons-material';
import axios from 'axios';
import type { Candidate, CandidateEmail, CandidatePhone, CandidateAddress, CandidateEducation, CandidateExperience } from '../types/candidate';

interface CandidateFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  candidate?: Candidate | null;
}

const initialFormData: Candidate = {
  personalId: '',
  firstName: '',
  secondName: '',
  firstSurname: '',
  secondSurname: '',
  resumeUrl: '',
  emails: [
    { email: '', isPrimary: true }
  ],
  phones: [
    { phone: '', typeId: 1, isPrimary: true }
  ],
  addresses: [
    { address: '', typeId: 1, isPrimary: true }
  ],
  educations: [],
  experiences: [],
};

export default function CandidateForm({ open, onClose, onSuccess, candidate }: CandidateFormProps) {
  const [formData, setFormData] = useState<Candidate>(candidate || initialFormData);
  // Estados para catálogos dinámicos
  const [educationTypes, setEducationTypes] = useState<{ id: number; name: string }[]>([]);
  const [experienceTypes, setExperienceTypes] = useState<{ id: number; name: string }[]>([]);

  // Sincroniza el estado interno con el candidato recibido al abrir el modal o cambiar el candidato
  // Sincroniza el estado interno con el candidato recibido al abrir el modal o cambiar el candidato
  React.useEffect(() => {
    setFormData(candidate || initialFormData);
  }, [candidate, open]);

  // Si los catálogos se cargan después de abrir el modal, actualiza los typeId de educations y experiences si están vacíos
  React.useEffect(() => {
    if (educationTypes.length > 0 && Array.isArray(formData.educations) && formData.educations.length > 0) {
      setFormData(prev => ({
        ...prev,
        educations: Array.isArray(prev.educations)
          ? prev.educations.map(e => ({
              ...e,
              typeId: e.typeId || educationTypes[0].id
            }))
          : [],
      }));
    }
  }, [educationTypes]);
  React.useEffect(() => {
    if (experienceTypes.length > 0 && Array.isArray(formData.experiences) && formData.experiences.length > 0) {
      setFormData(prev => ({
        ...prev,
        experiences: Array.isArray(prev.experiences)
          ? prev.experiences.map(e => ({
              ...e,
              typeId: e.typeId || experienceTypes[0].id
            }))
          : [],
      }));
    }
  }, [experienceTypes]);

  // Cargar catálogos dinámicos al montar
  React.useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        const [eduRes, expRes] = await Promise.all([
          axios.get('/api/candidates/education-types'),
          axios.get('/api/candidates/experience-types'),
        ]);
        setEducationTypes(eduRes.data);
        setExperienceTypes(expRes.data);
      } catch (err) {
        // Si falla, dejar arrays vacíos
        setEducationTypes([]);
        setExperienceTypes([]);
      }
    };
    fetchCatalogs();
  }, []);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Mejorar la validación del teléfono
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Básicos
    if (!formData.personalId.trim()) {
      newErrors.personalId = 'El ID personal es requerido';
    }
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'El primer nombre es requerido';
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = 'El primer nombre debe tener al menos 2 caracteres';
    }
    if (formData.secondName && formData.secondName.length > 0 && formData.secondName.length < 2) {
      newErrors.secondName = 'El segundo nombre debe tener al menos 2 caracteres';
    }
    if (!formData.firstSurname.trim()) {
      newErrors.firstSurname = 'El primer apellido es requerido';
    } else if (formData.firstSurname.length < 2) {
      newErrors.firstSurname = 'El primer apellido debe tener al menos 2 caracteres';
    }
    if (formData.secondSurname && formData.secondSurname.length > 0 && formData.secondSurname.length < 2) {
      newErrors.secondSurname = 'El segundo apellido debe tener al menos 2 caracteres';
    }
    if (formData.resumeUrl && formData.resumeUrl.length > 0 && !/^https?:\/\/.+/.test(formData.resumeUrl)) {
      newErrors.resumeUrl = 'La URL del CV debe comenzar con http:// o https://';
    }

    // Emails
    if (!formData.emails.length) {
      newErrors.emails = 'Debe ingresar al menos un email';
    } else {
      let hasPrimary = false;
      formData.emails.forEach((email, idx) => {
        if (!email.email.trim()) {
          newErrors[`email_${idx}`] = 'El email es requerido';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.email)) {
          newErrors[`email_${idx}`] = 'El email no es válido';
        }
        if (email.isPrimary) hasPrimary = true;
      });
      if (!hasPrimary) newErrors.emails = 'Debe marcar un email como principal';
    }

    // Teléfonos
    if (!formData.phones.length) {
      newErrors.phones = 'Debe ingresar al menos un teléfono';
    } else {
      let hasPrimary = false;
      formData.phones.forEach((phone, idx) => {
        if (!phone.phone.trim()) {
          newErrors[`phone_${idx}`] = 'El teléfono es requerido';
        } else if (!/^[\+]?[0-9\s\-()\.]{7,}$/.test(phone.phone)) {
          newErrors[`phone_${idx}`] = 'El teléfono debe tener al menos 7 dígitos';
        }
        if (!phone.typeId) {
          newErrors[`phone_type_${idx}`] = 'Debe seleccionar un tipo';
        }
        if (phone.isPrimary) hasPrimary = true;
      });
      if (!hasPrimary) newErrors.phones = 'Debe marcar un teléfono como principal';
    }

    // Direcciones
    if (!formData.addresses.length) {
      newErrors.addresses = 'Debe ingresar al menos una dirección';
    } else {
      let hasPrimary = false;
      formData.addresses.forEach((address, idx) => {
        if (!address.address.trim()) {
          newErrors[`address_${idx}`] = 'La dirección es requerida';
        } else if (address.address.length < 5) {
          newErrors[`address_${idx}`] = 'La dirección debe tener al menos 5 caracteres';
        }
        if (!address.typeId) {
          newErrors[`address_type_${idx}`] = 'Debe seleccionar un tipo';
        }
        if (address.isPrimary) hasPrimary = true;
      });
      if (!hasPrimary) newErrors.addresses = 'Debe marcar una dirección como principal';
    }

    // Educación
    if (formData.educations && formData.educations.length) {
      formData.educations.forEach((edu, idx) => {
        if (!edu.institution.trim()) {
          newErrors[`education_institution_${idx}`] = 'La institución es requerida';
        }
        if (!edu.degree.trim()) {
          newErrors[`education_degree_${idx}`] = 'El grado/título es requerido';
        }
        if (!edu.startDate) {
          newErrors[`education_startDate_${idx}`] = 'La fecha de inicio es requerida';
        }
        if (edu.endDate && edu.startDate && edu.endDate < edu.startDate) {
          newErrors[`education_endDate_${idx}`] = 'La fecha de fin no puede ser anterior a la de inicio';
        }
        if (!edu.typeId) {
          newErrors[`education_type_${idx}`] = 'Debe seleccionar un tipo';
        }
      });
    }

    // Experiencia
    if (formData.experiences && formData.experiences.length) {
      formData.experiences.forEach((exp, idx) => {
        if (!exp.company.trim()) {
          newErrors[`experience_company_${idx}`] = 'La empresa es requerida';
        }
        if (!exp.position.trim()) {
          newErrors[`experience_position_${idx}`] = 'El puesto es requerido';
        }
        if (!exp.startDate) {
          newErrors[`experience_startDate_${idx}`] = 'La fecha de inicio es requerida';
        }
        if (exp.endDate && exp.startDate && exp.endDate < exp.startDate) {
          newErrors[`experience_endDate_${idx}`] = 'La fecha de fin no puede ser anterior a la de inicio';
        }
        if (!exp.typeId) {
          newErrors[`experience_type_${idx}`] = 'Debe seleccionar un tipo';
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Limpiar los arreglos dinámicos antes de enviar
      const cleanedEmails = formData.emails.filter(e => e.email.trim() !== '');
      const cleanedPhones = formData.phones.filter(p => p.phone.trim() !== '');
      const cleanedAddresses = formData.addresses.filter(a => a.address.trim() !== '');
      const cleanedEducations = (formData.educations || []).filter(e => e.institution.trim() !== '' && e.degree.trim() !== '');
      const cleanedExperiences = (formData.experiences || []).filter(e => e.company.trim() !== '' && e.position.trim() !== '');

      // Enviar todos los campos requeridos al backend
      const formDataToSend = {
        personalId: formData.personalId,
        firstName: formData.firstName,
        secondName: formData.secondName,
        firstSurname: formData.firstSurname,
        secondSurname: formData.secondSurname,
        resumeUrl: formData.resumeUrl,
        emails: cleanedEmails,
        phones: cleanedPhones,
        addresses: cleanedAddresses,
        educations: cleanedEducations,
        experiences: cleanedExperiences,
      };

      if (candidate?.id) {
        // Actualizar candidato existente
        await axios.put(`/api/candidates/${candidate.id}`, formDataToSend);
        const fullName = `${formData.firstName} ${formData.firstSurname}`.trim();
        setSuccessMessage(`El candidato ${fullName} ha sido actualizado correctamente en el sistema`);
      } else {
        // Crear nuevo candidato
        await axios.post('/api/candidates', formDataToSend);
        const fullName = `${formData.firstName} ${formData.firstSurname}`.trim();
        setSuccessMessage(`El candidato ${fullName} ha sido ingresado correctamente al sistema`);
      }

      // Esperar un poco para mostrar el mensaje antes de cerrar
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 2000);
    } catch (error: any) {
      if (error.response?.data?.error) {
        // Si es un array (Zod), mapear los errores a los campos
        if (Array.isArray(error.response.data.error)) {
          const backendErrors: Record<string, string> = {};
          error.response.data.error.forEach((err: any) => {
            console.log('Zod error path:', err.path, 'message:', err.message);
            if (Array.isArray(err.path) && err.path.length > 0) {
              // emails.0.email => email_0
              if (
                err.path.length === 3 &&
                typeof err.path[0] === 'string' &&
                typeof err.path[1] === 'number'
              ) {
                // emails.0.email, phones.1.phone, addresses.2.address, etc.
                const field = err.path[0].slice(0, -1); // emails -> email
                const idx = err.path[1];
                backendErrors[`${field}_${idx}`] = err.message;
              } else if (
                err.path.length === 2 &&
                typeof err.path[0] === 'string' &&
                typeof err.path[1] === 'string'
              ) {
                // Para campos simples anidados, ej: educations.institution
                backendErrors[`${err.path[0]}_${err.path[1]}`] = err.message;
              } else if (
                err.path.length === 1 &&
                typeof err.path[0] === 'string'
              ) {
                // Para campos simples, ej: firstName, emails, phones, addresses
                let msg = err.message;
                if (msg === 'Required') {
                  if (err.path[0] === 'emails') msg = 'Debe ingresar al menos un email';
                  if (err.path[0] === 'phones') msg = 'Debe ingresar al menos un teléfono';
                  if (err.path[0] === 'addresses') msg = 'Debe ingresar al menos una dirección';
                }
                backendErrors[err.path[0]] = msg;
              }
            }
          });
          setErrors(backendErrors);
          console.log('Errores del backend:', backendErrors);
          setSubmitError('Corrige los campos marcados en rojo.');
        } else {
          const fullName = `${formData.firstName} ${formData.firstSurname}`.trim();
          setSubmitError(`Error al guardar el candidato ${fullName}: ${error.response.data.error}`);
        }
      } else {
        const fullName = `${formData.firstName} ${formData.firstSurname}`.trim();
        setSubmitError(`Error al guardar el candidato ${fullName}. Por favor, inténtelo nuevamente.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData(candidate || initialFormData);
    setErrors({});
    setSubmitError('');
    setSuccessMessage('');
    setLoading(false);
    onClose();
  };

  const handleInputChange = (field: keyof Candidate) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Agregar funciones para manejar emails dinámicos
  const handleEmailChange = (index: number, value: string) => {
    setFormData(prev => {
      const emails = [...prev.emails];
      emails[index].email = value;
      return { ...prev, emails };
    });
  };

  const handleAddEmail = () => {
    setFormData(prev => ({
      ...prev,
      emails: [...prev.emails, { email: '', isPrimary: false }],
    }));
  };

  const handleRemoveEmail = (index: number) => {
    setFormData(prev => {
      const emails = prev.emails.filter((_, i) => i !== index);
      // Si eliminamos el principal, marcamos el primero como principal
      if (!emails.some(e => e.isPrimary) && emails.length > 0) {
        emails[0].isPrimary = true;
      }
      return { ...prev, emails };
    });
  };

  const handleSetPrimaryEmail = (index: number) => {
    setFormData(prev => {
      const emails = prev.emails.map((e, i) => ({ ...e, isPrimary: i === index }));
      return { ...prev, emails };
    });
  };

  // Catálogo de tipos de teléfono (puedes reemplazarlo por uno dinámico si lo tienes)
  const phoneTypes = [
    { id: 1, name: 'Móvil' },
    { id: 2, name: 'Casa' },
    { id: 3, name: 'Trabajo' },
  ];

  // Funciones para manejar teléfonos dinámicos
  const handlePhoneChange = (index: number, field: keyof CandidatePhone, value: string | number | boolean) => {
    setFormData(prev => {
      const phones = [...prev.phones];
      phones[index] = { ...phones[index], [field]: value };
      return { ...prev, phones };
    });
  };

  const handleAddPhone = () => {
    setFormData(prev => ({
      ...prev,
      phones: [...prev.phones, { phone: '', typeId: 1, isPrimary: false }],
    }));
  };

  const handleRemovePhone = (index: number) => {
    setFormData(prev => {
      const phones = prev.phones.filter((_, i) => i !== index);
      // Si eliminamos el principal, marcamos el primero como principal
      if (!phones.some(p => p.isPrimary) && phones.length > 0) {
        phones[0].isPrimary = true;
      }
      return { ...prev, phones };
    });
  };

  const handleSetPrimaryPhone = (index: number) => {
    setFormData(prev => {
      const phones = prev.phones.map((p, i) => ({ ...p, isPrimary: i === index }));
      return { ...prev, phones };
    });
  };

  // Catálogo de tipos de dirección (puedes reemplazarlo por uno dinámico si lo tienes)
  const addressTypes = [
    { id: 1, name: 'Casa' },
    { id: 2, name: 'Trabajo' },
    { id: 3, name: 'Otro' },
  ];

  // Funciones para manejar direcciones dinámicas
  const handleAddressChange = (index: number, field: keyof CandidateAddress, value: string | number | boolean) => {
    setFormData(prev => {
      const addresses = [...prev.addresses];
      addresses[index] = { ...addresses[index], [field]: value };
      return { ...prev, addresses };
    });
  };

  const handleAddAddress = () => {
    setFormData(prev => ({
      ...prev,
      addresses: [...prev.addresses, { address: '', typeId: 1, isPrimary: false }],
    }));
  };

  const handleRemoveAddress = (index: number) => {
    setFormData(prev => {
      const addresses = prev.addresses.filter((_, i) => i !== index);
      // Si eliminamos la principal, marcamos la primera como principal
      if (!addresses.some(a => a.isPrimary) && addresses.length > 0) {
        addresses[0].isPrimary = true;
      }
      return { ...prev, addresses };
    });
  };

  const handleSetPrimaryAddress = (index: number) => {
    setFormData(prev => {
      const addresses = prev.addresses.map((a, i) => ({ ...a, isPrimary: i === index }));
      return { ...prev, addresses };
    });
  };

  // Catálogo de tipos de educación y experiencia (puedes reemplazarlo por uno dinámico si lo tienes)
  // Los catálogos ahora se obtienen dinámicamente

  // Funciones para manejar educación dinámica
  const handleEducationChange = (index: number, field: keyof CandidateEducation, value: string | number) => {
    setFormData(prev => {
      const educations = prev.educations ? [...prev.educations] : [];
      educations[index] = { ...educations[index], [field]: value };
      return { ...prev, educations };
    });
  };
  const handleAddEducation = () => {
    setFormData(prev => ({
      ...prev,
      educations: [...(prev.educations || []), {
        institution: '',
        degree: '',
        startDate: '',
        endDate: '',
        typeId: educationTypes.length > 0 ? educationTypes[0].id : 1
      }],
    }));
  };
  const handleRemoveEducation = (index: number) => {
    setFormData(prev => {
      const educations = (prev.educations || []).filter((_, i) => i !== index);
      return { ...prev, educations };
    });
  };
  // Funciones para manejar experiencia dinámica
  const handleExperienceChange = (index: number, field: keyof CandidateExperience, value: string | number) => {
    setFormData(prev => {
      const experiences = prev.experiences ? [...prev.experiences] : [];
      experiences[index] = { ...experiences[index], [field]: value };
      return { ...prev, experiences };
    });
  };
  const handleAddExperience = () => {
    setFormData(prev => ({
      ...prev,
      experiences: [...(prev.experiences || []), {
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        description: '',
        typeId: experienceTypes.length > 0 ? experienceTypes[0].id : 1
      }],
    }));
  };
  const handleRemoveExperience = (index: number) => {
    setFormData(prev => {
      const experiences = (prev.experiences || []).filter((_, i) => i !== index);
      return { ...prev, experiences };
    });
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1,
        borderBottom: '1px solid #e0e0e0'
      }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
          {candidate?.id ? 'Editar Candidato' : 'Nuevo Candidato'}
        </Typography>
        <Button
          onClick={handleClose}
          sx={{ minWidth: 'auto', p: 1 }}
        >
          <CloseIcon />
        </Button>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 3 }}>
          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}
          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMessage}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="ID Personal"
              value={formData.personalId}
              onChange={handleInputChange('personalId')}
              error={!!errors.personalId}
              helperText={errors.personalId}
              fullWidth
              required
              placeholder="Ej: 12345678"
            />

            <TextField
              label="Primer Nombre"
              value={formData.firstName}
              onChange={handleInputChange('firstName')}
              error={!!errors.firstName}
              helperText={errors.firstName}
              fullWidth
              required
              placeholder="Ej: Juan"
            />

            <TextField
              label="Segundo Nombre"
              value={formData.secondName || ''}
              onChange={handleInputChange('secondName')}
              error={!!errors.secondName}
              helperText={errors.secondName}
              fullWidth
              placeholder="Ej: Carlos"
            />

            <TextField
              label="Primer Apellido"
              value={formData.firstSurname}
              onChange={handleInputChange('firstSurname')}
              error={!!errors.firstSurname}
              helperText={errors.firstSurname}
              fullWidth
              required
              placeholder="Ej: Pérez"
            />

            <TextField
              label="Segundo Apellido"
              value={formData.secondSurname || ''}
              onChange={handleInputChange('secondSurname')}
              error={!!errors.secondSurname}
              helperText={errors.secondSurname}
              fullWidth
              placeholder="Ej: Gómez"
            />

            {/* Aquí irán los campos dinámicos: emails, phones, addresses, educations, experiences */}

            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 500 }}>
              Emails
            </Typography>
            {errors.emails && (
              <Typography color="error" variant="body2" sx={{ mb: 1 }}>
                {errors.emails}
              </Typography>
            )}
            {formData.emails.map((email, idx) => (
              <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                  label={`Email #${idx + 1}`}
                  type="email"
                  value={email.email}
                  onChange={e => handleEmailChange(idx, e.target.value)}
                  error={!!errors[`email_${idx}`]}
                  helperText={errors[`email_${idx}`]}
                  fullWidth
                  required={idx === 0}
                  placeholder="ejemplo@email.com"
                />
                <Button
                  variant={email.isPrimary ? 'contained' : 'outlined'}
                  color="primary"
                  onClick={() => handleSetPrimaryEmail(idx)}
                  sx={{ minWidth: 36, p: 1 }}
                  // El botón siempre habilitado para alternar principal
                  title="Marcar como principal"
                >
                  ★
                </Button>
                {formData.emails.length > 1 && (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleRemoveEmail(idx)}
                    sx={{ minWidth: 36, p: 1 }}
                    title="Eliminar email"
                  >
                    ✕
                  </Button>
                )}
              </Box>
            ))}
            <Button onClick={handleAddEmail} variant="text" sx={{ width: 'fit-content', mt: 1 }}>
              + Agregar email
            </Button>

            {/* Teléfonos dinámicos */}
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 500 }}>
              Teléfonos
            </Typography>
            {errors.phones && (
              <Typography color="error" variant="body2" sx={{ mb: 1 }}>
                {errors.phones}
              </Typography>
            )}
            {formData.phones.map((phone, idx) => (
              <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                  label={`Teléfono #${idx + 1}`}
                  value={phone.phone}
                  onChange={e => handlePhoneChange(idx, 'phone', e.target.value)}
                  error={!!errors[`phone_${idx}`]}
                  helperText={errors[`phone_${idx}`]}
                  fullWidth
                  required={idx === 0}
                  placeholder="Ej: +51 999 888 777"
                />
                <TextField
                  select
                  label="Tipo"
                  value={phone.typeId}
                  onChange={e => handlePhoneChange(idx, 'typeId', Number(e.target.value))}
                  SelectProps={{ native: true }}
                  sx={{ minWidth: 120 }}
                  error={!!errors[`phone_type_${idx}`]}
                  helperText={errors[`phone_type_${idx}`]}
                >
                  {phoneTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </TextField>
                <Button
                  variant={phone.isPrimary ? 'contained' : 'outlined'}
                  color="primary"
                  onClick={() => handleSetPrimaryPhone(idx)}
                  sx={{ minWidth: 36, p: 1 }}
                  // El botón siempre habilitado para alternar principal
                  title="Marcar como principal"
                >
                  ★
                </Button>
                {formData.phones.length > 1 && (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleRemovePhone(idx)}
                    sx={{ minWidth: 36, p: 1 }}
                    title="Eliminar teléfono"
                  >
                    ✕
                  </Button>
                )}
              </Box>
            ))}
            <Button onClick={handleAddPhone} variant="text" sx={{ width: 'fit-content', mt: 1 }}>
              + Agregar teléfono
            </Button>

            {/* Direcciones dinámicas */}
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 500 }}>
              Direcciones
            </Typography>
            {errors.addresses && (
              <Typography color="error" variant="body2" sx={{ mb: 1 }}>
                {errors.addresses}
              </Typography>
            )}
            {formData.addresses.map((address, idx) => (
              <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                  label={`Dirección #${idx + 1}`}
                  value={address.address}
                  onChange={e => handleAddressChange(idx, 'address', e.target.value)}
                  error={!!errors[`address_${idx}`]}
                  helperText={errors[`address_${idx}`]}
                  fullWidth
                  required={idx === 0}
                  placeholder="Ej: Av. Siempre Viva 123"
                />
                <TextField
                  select
                  label="Tipo"
                  value={address.typeId}
                  onChange={e => handleAddressChange(idx, 'typeId', Number(e.target.value))}
                  SelectProps={{ native: true }}
                  sx={{ minWidth: 120 }}
                  error={!!errors[`address_type_${idx}`]}
                  helperText={errors[`address_type_${idx}`]}
                >
                  {addressTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </TextField>
                <Button
                  variant={address.isPrimary ? 'contained' : 'outlined'}
                  color="primary"
                  onClick={() => handleSetPrimaryAddress(idx)}
                  sx={{ minWidth: 36, p: 1 }}
                  // El botón siempre habilitado para alternar principal
                  title="Marcar como principal"
                >
                  ★
                </Button>
                {formData.addresses.length > 1 && (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleRemoveAddress(idx)}
                    sx={{ minWidth: 36, p: 1 }}
                    title="Eliminar dirección"
                  >
                    ✕
                  </Button>
                )}
              </Box>
            ))}
            <Button onClick={handleAddAddress} variant="text" sx={{ width: 'fit-content', mt: 1 }}>
              + Agregar dirección
            </Button>

            {/* Educación dinámica */}
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 500 }}>
              Educación
            </Typography>
            {(formData.educations || []).map((edu, idx) => (
              <Box key={idx} sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, mb: 1 }}>
                <TextField
                  label="Institución"
                  value={edu.institution}
                  onChange={e => handleEducationChange(idx, 'institution', e.target.value)}
                  error={!!errors[`education_institution_${idx}`]}
                  helperText={errors[`education_institution_${idx}`]}
                  sx={{ minWidth: 180 }}
                  required
                />
                <TextField
                  label="Grado/Título"
                  value={edu.degree}
                  onChange={e => handleEducationChange(idx, 'degree', e.target.value)}
                  error={!!errors[`education_degree_${idx}`]}
                  helperText={errors[`education_degree_${idx}`]}
                  sx={{ minWidth: 140 }}
                  required
                />
                <TextField
                  label="Inicio"
                  type="date"
                  value={edu.startDate}
                  onChange={e => handleEducationChange(idx, 'startDate', e.target.value)}
                  error={!!errors[`education_startDate_${idx}`]}
                  helperText={errors[`education_startDate_${idx}`]}
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: 120 }}
                  required
                />
                <TextField
                  label="Fin"
                  type="date"
                  value={edu.endDate || ''}
                  onChange={e => handleEducationChange(idx, 'endDate', e.target.value)}
                  error={!!errors[`education_endDate_${idx}`]}
                  helperText={errors[`education_endDate_${idx}`]}
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: 120 }}
                />
                <TextField
                  select
                  label="Tipo"
                  value={edu.typeId}
                  onChange={e => handleEducationChange(idx, 'typeId', Number(e.target.value))}
                  SelectProps={{ native: true }}
                  sx={{ minWidth: 120 }}
                  error={!!errors[`education_type_${idx}`]}
                  helperText={errors[`education_type_${idx}`]}
                  disabled={educationTypes.length === 0}
                >
                  {educationTypes.length === 0 ? (
                    <option value="">Cargando tipos...</option>
                  ) : (
                    <>
                      <option value="">Seleccione...</option>
                      {educationTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </>
                  )}
                </TextField>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => handleRemoveEducation(idx)}
                  sx={{ minWidth: 36, p: 1 }}
                  title="Eliminar educación"
                >
                  ✕
                </Button>
              </Box>
            ))}
            <Button onClick={handleAddEducation} variant="text" sx={{ width: 'fit-content', mt: 1 }}>
              + Agregar educación
            </Button>
            {/* Experiencia dinámica */}
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 500 }}>
              Experiencia
            </Typography>
            {(formData.experiences || []).map((exp, idx) => (
              <Box key={idx} sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, mb: 1 }}>
                <TextField
                  label="Empresa"
                  value={exp.company}
                  onChange={e => handleExperienceChange(idx, 'company', e.target.value)}
                  error={!!errors[`experience_company_${idx}`]}
                  helperText={errors[`experience_company_${idx}`]}
                  sx={{ minWidth: 180 }}
                  required
                />
                <TextField
                  label="Puesto"
                  value={exp.position}
                  onChange={e => handleExperienceChange(idx, 'position', e.target.value)}
                  error={!!errors[`experience_position_${idx}`]}
                  helperText={errors[`experience_position_${idx}`]}
                  sx={{ minWidth: 140 }}
                  required
                />
                <TextField
                  label="Inicio"
                  type="date"
                  value={exp.startDate}
                  onChange={e => handleExperienceChange(idx, 'startDate', e.target.value)}
                  error={!!errors[`experience_startDate_${idx}`]}
                  helperText={errors[`experience_startDate_${idx}`]}
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: 120 }}
                  required
                />
                <TextField
                  label="Fin"
                  type="date"
                  value={exp.endDate || ''}
                  onChange={e => handleExperienceChange(idx, 'endDate', e.target.value)}
                  error={!!errors[`experience_endDate_${idx}`]}
                  helperText={errors[`experience_endDate_${idx}`]}
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: 120 }}
                />
                <TextField
                  label="Descripción"
                  value={exp.description || ''}
                  onChange={e => handleExperienceChange(idx, 'description', e.target.value)}
                  sx={{ minWidth: 200 }}
                  multiline
                  rows={1}
                />
                <TextField
                  select
                  label="Tipo"
                  value={exp.typeId}
                  onChange={e => handleExperienceChange(idx, 'typeId', Number(e.target.value))}
                  SelectProps={{ native: true }}
                  sx={{ minWidth: 120 }}
                  error={!!errors[`experience_type_${idx}`]}
                  helperText={errors[`experience_type_${idx}`]}
                  disabled={experienceTypes.length === 0}
                >
                  {experienceTypes.length === 0 ? (
                    <option value="">Cargando tipos...</option>
                  ) : (
                    <>
                      <option value="">Seleccione...</option>
                      {experienceTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </>
                  )}
                </TextField>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => handleRemoveExperience(idx)}
                  sx={{ minWidth: 36, p: 1 }}
                  title="Eliminar experiencia"
                >
                  ✕
                </Button>
              </Box>
            ))}
            <Button onClick={handleAddExperience} variant="text" sx={{ width: 'fit-content', mt: 1 }}>
              + Agregar experiencia
            </Button>

            <TextField
              label="URL del CV"
              value={formData.resumeUrl || ''}
              onChange={handleInputChange('resumeUrl')}
              error={!!errors.resumeUrl}
              helperText={errors.resumeUrl || 'Opcional - Enlace a CV/Resume'}
              fullWidth
              placeholder="https://drive.google.com/file/..."
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={handleClose}
            variant="outlined"
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
            disabled={loading}
            sx={{
              backgroundColor: '#008080',
              '&:hover': { backgroundColor: '#006666' },
              fontWeight: 600,
            }}
          >
            {loading ? 'Guardando...' : (candidate?.id ? 'Actualizar' : 'Crear')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}