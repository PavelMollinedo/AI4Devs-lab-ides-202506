import React, { useState, useEffect } from 'react';
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
import type { CandidateExperience } from '../types/candidate';

interface ExperienceGridProps {
  open: boolean;
  experiences: CandidateExperience[];
  onClose: () => void;
  onSave?: (experiences: CandidateExperience[]) => void;
  error?: string;
}


const defaultExp: CandidateExperience = {
  company: '',
  position: '',
  startDate: '',
  endDate: '',
  typeId: 1,
  description: '',
};


export default function ExperienceGrid({ open, experiences, onClose, onSave, error }: ExperienceGridProps) {

  const [localExperiences, setLocalExperiences] = useState<CandidateExperience[]>(experiences);
  useEffect(() => { setLocalExperiences(experiences); }, [experiences]);

  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editExp, setEditExp] = useState<CandidateExperience>(defaultExp);
  const [localError, setLocalError] = useState<string>('');
  const [addMode, setAddMode] = useState(false);

  // Opciones de tipo de experiencia
  const [experienceTypes, setExperienceTypes] = useState<{ id: number; name: string }[]>([]);
  useEffect(() => {
    if (open) {
      fetch('/api/candidates/experience-types')
        .then(res => res.json())
        .then(data => {
          console.log('Catalogo de tipos de experiencia:', data); // <-- Validación en consola
          setExperienceTypes(data);
          // Sincronizar typeId con catálogo al abrir/agregar/editar
          if (addMode && data.length > 0) {
            setEditExp(prev => ({ ...prev, typeId: data[0].id }));
          } else if (editIdx !== null && data.length > 0) {
            setEditExp(prev => {
              const validTypeId = data.some((t: {id: number; name: string}) => t.id === prev.typeId) ? prev.typeId : data[0].id;
              return { ...prev, typeId: validTypeId };
            });
          }
        })
        .catch(() => setExperienceTypes([]));
    }
  }, [open, addMode, editIdx]);

  // Sincronizar typeId cuando cambian los tipos en ExperienceGrid
  useEffect(() => {
    if ((addMode || editIdx !== null) && experienceTypes.length > 0) {
      setEditExp(prev => {
        const validTypeId = experienceTypes.some(t => t.id === prev.typeId) ? prev.typeId : experienceTypes[0].id;
        return { ...prev, typeId: validTypeId };
      });
    }
  }, [experienceTypes, addMode, editIdx]);

  // Cuando se presiona "Agregar", inicializar typeId con el primero del catálogo
  const handleAdd = () => {
    setAddMode(true);
    setLocalError('');
    setEditExp(experienceTypes.length > 0 ? { ...defaultExp, typeId: experienceTypes[0].id } : defaultExp);
  };

  // Cuando se edita, si el registro no tiene typeId válido, asignar el primero
  const handleEdit = (idx: number) => {
    setEditIdx(idx);
    const exp = localExperiences[idx];
    // Normalizar fechas para el input type="date" (YYYY-MM-DD)
    const normalizeDate = (dateStr: string | undefined) => {
      if (!dateStr) return '';
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
      if (dateStr.length >= 10) return dateStr.slice(0, 10);
      return '';
    };
    setEditExp({
      company: exp.company || '',
      position: exp.position || '',
      startDate: normalizeDate(exp.startDate),
      endDate: normalizeDate(exp.endDate),
      typeId: experienceTypes.some(t => t.id === exp.typeId) ? exp.typeId : (experienceTypes[0]?.id ?? 1),
      id: exp.id,
      type: exp.type,
      description: exp.description || '',
    });
    setLocalError('');
    setAddMode(false);
  };

  // ...
  const handleEditSave = () => {
    if (!editExp.company.trim() || !editExp.position.trim() || !editExp.startDate || !editExp.typeId) {
      setLocalError('Todos los campos obligatorios deben estar completos');
      return;
    }
    // Asignar el objeto type según el typeId seleccionado
    const typeObj = experienceTypes.find(t => t.id === editExp.typeId);
    const updatedExp = { ...editExp, type: typeObj };
    setLocalExperiences(prev => prev.map((e, i) => i === editIdx ? updatedExp : e));
    setEditIdx(null);
    setEditExp(defaultExp);
    setLocalError('');
    if (onSave) onSave(localExperiences.map((e, i) => i === editIdx ? updatedExp : e));
  };

  const handleDelete = (idx: number) => {
    setLocalExperiences(prev => prev.filter((_, i) => i !== idx));
    setEditIdx(null);
    setEditExp(defaultExp);
    setLocalError('');
    if (onSave) onSave(localExperiences.filter((_, i) => i !== idx));
  };

  // ...
  const handleAddSave = () => {
    if (!editExp.company.trim() || !editExp.position.trim() || !editExp.startDate || !editExp.typeId) {
      setLocalError('Todos los campos obligatorios deben estar completos');
      return;
    }
    const typeObj = experienceTypes.find(t => t.id === editExp.typeId);
    const newExp = { ...editExp, type: typeObj };
    setLocalExperiences(prev => [...prev, newExp]);
    setAddMode(false);
    setEditExp(defaultExp);
    setLocalError('');
    if (onSave) onSave([...localExperiences, newExp]);
  };

  const handleCancel = () => {
    setEditIdx(null);
    setAddMode(false);
    setEditExp(defaultExp);
    setLocalError('');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Experiencia del candidato</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error">{error}</Alert>}
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button startIcon={<AddIcon />} variant="contained" color="primary" size="small" onClick={handleAdd}>Agregar experiencia</Button>
        </Box>
        {localExperiences.length === 0 ? (
          <Typography>No hay registros de experiencia.</Typography>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ borderBottom: '1px solid #ccc', padding: 8 }}>Empresa</th>
                <th style={{ borderBottom: '1px solid #ccc', padding: 8 }}>Puesto</th>
                <th style={{ borderBottom: '1px solid #ccc', padding: 8 }}>Fecha inicio</th>
                <th style={{ borderBottom: '1px solid #ccc', padding: 8 }}>Fecha fin</th>
                <th style={{ borderBottom: '1px solid #ccc', padding: 8 }}>Tipo</th>
                <th style={{ borderBottom: '1px solid #ccc', padding: 8 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {localExperiences.map((exp, idx) => (
                <tr key={exp.id ?? idx}>
                  <td style={{ padding: 8 }}>{exp.company}</td>
                  <td style={{ padding: 8 }}>{exp.position}</td>
                  <td style={{ padding: 8 }}>{exp.startDate ? exp.startDate.slice(0, 10) : ''}</td>
                  <td style={{ padding: 8 }}>{exp.endDate ? exp.endDate.slice(0, 10) : ''}</td>
                  <td style={{ padding: 8 }}>{exp.type?.name}</td>
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
            <Typography variant="subtitle1" sx={{ mb: 1 }}>{addMode ? 'Agregar experiencia' : 'Editar experiencia'}</Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField label="Empresa" value={editExp.company} onChange={e => setEditExp({ ...editExp, company: e.target.value })} size="small" sx={{ minWidth: 140 }} />
              <TextField label="Puesto" value={editExp.position} onChange={e => setEditExp({ ...editExp, position: e.target.value })} size="small" sx={{ minWidth: 140 }} />
              <TextField label="Fecha inicio" type="date" value={editExp.startDate} onChange={e => setEditExp({ ...editExp, startDate: e.target.value })} size="small" sx={{ minWidth: 140 }} InputLabelProps={{ shrink: true }} />
              <TextField label="Fecha fin" type="date" value={editExp.endDate ?? ''} onChange={e => setEditExp({ ...editExp, endDate: e.target.value })} size="small" sx={{ minWidth: 140 }} InputLabelProps={{ shrink: true }} />
              <TextField
                label="Tipo"
                select
                value={editExp.typeId}
                onChange={e => setEditExp({ ...editExp, typeId: Number(e.target.value) })}
                size="small"
                sx={{ minWidth: 120 }}
              >
                {experienceTypes.map(type => (
                  <MenuItem key={type.id} value={type.id}>{type.name}</MenuItem>
                ))}
              </TextField>
              <TextField label="Descripción" value={editExp.description ?? ''} onChange={e => setEditExp({ ...editExp, description: e.target.value })} size="small" sx={{ minWidth: 180 }} />
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
