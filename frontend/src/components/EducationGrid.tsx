import React, { useState } from 'react';
import { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  IconButton,
  Tooltip,
  Alert,
} from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';
import type { CandidateEducation } from '../types/candidate';

interface EducationGridProps {
  open: boolean;
  educations: CandidateEducation[];
  onClose: () => void;
  onSave?: (educations: CandidateEducation[]) => void;
  error?: string;
}


const defaultEdu: CandidateEducation = {
  institution: '',
  degree: '',
  startDate: '',
  endDate: '',
  typeId: 1,
};


export default function EducationGrid({ open, educations, onClose, onSave, error }: EducationGridProps) {

  const [localEducations, setLocalEducations] = useState<CandidateEducation[]>(educations);
  useEffect(() => { setLocalEducations(educations); }, [educations]);

  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editEdu, setEditEdu] = useState<CandidateEducation>(defaultEdu);
  const [localError, setLocalError] = useState<string>('');
  const [addMode, setAddMode] = useState(false);

  // Opciones de tipo de educación
  const [educationTypes, setEducationTypes] = useState<{ id: number; name: string }[]>([]);
  useEffect(() => {
    if (open) {
      fetch('/api/candidates/education-types')
        .then(res => res.json())
        .then(data => {
          console.log('Catalogo de tipos de educación:', data); // <-- Validación en consola
          setEducationTypes(data);
          // Sincronizar typeId con catálogo al abrir/agregar/editar
          if (addMode && data.length > 0) {
            setEditEdu(prev => ({ ...prev, typeId: data[0].id }));
          } else if (editIdx !== null && data.length > 0) {
            setEditEdu(prev => {
              const validTypeId = data.some((t: {id: number; name: string}) => t.id === prev.typeId) ? prev.typeId : data[0].id;
              return { ...prev, typeId: validTypeId };
            });
          }
        })
        .catch(() => setEducationTypes([]));
    }
  }, [open, addMode, editIdx]);

  // Sincronizar typeId cuando cambian los tipos
  useEffect(() => {
    if ((addMode || editIdx !== null) && educationTypes.length > 0) {
      setEditEdu(prev => {
        const validTypeId = educationTypes.some(t => t.id === prev.typeId) ? prev.typeId : educationTypes[0].id;
        return { ...prev, typeId: validTypeId };
      });
    }
  }, [educationTypes, addMode, editIdx]);

  // Cuando se presiona "Agregar", inicializar typeId con el primero del catálogo
  const handleAdd = () => {
    setAddMode(true);
    setLocalError('');
    setEditEdu(educationTypes.length > 0 ? { ...defaultEdu, typeId: educationTypes[0].id } : defaultEdu);
  };

  const handleEdit = (idx: number) => {
    setEditIdx(idx);
    const edu = localEducations[idx];
    // Normalizar fechas para el input type="date" (YYYY-MM-DD)
    const normalizeDate = (dateStr: string | undefined) => {
      if (!dateStr) return '';
      // Si ya está en formato YYYY-MM-DD, regresa igual
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
      // Si es ISO, recorta
      if (dateStr.length >= 10) return dateStr.slice(0, 10);
      return '';
    };
    setEditEdu({
      institution: edu.institution || '',
      degree: edu.degree || '',
      startDate: normalizeDate(edu.startDate),
      endDate: normalizeDate(edu.endDate),
      typeId: educationTypes.some(t => t.id === edu.typeId) ? edu.typeId : (educationTypes[0]?.id ?? 1),
      id: edu.id,
      type: edu.type,
    });
    setLocalError('');
    setAddMode(false);
  };

  const handleEditSave = () => {
    if (!editEdu.institution.trim() || !editEdu.degree.trim() || !editEdu.startDate || !editEdu.typeId) {
      setLocalError('Todos los campos obligatorios deben estar completos');
      return;
    }
    const typeObj = educationTypes.find(t => t.id === editEdu.typeId);
    const updatedEdu = { ...editEdu, type: typeObj };
    const updatedList = localEducations.map((e, i) => i === editIdx ? updatedEdu : e);
    setLocalEducations(updatedList);
    setEditIdx(null);
    setEditEdu(defaultEdu);
    setLocalError('');
    if (onSave) onSave(updatedList);
  };

  const handleDelete = (idx: number) => {
    const updated = localEducations.filter((_, i) => i !== idx);
    setLocalEducations(updated);
    setEditIdx(null);
    setEditEdu(defaultEdu);
    setLocalError('');
    if (onSave) onSave(updated);
  };

  // ...
  // ...
  const handleAddSave = () => {
    if (!editEdu.institution.trim() || !editEdu.degree.trim() || !editEdu.startDate || !editEdu.typeId) {
      setLocalError('Todos los campos obligatorios deben estar completos');
      return;
    }
    const typeObj = educationTypes.find(t => t.id === editEdu.typeId);
    const newEdu = { ...editEdu, type: typeObj };
    setLocalEducations(prev => [...prev, newEdu]);
    setAddMode(false);
    setEditEdu(defaultEdu);
    setLocalError('');
    if (onSave) onSave([...localEducations, newEdu]);
  };

  const handleCancel = () => {
    setEditIdx(null);
    setAddMode(false);
    setEditEdu(defaultEdu);
    setLocalError('');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Educación del candidato</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error">{error}</Alert>}
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button startIcon={<AddIcon />} variant="contained" color="primary" size="small" onClick={handleAdd}>Agregar educación</Button>
        </Box>
        {localEducations.length === 0 ? (
          <Typography>No hay registros de educación.</Typography>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ borderBottom: '1px solid #ccc', padding: 8 }}>Institución</th>
                <th style={{ borderBottom: '1px solid #ccc', padding: 8 }}>Título</th>
                <th style={{ borderBottom: '1px solid #ccc', padding: 8 }}>Fecha inicio</th>
                <th style={{ borderBottom: '1px solid #ccc', padding: 8 }}>Fecha fin</th>
                <th style={{ borderBottom: '1px solid #ccc', padding: 8 }}>Tipo</th>
                <th style={{ borderBottom: '1px solid #ccc', padding: 8 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {localEducations.map((edu, idx) => (
                <tr key={edu.id ?? idx}>
                  <td style={{ padding: 8 }}>{edu.institution}</td>
                  <td style={{ padding: 8 }}>{edu.degree}</td>
                  <td style={{ padding: 8 }}>{edu.startDate ? edu.startDate.slice(0, 10) : ''}</td>
                  <td style={{ padding: 8 }}>{edu.endDate ? edu.endDate.slice(0, 10) : ''}</td>
                  <td style={{ padding: 8 }}>{edu.type?.name}</td>
                  <td style={{ padding: 8 }}>
                    <Tooltip title="Editar">
                      <IconButton size="small" onClick={() => handleEdit(idx)}><EditIcon fontSize="small" /></IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton size="small" onClick={() => handleDelete(idx)}><DeleteIcon fontSize="small" /></IconButton>
                    </Tooltip>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {(editIdx !== null || addMode) && (
          <Box sx={{ mt: 2, p: 2, border: '1px solid #eee', borderRadius: 2, background: '#fafafa' }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>{addMode ? 'Agregar educación' : 'Editar educación'}</Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField label="Institución" value={editEdu.institution} onChange={e => setEditEdu({ ...editEdu, institution: e.target.value })} size="small" sx={{ minWidth: 140 }} />
              <TextField label="Título" value={editEdu.degree} onChange={e => setEditEdu({ ...editEdu, degree: e.target.value })} size="small" sx={{ minWidth: 140 }} />
              <TextField label="Fecha inicio" type="date" value={editEdu.startDate} onChange={e => setEditEdu({ ...editEdu, startDate: e.target.value })} size="small" sx={{ minWidth: 140 }} InputLabelProps={{ shrink: true }} />
              <TextField label="Fecha fin" type="date" value={editEdu.endDate ?? ''} onChange={e => setEditEdu({ ...editEdu, endDate: e.target.value })} size="small" sx={{ minWidth: 140 }} InputLabelProps={{ shrink: true }} />
              <TextField
                label="Tipo"
                select
                value={editEdu.typeId}
                onChange={e => setEditEdu({ ...editEdu, typeId: Number(e.target.value) })}
                size="small"
                sx={{ minWidth: 120 }}
              >
                {educationTypes.map(type => (
                  <MenuItem key={type.id} value={type.id}>{type.name}</MenuItem>
                ))}
              </TextField>
            </Box>
            {localError && <Alert severity="error" sx={{ mt: 1 }}>{localError}</Alert>}
            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
              <Button variant="contained" color="primary" size="small" onClick={addMode ? handleAddSave : handleEditSave}>{addMode ? 'Agregar' : 'Guardar'}</Button>
              <Button variant="outlined" color="secondary" size="small" onClick={handleCancel}>Cancelar</Button>
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" variant="contained">Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}
