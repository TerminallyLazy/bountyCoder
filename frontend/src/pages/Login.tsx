import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Typography, Box, Paper, Alert, useTheme } from '@mui/material';
import { login, clearError } from '../redux/slices/authSlice';
import { RootState } from '../redux/store';
import { useThemeContext } from '../contexts/ThemeContext';
import { Brightness4, Brightness7 } from '@mui/icons-material';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const theme = useTheme();
  const { mode, toggleTheme } = useThemeContext();
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  React.useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      await dispatch(login({ email, password }) as any);
    }
  };
  return (
    <Box 
      className="flex items-center justify-center min-h-screen" 
      sx={{ 
        bgcolor: 'background.default',
        color: 'text.primary'
      }}
    >
      <Paper 
        className="p-8 w-full max-w-md"
        sx={{ 
          p: 4, 
          maxWidth: 500, 
          mx: 'auto',
          bgcolor: 'background.paper', 
          position: 'relative' 
        }}
      >
        <Box sx={{ position: 'absolute', top: 10, right: 10 }}>
          <Button 
            onClick={toggleTheme}
            startIcon={mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
            size="small"
          >
            {mode === 'dark' ? 'Light' : 'Dark'} Mode
          </Button>
        </Box>

        <Typography variant="h4" className="mb-6 text-center font-bold" sx={{ mb: 2, color: 'primary.main' }}>
          Qwen 32B Coder API
        </Typography>
        
        <Typography variant="h5" className="mb-6 text-center" sx={{ mb: 3 }}>
          Admin Dashboard Login
        </Typography>
        
        {error && (
          <Alert severity="error" className="mb-4" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            className="mt-4"
            sx={{ mt: 3 }}
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default Login;
