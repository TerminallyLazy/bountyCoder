import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Button, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Alert,
  Box,
  CircularProgress
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { apiKeysApi } from '../services/api';

interface ApiKey {
  id: string;
  key: string;
  name: string;
  rateLimit: number;
  isActive: boolean;
  lastUsed: string | null;
  createdAt: string;
}

const ApiKeys: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    rateLimit: 60,
    isActive: true
  });

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      const response = await apiKeysApi.getAll();
      setApiKeys(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch API keys');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDialogOpen = () => {
    setFormData({
      name: '',
      rateLimit: 60,
      isActive: true
    });
    setOpenCreateDialog(true);
  };

  const handleEditDialogOpen = (apiKey: ApiKey) => {
    setSelectedKey(apiKey);
    setFormData({
      name: apiKey.name,
      rateLimit: apiKey.rateLimit,
      isActive: apiKey.isActive
    });
    setOpenEditDialog(true);
  };

  const handleDialogClose = () => {
    setOpenCreateDialog(false);
    setOpenEditDialog(false);
    setSelectedKey(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'isActive' ? checked : value
    });
  };

  const handleCreateApiKey = async () => {
    try {
      await apiKeysApi.create(formData.name, formData.rateLimit);
      handleDialogClose();
      fetchApiKeys();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create API key');
    }
  };

  const handleUpdateApiKey = async () => {
    if (!selectedKey) return;
    
    try {
      await apiKeysApi.update(selectedKey.id, {
        name: formData.name,
        rateLimit: formData.rateLimit,
        isActive: formData.isActive
      });
      handleDialogClose();
      fetchApiKeys();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update API key');
    }
  };

  const handleDeleteApiKey = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this API key?')) return;
    
    try {
      await apiKeysApi.delete(id);
      fetchApiKeys();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete API key');
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        pb: 2,
        borderBottom: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`
      }}>
        <Typography variant="h4" fontWeight="bold" sx={{ 
          color: (theme) => theme.palette.mode === 'dark' ? 'white' : theme.palette.primary.main,
        }}>
          API Keys
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleCreateDialogOpen}
          className="action-button"
          sx={{
            fontWeight: 600,
            px: 3,
            py: 1,
            borderRadius: '8px',
            transition: 'all 0.3s ease',
            boxShadow: (theme) => theme.palette.mode === 'dark'
              ? '0 4px 10px rgba(124, 58, 237, 0.3)'
              : '0 4px 10px rgba(59, 130, 246, 0.3)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: (theme) => theme.palette.mode === 'dark'
                ? '0 6px 15px rgba(124, 58, 237, 0.4), 0 0 10px rgba(139, 92, 246, 0.3)'
                : '0 6px 15px rgba(59, 130, 246, 0.4)'
            }
          }}
        >
          Create API Key
        </Button>
      </Box>
      
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 4, 
            borderRadius: 2,
            boxShadow: '0 4px 10px rgba(239, 68, 68, 0.1)'
          }}
        >
          {error}
        </Alert>
      )}
      
      <Paper 
        elevation={3} 
        sx={{ 
          borderRadius: 3,
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          background: (theme) => theme.palette.mode === 'dark' 
            ? 'linear-gradient(145deg, #1e293b, #1a2234)'
            : 'white',
          border: (theme) => theme.palette.mode === 'dark' 
            ? '1px solid rgba(255, 255, 255, 0.03)'
            : 'none',
          '&:hover': {
            boxShadow: (theme) => theme.palette.mode === 'dark'
              ? '0 8px 25px rgba(0, 0, 0, 0.3), 0 0 10px rgba(139, 92, 246, 0.2)'
              : '0 8px 25px rgba(0, 0, 0, 0.08)'
          }
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ 
                background: (theme) => theme.palette.mode === 'dark' 
                  ? 'rgba(15, 23, 42, 0.6)'
                  : 'rgba(243, 244, 246, 0.8)'
              }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>API Key</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Rate Limit</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Created</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Last Used</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <CircularProgress size={32} />
                    </Box>
                  </TableCell>
                </TableRow>
              ) : apiKeys.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No API keys found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                apiKeys.map((apiKey) => (
                  <TableRow 
                    key={apiKey.id}
                    sx={{ 
                      transition: 'all 0.2s ease',
                      '&:hover': { 
                        background: (theme) => theme.palette.mode === 'dark' 
                          ? 'rgba(255, 255, 255, 0.02)'
                          : 'rgba(0, 0, 0, 0.01)'
                      }
                    }}
                  >
                    <TableCell>{apiKey.name}</TableCell>
                    <TableCell>
                      <Box 
                        component="code" 
                        sx={{ 
                          px: 1, 
                          py: 0.5, 
                          borderRadius: 1, 
                          bgcolor: (theme) => theme.palette.mode === 'dark' 
                            ? 'rgba(15, 23, 42, 0.5)'
                            : 'rgba(243, 244, 246, 0.8)',
                          fontFamily: 'monospace',
                          fontSize: '0.875rem'
                        }}
                      >
                        {apiKey.key.substring(0, 10)}...{apiKey.key.substring(apiKey.key.length - 5)}
                      </Box>
                    </TableCell>
                    <TableCell>{apiKey.rateLimit} req/min</TableCell>
                    <TableCell>
                      <Box 
                        component="span" 
                        sx={{ 
                          px: 1.5, 
                          py: 0.5, 
                          borderRadius: 10, 
                          fontSize: '0.75rem',
                          fontWeight: 'medium',
                          bgcolor: apiKey.isActive 
                            ? (theme) => theme.palette.mode === 'dark' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(16, 185, 129, 0.1)' 
                            : (theme) => theme.palette.mode === 'dark' ? 'rgba(248, 113, 113, 0.2)' : 'rgba(239, 68, 68, 0.1)',
                          color: apiKey.isActive 
                            ? (theme) => theme.palette.mode === 'dark' ? 'rgb(74, 222, 128)' : 'rgb(16, 185, 129)'
                            : (theme) => theme.palette.mode === 'dark' ? 'rgb(248, 113, 113)' : 'rgb(239, 68, 68)'
                        }}
                      >
                        {apiKey.isActive ? 'Active' : 'Inactive'}
                      </Box>
                    </TableCell>
                    <TableCell>{new Date(apiKey.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{apiKey.lastUsed ? new Date(apiKey.lastUsed).toLocaleString() : 'Never'}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button 
                          size="small" 
                          variant="outlined"
                          onClick={() => handleEditDialogOpen(apiKey)}
                          sx={{
                            borderRadius: '6px',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: (theme) => theme.palette.mode === 'dark'
                                ? '0 4px 10px rgba(139, 92, 246, 0.2)'
                                : '0 4px 10px rgba(59, 130, 246, 0.1)'
                            }
                          }}
                        >
                          Edit
                        </Button>
                        <Button 
                          size="small" 
                          variant="outlined"
                          color="error"
                          onClick={() => handleDeleteApiKey(apiKey.id)}
                          sx={{
                            borderRadius: '6px',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: (theme) => theme.palette.mode === 'dark'
                                ? '0 4px 10px rgba(248, 113, 113, 0.2)'
                                : '0 4px 10px rgba(239, 68, 68, 0.1)'
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
      {/* Create API Key Dialog */}
      <Dialog 
        open={openCreateDialog} 
        onClose={handleDialogClose}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: (theme) => theme.palette.mode === 'dark'
              ? '0 10px 35px rgba(0, 0, 0, 0.5), 0 0 15px rgba(139, 92, 246, 0.2)'
              : '0 10px 35px rgba(0, 0, 0, 0.1)',
            minWidth: '400px'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1, fontWeight: 600 }}>Create API Key</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="API Key Name"
            type="text"
            fullWidth
            value={formData.name}
            onChange={handleInputChange}
            sx={{ mt: 2, mb: 1 }}
          />
          <TextField
            margin="dense"
            name="rateLimit"
            label="Rate Limit (requests per minute)"
            type="number"
            fullWidth
            value={formData.rateLimit}
            onChange={handleInputChange}
            sx={{ mt: 1, mb: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={handleDialogClose}
            sx={{
              borderRadius: '6px',
              fontWeight: 500,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)'
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateApiKey} 
            variant="contained" 
            color="primary"
            sx={{
              borderRadius: '6px',
              fontWeight: 500,
              px: 2,
              transition: 'all 0.3s ease',
              boxShadow: (theme) => theme.palette.mode === 'dark'
                ? '0 4px 12px rgba(124, 58, 237, 0.3)'
                : '0 4px 12px rgba(59, 130, 246, 0.2)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: (theme) => theme.palette.mode === 'dark'
                  ? '0 8px 16px rgba(124, 58, 237, 0.4)'
                  : '0 8px 16px rgba(59, 130, 246, 0.25)'
              }
            }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit API Key Dialog - Similar styling as Create */}
      <Dialog 
        open={openEditDialog} 
        onClose={handleDialogClose}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: (theme) => theme.palette.mode === 'dark'
              ? '0 10px 35px rgba(0, 0, 0, 0.5), 0 0 15px rgba(139, 92, 246, 0.2)'
              : '0 10px 35px rgba(0, 0, 0, 0.1)',
            minWidth: '400px'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1, fontWeight: 600 }}>Edit API Key</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="API Key Name"
            type="text"
            fullWidth
            value={formData.name}
            onChange={handleInputChange}
            sx={{ mt: 2, mb: 1 }}
          />
          <TextField
            margin="dense"
            name="rateLimit"
            label="Rate Limit (requests per minute)"
            type="number"
            fullWidth
            value={formData.rateLimit}
            onChange={handleInputChange}
            sx={{ mt: 1, mb: 2 }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.isActive}
                onChange={handleInputChange}
                name="isActive"
                color="primary"
              />
            }
            label="Active"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={handleDialogClose}
            sx={{
              borderRadius: '6px',
              fontWeight: 500,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)'
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateApiKey} 
            variant="contained" 
            color="primary"
            sx={{
              borderRadius: '6px',
              fontWeight: 500,
              px: 2,
              transition: 'all 0.3s ease',
              boxShadow: (theme) => theme.palette.mode === 'dark'
                ? '0 4px 12px rgba(124, 58, 237, 0.3)'
                : '0 4px 12px rgba(59, 130, 246, 0.2)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: (theme) => theme.palette.mode === 'dark'
                  ? '0 8px 16px rgba(124, 58, 237, 0.4)'
                  : '0 8px 16px rgba(59, 130, 246, 0.25)'
              }
            }}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ApiKeys;
