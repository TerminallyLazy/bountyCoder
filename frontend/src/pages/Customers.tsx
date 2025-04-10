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
  MenuItem,
  Select,
  SelectChangeEvent,
  FormControl,
  InputLabel,
  Alert,
  Box,
  useTheme,
  alpha,
  CircularProgress,
  Chip
} from '@mui/material';
import { usersApi } from '../services/api';
import AddIcon from '@mui/icons-material/Add';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'ADMIN' | 'CUSTOMER';
  createdAt: string;
  _count: {
    apiKeys: number;
  };
}

const Customers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'CUSTOMER',
    password: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersApi.getAll();
      setUsers(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleEditDialogOpen = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name || '',
      email: user.email,
      role: user.role,
      password: ''
    });
    setOpenEditDialog(true);
  };

  const handleDialogClose = () => {
    setOpenEditDialog(false);
    setSelectedUser(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    
    const updateData: any = {};
    if (formData.name !== selectedUser.name) updateData.name = formData.name;
    if (formData.email !== selectedUser.email) updateData.email = formData.email;
    if (formData.role !== selectedUser.role) updateData.role = formData.role;
    if (formData.password) updateData.password = formData.password;
    
    try {
      await usersApi.update(selectedUser.id, updateData);
      handleDialogClose();
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await usersApi.delete(id);
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Page header */}
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
          Customers
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<PersonAddIcon />}
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
          Add Customer
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
                <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>API Keys</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Created</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <CircularProgress size={32} />
                    </Box>
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No users found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow 
                    key={user.id}
                    sx={{ 
                      transition: 'all 0.2s ease',
                      '&:hover': { 
                        background: (theme) => theme.palette.mode === 'dark' 
                          ? 'rgba(255, 255, 255, 0.02)'
                          : 'rgba(0, 0, 0, 0.01)'
                      }
                    }}
                  >
                    <TableCell>{user.name || '-'}</TableCell>
                    <TableCell>
                      <Box sx={{ 
                        fontFamily: 'monospace', 
                        fontSize: '0.875rem',
                        opacity: 0.9
                      }}>
                        {user.email}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={user.role}
                        size="small"
                        sx={{ 
                          fontWeight: 'medium',
                          bgcolor: user.role === 'ADMIN' 
                            ? (theme) => theme.palette.mode === 'dark' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(124, 58, 237, 0.1)' 
                            : (theme) => theme.palette.mode === 'dark' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(59, 130, 246, 0.1)',
                          color: user.role === 'ADMIN' 
                            ? (theme) => theme.palette.mode === 'dark' ? '#a78bfa' : '#7c3aed'
                            : (theme) => theme.palette.mode === 'dark' ? '#38bdf8' : '#3b82f6'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={user._count.apiKeys}
                        size="small"
                        color={user._count.apiKeys > 0 ? "primary" : "default"}
                        sx={{ 
                          minWidth: '40px',
                        }}
                      />
                    </TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button 
                          size="small" 
                          variant="outlined"
                          startIcon={<EditIcon />}
                          onClick={() => handleEditDialogOpen(user)}
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
                          startIcon={<DeleteIcon />}
                          color="error"
                          onClick={() => handleDeleteUser(user.id)}
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
      
      {/* Edit User Dialog */}
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
        <DialogTitle sx={{ pb: 1, fontWeight: 600 }}>Edit User</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Name"
            type="text"
            fullWidth
            value={formData.name}
            onChange={handleInputChange}
            variant="outlined"
            sx={{ 
              mt: 2, 
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
          <TextField
            margin="dense"
            name="email"
            label="Email"
            type="email"
            fullWidth
            value={formData.email}
            onChange={handleInputChange}
            variant="outlined"
            sx={{ 
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
          <FormControl 
            fullWidth 
            margin="dense"
            sx={{ 
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          >
            <InputLabel id="role-label">Role</InputLabel>
            <Select
              labelId="role-label"
              name="role"
              value={formData.role}
              label="Role"
              onChange={handleSelectChange}
            >
              <MenuItem value="ADMIN">Admin</MenuItem>
              <MenuItem value="CUSTOMER">Customer</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            name="password"
            label="New Password (leave blank to keep current)"
            type="password"
            fullWidth
            value={formData.password}
            onChange={handleInputChange}
            variant="outlined"
            sx={{ 
              mb: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
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
            onClick={handleUpdateUser}
            variant="contained" 
            color="primary"
            startIcon={<EditIcon />}
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

export default Customers;
