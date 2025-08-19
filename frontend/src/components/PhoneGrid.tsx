import React, { useState } from 'react';
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
  MenuItem,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';
import type { CandidatePhone } from '../types/candidate';

interface PhoneGridProps {
  open: boolean;
  phones: CandidatePhone[];
  onClose: () => void;
  onSave: (phones: CandidatePhone[]) => void;
  phoneTypes?: { id: number; name: string }[];
  error?: string;
}

export default function PhoneGrid({ open, phones, onClose, onSave, phoneTypes = [], error }: PhoneGridProps) {
  const [localPhones, setLocalPhones] = useState<CandidatePhone[]>(phones);

  React.useEffect(() => {
    setLocalPhones(phones);
  }, [phones]);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [editTypeId, setEditTypeId] = useState<number>(phoneTypes[0]?.id || 1);
  const [localError, setLocalError] = useState<string>('');

  // Regex igual al backend
  const phoneRegex = /^\+?[0-9\-\s]{10,15}$/;

  const validatePhone = (value: string) => {
    if (!value.trim()) return 'El teléfono es requerido';
    if (!phoneRegex.test(value)) {
      return 'El número de teléfono debe ser válido (10-15 dígitos, puede incluir +, espacios o guiones)';
    }
    return '';
  };

  const handleEdit = (idx: number) => {
    setEditIdx(idx);
    setEditValue(localPhones[idx].phone);
    setEditTypeId(localPhones[idx].typeId);
    setLocalError('');
  };

  const handleEditSave = () => {
    const err = validatePhone(editValue);
    if (err) {
      setLocalError(err);
      return;
    }
    setLocalPhones(prev => prev.map((e, i) => i === editIdx ? { ...e, phone: editValue, typeId: editTypeId } : e));
    setEditIdx(null);
    setEditValue('');
    setLocalError('');
  };

  const handleDelete = (idx: number) => {
    setLocalPhones(prev => prev.filter((_, i) => i !== idx));
    setEditIdx(null);
    setEditValue('');
    setLocalError('');
  };

  const handleAdd = () => {
    setLocalPhones(prev => [...prev, { phone: '', typeId: phoneTypes[0]?.id || 1, isPrimary: false }]);
    setEditIdx(localPhones.length);
    setEditValue('');
    setEditTypeId(phoneTypes[0]?.id || 1);
    setLocalError('');
  };

  // Solo uno puede estar marcado como principal
  const handleSetPrimary = (idx: number) => {
    setLocalPhones(prev => prev.map((e, i) => ({ ...e, isPrimary: i === idx })));
  };

  const handleClose = () => {
    setEditIdx(null);
    setEditValue('');
    setLocalError('');
    onClose();
  };

  const handleSaveAll = () => {
    onSave(localPhones);
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Teléfonos del candidato</Typography>
        <IconButton onClick={handleClose}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent>
        {(localError || error) && <Alert severity="error" sx={{ mb: 2 }}>{localError || error}</Alert>}
        <Box sx={{ mt: 2 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                <th style={{ padding: '8px', border: '1px solid #e0e0e0' }}>Teléfono</th>
                <th style={{ padding: '8px', border: '1px solid #e0e0e0' }}>Tipo</th>
                <th style={{ padding: '8px', border: '1px solid #e0e0e0' }}>Principal</th>
                <th style={{ padding: '8px', border: '1px solid #e0e0e0' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {localPhones.map((phone, idx) => (
                <tr key={idx}>
                  <td style={{ padding: '8px', border: '1px solid #e0e0e0' }}>
                    {editIdx === idx ? (
                      <TextField
                        value={editValue}
                        onChange={e => {
                          setEditValue(e.target.value);
                          setLocalError(validatePhone(e.target.value));
                        }}
                        error={!!localError}
                        helperText={localError}
                        fullWidth
                        autoFocus
                      />
                    ) : (
                      <span>{phone.phone}</span>
                    )}
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #e0e0e0' }}>
                    {editIdx === idx ? (
                      <TextField
                        select
                        value={editTypeId}
                        onChange={e => setEditTypeId(Number(e.target.value))}
                        fullWidth
                      >
                        {phoneTypes.map(type => (
                          <MenuItem key={type.id} value={type.id}>{type.name}</MenuItem>
                        ))}
                      </TextField>
                    ) : (
                      <span>{phoneTypes.find(t => t.id === phone.typeId)?.name || phone.typeId}</span>
                    )}
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #e0e0e0', textAlign: 'center' }}>
                    <Button
                      variant={phone.isPrimary ? 'contained' : 'outlined'}
                      color="primary"
                      onClick={() => handleSetPrimary(idx)}
                      sx={{ minWidth: 36, p: 1 }}
                      title="Marcar como principal"
                    >
                      ★
                    </Button>
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #e0e0e0', textAlign: 'center' }}>
                    {editIdx === idx ? (
                      <Button variant="contained" color="success" onClick={handleEditSave} sx={{ minWidth: 36, p: 1 }}>✔</Button>
                    ) : (
                      <Tooltip title="Editar">
                        <IconButton onClick={() => handleEdit(idx)}><EditIcon /></IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Eliminar">
                      <IconButton color="error" onClick={() => handleDelete(idx)}><DeleteIcon /></IconButton>
                    </Tooltip>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Button startIcon={<AddIcon />} onClick={handleAdd} variant="text" sx={{ width: 'fit-content', mt: 2 }}>
            Agregar teléfono
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant="outlined">Cancelar</Button>
        <Button onClick={handleSaveAll} variant="contained" color="primary">Guardar cambios</Button>
      </DialogActions>
    </Dialog>
  );
}
