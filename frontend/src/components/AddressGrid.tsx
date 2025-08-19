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
import type { CandidateAddress } from '../types/candidate';

interface AddressGridProps {
  open: boolean;
  addresses: CandidateAddress[];
  onClose: () => void;
  onSave: (addresses: CandidateAddress[]) => void;
  addressTypes?: { id: number; name: string }[];
}

export default function AddressGrid({ open, addresses, onClose, onSave, addressTypes = [] }: AddressGridProps) {
  const [localAddresses, setLocalAddresses] = useState<CandidateAddress[]>(addresses);

  React.useEffect(() => {
    setLocalAddresses(addresses);
  }, [addresses]);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [editTypeId, setEditTypeId] = useState<number>(addressTypes[0]?.id || 1);
  const [error, setError] = useState<string>('');

  const handleEdit = (idx: number) => {
    setEditIdx(idx);
    setEditValue(localAddresses[idx].address);
    setEditTypeId(localAddresses[idx].typeId);
    setError('');
  };

  const handleEditSave = () => {
    if (!editValue.trim() || editValue.length < 5) {
      setError('Dirección no válida');
      return;
    }
    setLocalAddresses(prev => prev.map((e, i) => i === editIdx ? { ...e, address: editValue, typeId: editTypeId } : e));
    setEditIdx(null);
    setEditValue('');
    setError('');
  };

  const handleDelete = (idx: number) => {
    setLocalAddresses(prev => prev.filter((_, i) => i !== idx));
    setEditIdx(null);
    setEditValue('');
    setError('');
  };

  const handleAdd = () => {
    setLocalAddresses(prev => [...prev, { address: '', typeId: addressTypes[0]?.id || 1, isPrimary: false }]);
    setEditIdx(localAddresses.length);
    setEditValue('');
    setEditTypeId(addressTypes[0]?.id || 1);
    setError('');
  };

  // Solo una dirección puede estar marcada como principal
  const handleSetPrimary = (idx: number) => {
    setLocalAddresses(prev => prev.map((e, i) => ({ ...e, isPrimary: i === idx })));
  };

  const handleClose = () => {
    setEditIdx(null);
    setEditValue('');
    setError('');
    onClose();
  };

  const handleSaveAll = () => {
    onSave(localAddresses);
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Direcciones del candidato</Typography>
        <IconButton onClick={handleClose}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box sx={{ mt: 2 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                <th style={{ padding: '8px', border: '1px solid #e0e0e0' }}>Dirección</th>
                <th style={{ padding: '8px', border: '1px solid #e0e0e0' }}>Tipo</th>
                <th style={{ padding: '8px', border: '1px solid #e0e0e0' }}>Principal</th>
                <th style={{ padding: '8px', border: '1px solid #e0e0e0' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {localAddresses.map((address, idx) => (
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
                      <span>{address.address}</span>
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
                        {addressTypes.map(type => (
                          <MenuItem key={type.id} value={type.id}>{type.name}</MenuItem>
                        ))}
                      </TextField>
                    ) : (
                      <span>{addressTypes.find(t => t.id === address.typeId)?.name || address.typeId}</span>
                    )}
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #e0e0e0', textAlign: 'center' }}>
                    <Button
                      variant={address.isPrimary ? 'contained' : 'outlined'}
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
            Agregar dirección
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
