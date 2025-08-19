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
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';
import type { CandidateEmail } from '../types/candidate';

interface EmailGridProps {
  open: boolean;
  emails: CandidateEmail[];
  onClose: () => void;
  onSave: (emails: CandidateEmail[]) => void;
  error?: string;
}

export default function EmailGrid({ open, emails, onClose, onSave, error }: EmailGridProps) {
  const [localEmails, setLocalEmails] = useState<CandidateEmail[]>(emails);

  // Sincronizar emails cuando cambian desde el padre (por ejemplo, al abrir otro candidato)
  React.useEffect(() => {
    setLocalEmails(emails);
  }, [emails]);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [localError, setLocalError] = useState<string>('');

  const handleEdit = (idx: number) => {
    setEditIdx(idx);
    setEditValue(localEmails[idx].email);
    setLocalError('');
  };

  const handleEditSave = () => {
    if (!editValue.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editValue)) {
      setLocalError('Email no válido');
      return;
    }
    setLocalEmails(prev => prev.map((e, i) => i === editIdx ? { ...e, email: editValue } : e));
    setEditIdx(null);
    setEditValue('');
    setLocalError('');
  };

  const handleDelete = (idx: number) => {
    setLocalEmails(prev => prev.filter((_, i) => i !== idx));
    setEditIdx(null);
    setEditValue('');
    setLocalError('');
  };

  const handleAdd = () => {
    setLocalEmails(prev => [...prev, { email: '', isPrimary: false }]);
    setEditIdx(localEmails.length);
    setEditValue('');
    setLocalError('');
  };

  // Solo uno puede estar marcado como principal
  const handleSetPrimary = (idx: number) => {
    setLocalEmails(prev => prev.map((e, i) => ({ ...e, isPrimary: i === idx })));
  };

  const handleClose = () => {
    setEditIdx(null);
    setEditValue('');
    setLocalError('');
    onClose();
  };

  const handleSaveAll = () => {
    onSave(localEmails);
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Emails del candidato</Typography>
        <IconButton onClick={handleClose}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent>
        {(localError || error) && <Alert severity="error" sx={{ mb: 2 }}>{localError || error}</Alert>}
        <Box sx={{ mt: 2 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                <th style={{ padding: '8px', border: '1px solid #e0e0e0' }}>Email</th>
                <th style={{ padding: '8px', border: '1px solid #e0e0e0' }}>Principal</th>
                <th style={{ padding: '8px', border: '1px solid #e0e0e0' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {localEmails.map((email, idx) => (
                <tr key={idx}>
                  <td style={{ padding: '8px', border: '1px solid #e0e0e0' }}>
                    {editIdx === idx ? (
                      <TextField
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        error={!!error}
                        helperText={error}
                        fullWidth
                        autoFocus
                      />
                    ) : (
                      <span>{email.email}</span>
                    )}
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #e0e0e0', textAlign: 'center' }}>
                    <Button
                      variant={email.isPrimary ? 'contained' : 'outlined'}
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
            Agregar email
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
