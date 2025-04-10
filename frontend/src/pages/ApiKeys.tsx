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
  Alert
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
    <div>
      <div className="flex justify-between items-center mb-4">
        <Typography variant="h4">
          API Keys
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleCreateDialogOpen}
        >
          Create API Key
        </Button>
      </div>
      
      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}
      
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>API Key</TableCell>
                <TableCell>Rate Limit</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Last Used</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">Loading...</TableCell>
                </TableRow>
              ) : apiKeys.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">No API keys found</TableCell>
                </TableRow>
              ) : (
                apiKeys.map((apiKey) => (
                  <TableRow key={apiKey.id}>
                    <TableCell>{apiKey.name}</TableCell>
                    <TableCell>
                      <code className="bg-gray-100 p-1 rounded">{apiKey.key.substring(0, 10)}...{apiKey.key.substring(apiKey.key.length - 5)}</code>
                    </TableCell>
                    <TableCell>{apiKey.rateLimit} req/min</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${apiKey.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {apiKey.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell>{new Date(apiKey.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{apiKey.lastUsed ? new Date(apiKey.lastUsed).toLocaleString() : 'Never'}</TableCell>
                    <TableCell>
                      <Button 
                        size="small" 
                        onClick={() => handleEditDialogOpen(apiKey)}
                      >
                        Edit
                      </Button>
                      <Button 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteApiKey(apiKey.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
      {/* Create API Key Dialog */}
      <Dialog open={openCreateDialog} onClose={handleDialogClose}>
        <DialogTitle>Create API Key</DialogTitle>
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
          />
          <TextField
            margin="dense"
            name="rateLimit"
            label="Rate Limit (requests per minute)"
            type="number"
            fullWidth
            value={formData.rateLimit}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleCreateApiKey} color="primary">Create</Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit API Key Dialog */}
      <Dialog open={openEditDialog} onClose={handleDialogClose}>
        <DialogTitle>Edit API Key</DialogTitle>
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
          />
          <TextField
            margin="dense"
            name="rateLimit"
            label="Rate Limit (requests per minute)"
            type="number"
            fullWidth
            value={formData.rateLimit}
            onChange={handleInputChange}
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
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleUpdateApiKey} color="primary">Update</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ApiKeys;
