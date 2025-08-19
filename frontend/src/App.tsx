import React, { useEffect, useState } from 'react';
import {
  Box,
  TextField,
  Typography,
  Container,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import axios from 'axios';
import { Button } from '@mui/material';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CandidateForm from './components/CandidateForm';
import EmailGrid from './components/EmailGrid';
import PhoneGrid from './components/PhoneGrid';
import AddressGrid from './components/AddressGrid';
import EducationGrid from './components/EducationGrid';
import ExperienceGrid from './components/ExperienceGrid';
import type { Candidate as CandidateFormType, CandidateEmail, CandidatePhone, CandidateAddress } from './types/candidate';

interface Candidate {
  id: number;
  name: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
  createdAt: string; // Cambiar a string ya que JSON.stringify convierte Date a string
  updatedAt: string;
}

const columns: GridColDef[] = [
  {
    field: 'entryDate',
    headerName: 'Fecha de ingreso',
    width: 140,
    renderCell: (params: any) => {
      const value = params.row.entryDate;
      if (!value) return 'Sin fecha';
      const date = new Date(value);
      if (isNaN(date.getTime())) return 'Fecha inválida';
      return date.toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    },
  },
  {
    field: 'personalId',
    headerName: 'ID Personal',
    width: 120,
  },
  {
    field: 'fullName',
    headerName: 'Nombre completo',
    width: 180,
    renderCell: (params: any) => (
      <Box sx={{ fontWeight: 500 }}>{params.value}</Box>
    ),
  },
  {
    field: 'firstName',
    headerName: 'Primer Nombre',
    width: 140,
  },
  {
    field: 'secondName',
    headerName: 'Segundo Nombre',
    width: 140,
  },
  {
    field: 'firstSurname',
    headerName: 'Primer Apellido',
    width: 140,
  },
  {
    field: 'secondSurname',
    headerName: 'Segundo Apellido',
    width: 140,
  },
  {
    field: 'actions',
    headerName: 'Acciones',
    width: 340,
    sortable: false,
    renderCell: (params: any) => (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.2 }}>
        <Box sx={{ display: 'flex', gap: 0.2, mb: 0.2 }}>
          <Tooltip title="Editar">
            <IconButton size="small" onClick={() => params.row.onEdit(params.row)} sx={{ color: '#008080', p: 0.2, minWidth: 22, minHeight: 22 }}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar">
            <IconButton size="small" onClick={() => params.row.onDelete(params.row)} sx={{ color: '#d32f2f', p: 0.2, minWidth: 22, minHeight: 22 }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Ver emails">
            <IconButton size="small" onClick={() => params.row.onViewEmails(params.row)} sx={{ color: '#1976d2', p: 0.2, minWidth: 22, minHeight: 22 }}>
              <span role="img" aria-label="email" style={{ fontSize: 15 }}>📧</span>
            </IconButton>
          </Tooltip>
          <Tooltip title="Ver teléfonos">
            <IconButton size="small" onClick={() => params.row.onViewPhones(params.row)} sx={{ color: '#43a047', p: 0.2, minWidth: 22, minHeight: 22 }}>
              <span role="img" aria-label="phone" style={{ fontSize: 15 }}>📞</span>
            </IconButton>
          </Tooltip>
        </Box>
        <Box sx={{ display: 'flex', gap: 0.2 }}>
          <Tooltip title="Ver direcciones">
            <IconButton size="small" onClick={() => params.row.onViewAddresses(params.row)} sx={{ color: '#8e24aa', p: 0.2, minWidth: 22, minHeight: 22 }}>
              <span role="img" aria-label="address" style={{ fontSize: 15 }}>🏠</span>
            </IconButton>
          </Tooltip>
          <Tooltip title="Ver educación">
            <IconButton size="small" onClick={() => params.row.onViewEducations(params.row)} sx={{ color: '#0288d1', p: 0.2, minWidth: 22, minHeight: 22 }}>
              <span role="img" aria-label="education" style={{ fontSize: 15 }}>🎓</span>
            </IconButton>
          </Tooltip>
          <Tooltip title="Ver experiencia">
            <IconButton size="small" onClick={() => params.row.onViewExperiences(params.row)} sx={{ color: '#fbc02d', p: 0.2, minWidth: 22, minHeight: 22 }}>
              <span role="img" aria-label="experience" style={{ fontSize: 15 }}>💼</span>
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    ),
  },
];

function App() {
  // ...existing code...
  // Definir filteredRows justo antes del return
  // ...existing code...
  const [candidates, setCandidates] = useState<any[]>([]);
  const [filter, setFilter] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateFormType | null>(null);
  const [loading, setLoading] = useState(false);
  const [openEmailGrid, setOpenEmailGrid] = useState(false);
  const [emailGridData, setEmailGridData] = useState<any[]>([]);
  const [emailError, setEmailError] = useState<string>('');
  const [openPhoneGrid, setOpenPhoneGrid] = useState(false);
  const [phoneGridData, setPhoneGridData] = useState<any[]>([]);
  const [phoneError, setPhoneError] = useState<string>('');
  const [openAddressGrid, setOpenAddressGrid] = useState(false);
  const [addressGridData, setAddressGridData] = useState<any[]>([]);
  const [openEducationGrid, setOpenEducationGrid] = useState(false);
  const [educationGridData, setEducationGridData] = useState<any[]>([]);
  const [openExperienceGrid, setOpenExperienceGrid] = useState(false);
  const [experienceGridData, setExperienceGridData] = useState<any[]>([]);
  // --- EDUCATIONS ---
  const handleViewEducations = async (candidate: any) => {
    try {
      const response = await axios.get(`/api/candidates/${candidate.id}/educations`);
      if (response.data && Array.isArray(response.data.educations)) {
        setEducationGridData(response.data.educations);
      } else {
        setEducationGridData([]);
      }
    } catch (error) {
      setEducationGridData([]);
    }
    setOpenEducationGrid(true);
  };

  // Guardar educaciones
  // Guardar educaciones usando el endpoint de actualización de candidato
  const handleSaveEducations = async (newEducations: any[]) => {
    if (!selectedCandidate) return;
    const candidateId = selectedCandidate.id;
    try {
      // Limpiar y mapear educations
      const educations = newEducations.map((edu: any) => ({
        institution: edu.institution,
        degree: edu.degree,
        startDate: edu.startDate ? edu.startDate : '',
        endDate: edu.endDate ? edu.endDate : undefined,
        typeId: edu.typeId,
      }));
      await axios.put(`/api/candidates/${candidateId}`, { educations });
      fetchCandidates();
      setOpenEducationGrid(false);
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.error) {
        const errMsg = Array.isArray(error.response.data.error)
          ? error.response.data.error.map((e: any) => e.message).join(' ')
          : error.response.data.error;
        alert(errMsg);
      } else {
        alert('Error al guardar las educaciones');
      }
    }
  };

  // --- EXPERIENCES ---
  const handleViewExperiences = async (candidate: any) => {
    try {
      const response = await axios.get(`/api/candidates/${candidate.id}/experiences`);
      if (response.data && Array.isArray(response.data.experiences)) {
        setExperienceGridData(response.data.experiences);
      } else {
        setExperienceGridData([]);
      }
    } catch (error) {
      setExperienceGridData([]);
    }
    setOpenExperienceGrid(true);
  };

  // Guardar experiencias usando el endpoint de actualización de candidato
  const handleSaveExperiences = async (newExperiences: any[]) => {
    if (!selectedCandidate) return;
    const candidateId = selectedCandidate.id;
    try {
      // Limpiar y mapear experiences
      const experiences = newExperiences.map((exp: any) => ({
        company: exp.company,
        position: exp.position,
        startDate: exp.startDate ? exp.startDate : '',
        endDate: exp.endDate ? exp.endDate : undefined,
        typeId: exp.typeId,
        description: exp.description ?? '',
      }));
      await axios.put(`/api/candidates/${candidateId}`, { experiences });
      fetchCandidates();
      setOpenExperienceGrid(false);
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.error) {
        const errMsg = Array.isArray(error.response.data.error)
          ? error.response.data.error.map((e: any) => e.message).join(' ')
          : error.response.data.error;
        alert(errMsg);
      } else {
        alert('Error al guardar las experiencias');
      }
    }
  };

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const response = await axios.get<Candidate[]>('/api/candidates');
      setCandidates(response.data);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  // Editar candidato: poblar con todos los datos dependientes
  const handleEdit = async (candidate: Candidate) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/candidates/${candidate.id}`);
      // El backend debe devolver el candidato con emails, phones, addresses, educations, experiences
      const fullCandidate = response.data;
      setSelectedCandidate({
        id: fullCandidate.id,
        personalId: fullCandidate.personalId || '',
        firstName: fullCandidate.firstName || '',
        secondName: fullCandidate.secondName || '',
        firstSurname: fullCandidate.firstSurname || '',
        secondSurname: fullCandidate.secondSurname || '',
        resumeUrl: fullCandidate.resumeUrl || '',
        emails: fullCandidate.emails || [],
        phones: fullCandidate.phones || [],
        addresses: fullCandidate.addresses || [],
        educations: fullCandidate.educations || [],
        experiences: fullCandidate.experiences || [],
      });
      setOpenForm(true);
    } catch (error) {
      // Si falla, poblar con lo que hay
      setSelectedCandidate(mapToFormCandidate(candidate));
      setOpenForm(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (candidate: Candidate) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar a ${candidate.name}?`)) {
      try {
        await axios.delete(`/api/candidates/${candidate.id}`);
        await fetchCandidates();
      } catch (error) {
        console.error('Error deleting candidate:', error);
        alert('Error al eliminar el candidato');
      }
    }
  };

  const handleFormSuccess = () => {
    fetchCandidates();
    setSelectedCandidate(null);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedCandidate(null);
  };
  // --- EMAILS ---
  const handleViewEmails = async (candidate: any) => {
    try {
      const response = await axios.get(`/api/candidates/${candidate.id}/emails`);
      if (response.data && Array.isArray(response.data.emails)) {
        setEmailGridData(response.data.emails);
      } else {
        setEmailGridData([]);
      }
    } catch (error) {
      setEmailGridData([]);
    }
    setOpenEmailGrid(true);
  };

  const handleSaveEmails = async (newEmails: CandidateEmail[]) => {
    if (!selectedCandidate) return;
    const candidateId = selectedCandidate.id;
    setEmailError('');
    try {
      const response = await axios.get(`/api/candidates/${candidateId}/emails`);
      const originalEmails: CandidateEmail[] = Array.isArray(response.data.emails) ? response.data.emails : [];
      for (const orig of originalEmails) {
        if (!newEmails.find((e: CandidateEmail) => e.id === orig.id)) {
          await axios.delete(`/api/candidates/${candidateId}/emails/${orig.id}`);
        }
      }
      for (const email of newEmails) {
        if (!email.id) {
          await axios.post(`/api/candidates/${candidateId}/emails`, email);
        }
      }
      for (const email of newEmails) {
        const orig = originalEmails.find((e: CandidateEmail) => e.id === email.id);
        if (email.id && orig && (email.email !== orig.email || email.isPrimary !== orig.isPrimary)) {
          await axios.put(`/api/candidates/${candidateId}/emails/${email.id}`, email);
        }
      }
      fetchCandidates();
      setOpenEmailGrid(false);
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.error) {
        const errMsg = Array.isArray(error.response.data.error)
          ? error.response.data.error.map((e: any) => e.message).join(' ')
          : error.response.data.error;
        setEmailError(errMsg);
      } else {
        setEmailError('Error al guardar los emails');
      }
    }
  };

  // --- PHONES ---
  const handleViewPhones = async (candidate: any) => {
    try {
      const response = await axios.get(`/api/candidates/${candidate.id}/phones`);
      if (response.data && Array.isArray(response.data.phones)) {
        setPhoneGridData(response.data.phones);
      } else {
        setPhoneGridData([]);
      }
    } catch (error) {
      setPhoneGridData([]);
    }
    setPhoneError('');
    setOpenPhoneGrid(true);
  };

  const handleSavePhones = async (newPhones: CandidatePhone[]) => {
    if (!selectedCandidate) return;
    const candidateId = selectedCandidate.id;
    setPhoneError('');
    try {
      const response = await axios.get(`/api/candidates/${candidateId}/phones`);
      const originalPhones: CandidatePhone[] = Array.isArray(response.data.phones) ? response.data.phones : [];
      for (const orig of originalPhones) {
        if (!newPhones.find((e: CandidatePhone) => e.id === orig.id)) {
          await axios.delete(`/api/candidates/${candidateId}/phones/${orig.id}`);
        }
      }
      for (const phone of newPhones) {
        if (!phone.id) {
          await axios.post(`/api/candidates/${candidateId}/phones`, phone);
        }
      }
      for (const phone of newPhones) {
        const orig = originalPhones.find((e: CandidatePhone) => e.id === phone.id);
        if (phone.id && orig && (phone.phone !== orig.phone || phone.typeId !== orig.typeId || phone.isPrimary !== orig.isPrimary)) {
          await axios.put(`/api/candidates/${candidateId}/phones/${phone.id}`, phone);
        }
      }
      fetchCandidates();
      setOpenPhoneGrid(false);
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.error) {
        // Zod error: error.response.data.error is array
        const errMsg = Array.isArray(error.response.data.error)
          ? error.response.data.error.map((e: any) => e.message).join(' ')
          : error.response.data.error;
        setPhoneError(errMsg);
      } else {
        setPhoneError('Error al guardar los teléfonos');
      }
    }
  };

  // --- ADDRESSES ---
  const handleViewAddresses = async (candidate: any) => {
    try {
      const response = await axios.get(`/api/candidates/${candidate.id}/addresses`);
      if (response.data && Array.isArray(response.data.addresses)) {
        setAddressGridData(response.data.addresses);
      } else {
        setAddressGridData([]);
      }
    } catch (error) {
      setAddressGridData([]);
    }
    setOpenAddressGrid(true);
  };

  const handleSaveAddresses = async (newAddresses: CandidateAddress[]) => {
    if (!selectedCandidate) return;
    const candidateId = selectedCandidate.id;
    try {
      const response = await axios.get(`/api/candidates/${candidateId}/addresses`);
      const originalAddresses: CandidateAddress[] = Array.isArray(response.data.addresses) ? response.data.addresses : [];
      for (const orig of originalAddresses) {
        if (!newAddresses.find((e: CandidateAddress) => e.id === orig.id)) {
          await axios.delete(`/api/candidates/${candidateId}/addresses/${orig.id}`);
        }
      }
      for (const address of newAddresses) {
        if (!address.id) {
          await axios.post(`/api/candidates/${candidateId}/addresses`, address);
        }
      }
      for (const address of newAddresses) {
        const orig = originalAddresses.find((e: CandidateAddress) => e.id === address.id);
        if (address.id && orig && (address.address !== orig.address || address.typeId !== orig.typeId || address.isPrimary !== orig.isPrimary)) {
          await axios.put(`/api/candidates/${candidateId}/addresses/${address.id}`, address);
        }
      }
      fetchCandidates();
    } catch (error) {
      alert('Error al guardar las direcciones');
    }
    setOpenAddressGrid(false);
  }
  // ...existing code...

  // Función para mapear el candidato plano al modelo extendido
  function mapToFormCandidate(candidate: Candidate): CandidateFormType {
  // ...existing code...
  // Definir filteredRows justo antes del return, asegurando que todas las funciones estén presentes
  const filteredRows = candidates
    .map((candidate: Candidate) => {
      const row = {
        ...candidate,
        onEdit: () => handleEdit(candidate),
        onDelete: () => handleDelete(candidate),
        onViewEmails: () => {
          setSelectedCandidate(mapToFormCandidate(candidate));
          handleViewEmails(candidate);
        },
        onViewPhones: () => {
          setSelectedCandidate(mapToFormCandidate(candidate));
          handleViewPhones(candidate);
        },
        onViewAddresses: () => {
          setSelectedCandidate(mapToFormCandidate(candidate));
          handleViewAddresses(candidate);
        },
        onViewEducations: () => {
          setSelectedCandidate(mapToFormCandidate(candidate));
          handleViewEducations(candidate);
        },
        onViewExperiences: () => {
          setSelectedCandidate(mapToFormCandidate(candidate));
          handleViewExperiences(candidate);
        },
      };
      return row;
    })
    .filter((c: any) =>
      [
        c.fullName,
        c.personalId,
        c.firstName,
        c.secondName,
        c.firstSurname,
        c.secondSurname,
        new Date(c.entryDate).toLocaleDateString(),
      ]
        .join(' ')
        .toLowerCase()
        .includes(filter.toLowerCase())
    );
    // Intentar dividir el nombre completo en partes (muy básico)
    const nameParts = candidate.name ? candidate.name.split(' ') : [];
    return {
      id: candidate.id,
      personalId: '', // No existe en el modelo antiguo
      firstName: nameParts[0] || '',
      secondName: nameParts.length > 2 ? nameParts[1] : '',
      firstSurname: nameParts.length > 1 ? nameParts[nameParts.length - 2] : '',
      secondSurname: nameParts.length > 2 ? nameParts[nameParts.length - 1] : '',
      resumeUrl: candidate.resumeUrl || '',
      emails: [{ email: candidate.email, isPrimary: true }],
      phones: candidate.phone ? [{ phone: candidate.phone, typeId: 1, isPrimary: true }] : [],
      addresses: [],
      educations: [],
      experiences: [],
    };
  }

  // Eliminar duplicidad y dejar solo la versión extendida con todas las funciones
  // Definir filteredRows justo antes del return, asegurando que todas las funciones estén presentes
  const filteredRows = candidates
    .map((candidate: Candidate) => {
      const row = {
        ...candidate,
        onEdit: () => handleEdit(candidate),
        onDelete: () => handleDelete(candidate),
        onViewEmails: () => {
          setSelectedCandidate(mapToFormCandidate(candidate));
          handleViewEmails(candidate);
        },
        onViewPhones: () => {
          setSelectedCandidate(mapToFormCandidate(candidate));
          handleViewPhones(candidate);
        },
        onViewAddresses: () => {
          setSelectedCandidate(mapToFormCandidate(candidate));
          handleViewAddresses(candidate);
        },
        onViewEducations: () => {
          setSelectedCandidate(mapToFormCandidate(candidate));
          handleViewEducations(candidate);
        },
        onViewExperiences: () => {
          setSelectedCandidate(mapToFormCandidate(candidate));
          handleViewExperiences(candidate);
        },
      };
      return row;
    })
    .filter((c: any) =>
      [
        c.fullName,
        c.personalId,
        c.firstName,
        c.secondName,
        c.firstSurname,
        c.secondSurname,
        new Date(c.entryDate).toLocaleDateString(),
      ]
        .join(' ')
        .toLowerCase()
        .includes(filter.toLowerCase())
    );

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, color: '#008080' }}>
          ATS by Pavel Mollinedo
        </Typography>
      </Box>
      <Typography variant="h4" gutterBottom>
        Candidatos
      </Typography>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<PersonAddAlt1Icon />}
          onClick={() => {
            setSelectedCandidate(null);
            setOpenForm(true);
          }}
          sx={{
            backgroundColor: '#008080',
            color: '#fff',
            '&:hover': { backgroundColor: '#006666' },
            fontWeight: 600,
            borderRadius: 2,
            px: 3,
          }}
        >
          Nuevo candidato
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          label="Buscar candidato"
          variant="outlined"
          fullWidth
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Buscar por nombre, email, teléfono..."
        />
      </Paper>

      <Box sx={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={filteredRows}
          columns={columns}
          pageSizeOptions={[10, 20, 50, 100]}
          getRowId={(row) => row.id}
          disableRowSelectionOnClick
          autoHeight
          loading={loading}
          sx={{
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: '#f5f5f5',
            },
          }}
        />
      </Box>

      <CandidateForm
        open={openForm}
        onClose={handleCloseForm}
        onSuccess={handleFormSuccess}
        candidate={selectedCandidate}
      />
      {/* Modal de emails dinámicos */}
      {openEmailGrid && (
        <React.Suspense fallback={null}>
          {/* @ts-ignore */}
          <EmailGrid
            open={openEmailGrid}
            emails={emailGridData}
            onClose={() => setOpenEmailGrid(false)}
            onSave={handleSaveEmails}
            error={emailError}
          />
        </React.Suspense>
      )}
      {/* Modal de teléfonos dinámicos */}
      {openPhoneGrid && (
        <React.Suspense fallback={null}>
          {/* @ts-ignore */}
          <PhoneGrid
            open={openPhoneGrid}
            phones={phoneGridData}
            onClose={() => setOpenPhoneGrid(false)}
            onSave={handleSavePhones}
            error={phoneError}
          />
        </React.Suspense>
      )}
      {/* Modal de direcciones dinámicas */}
      {openAddressGrid && (
        <React.Suspense fallback={null}>
          {/* @ts-ignore */}
          <AddressGrid
            open={openAddressGrid}
            addresses={addressGridData}
            onClose={() => setOpenAddressGrid(false)}
            onSave={handleSaveAddresses}
          />
        </React.Suspense>
      )}
      {/* Modal de educación */}
      {openEducationGrid && (
        <React.Suspense fallback={null}>
          {/* @ts-ignore */}
          <EducationGrid
            open={openEducationGrid}
            educations={educationGridData}
            onClose={() => setOpenEducationGrid(false)}
            onSave={handleSaveEducations}
          />
        </React.Suspense>
      )}
      {/* Modal de experiencia */}
      {openExperienceGrid && (
        <React.Suspense fallback={null}>
          {/* @ts-ignore */}
          <ExperienceGrid
            open={openExperienceGrid}
            experiences={experienceGridData}
            onClose={() => setOpenExperienceGrid(false)}
            onSave={handleSaveExperiences}
          />
        </React.Suspense>
      )}
    </Container>
  );
}

export default App;