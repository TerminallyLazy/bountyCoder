import React, { useState } from 'react';
import { 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  Grid, 
  Divider,
  Alert,
  Box,
  Card,
  CardContent,
  CardHeader,
  useTheme,
  alpha
} from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { usersApi } from '../services/api';
import SaveIcon from '@mui/icons-material/Save';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';

const Settings: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const theme = useTheme();
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value,
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess(null);
    setProfileError(null);

    try {
      if (!user) return;
      
      await usersApi.update(user.id, {
        name: profileData.name,
        email: profileData.email,
      });
      
      setProfileSuccess('Profile updated successfully');
    } catch (err: any) {
      setProfileError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess(null);
    setPasswordError(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }

    try {
      if (!user) return;
      
      await usersApi.update(user.id, {
        password: passwordData.newPassword,
      });
      
      setPasswordSuccess('Password updated successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Failed to update password');
    }
  };

  // Common card styles
  const cardStyle = {
    height: '100%',
    transition: 'all 0.3s ease',
    background: theme.palette.mode === 'dark' 
      ? 'linear-gradient(145deg, #1e293b, #1a2234)'
      : 'linear-gradient(145deg, #ffffff, #f8f9fa)',
    border: theme.palette.mode === 'dark' 
      ? '1px solid rgba(255, 255, 255, 0.03)'
      : 'none',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 5px 20px rgba(0, 0, 0, 0.2)'
      : '0 5px 20px rgba(0, 0, 0, 0.05)',
    overflow: 'visible',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: theme.palette.mode === 'dark'
        ? '0 8px 25px rgba(0, 0, 0, 0.3), 0 0 15px rgba(139, 92, 246, 0.2)'
        : '0 8px 25px rgba(37, 99, 235, 0.1)',
      border: theme.palette.mode === 'dark'
        ? '1px solid rgba(139, 92, 246, 0.2)'
        : 'none',
    }
  };

  // Button styles
  const buttonStyle = {
    borderRadius: 8,
    fontWeight: 600,
    padding: '10px 20px',
    transition: 'all 0.3s ease',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 4px 10px rgba(124, 58, 237, 0.3)'
      : '0 4px 10px rgba(59, 130, 246, 0.2)',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: theme.palette.mode === 'dark'
        ? '0 6px 15px rgba(124, 58, 237, 0.4), 0 0 10px rgba(139, 92, 246, 0.3)'
        : '0 6px 15px rgba(59, 130, 246, 0.3)'
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Page header */}
      <Box sx={{ 
        mb: 4, 
        p: 3, 
        borderRadius: 2,
        background: theme.palette.mode === 'dark' 
          ? `linear-gradient(90deg, ${alpha(theme.palette.secondary.dark, 0.7)}, ${alpha(theme.palette.secondary.main, 0.4)})`
          : `linear-gradient(90deg, ${alpha(theme.palette.secondary.light, 0.1)}, ${alpha(theme.palette.background.default, 0.6)})`
      }}>
        <Typography variant="h4" gutterBottom fontWeight="bold" 
          sx={{ 
            color: theme.palette.mode === 'dark' ? 'white' : theme.palette.secondary.main,
            textShadow: theme.palette.mode === 'dark' ? '0 0 5px rgba(236, 72, 153, 0.5)' : 'none'
          }}>
          Account Settings
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          Manage your profile and security settings
        </Typography>
      </Box>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card sx={cardStyle}>
            <CardHeader
              avatar={
                <Box sx={{ 
                  background: theme.palette.mode === 'dark' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <PersonIcon color="primary" />
                </Box>
              }
              title={
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Profile Settings
                </Typography>
              }
            />
            <Divider sx={{ mx: 2, opacity: 0.6 }} />
            <CardContent sx={{ pt: 3 }}>
              {profileSuccess && (
                <Alert 
                  severity="success" 
                  sx={{ 
                    mb: 3, 
                    borderRadius: 2,
                    boxShadow: '0 4px 10px rgba(16, 185, 129, 0.1)'
                  }}
                >
                  {profileSuccess}
                </Alert>
              )}
              
              {profileError && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 3, 
                    borderRadius: 2,
                    boxShadow: '0 4px 10px rgba(239, 68, 68, 0.1)'
                  }}
                >
                  {profileError}
                </Alert>
              )}
              
              <form onSubmit={handleUpdateProfile}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Name"
                  name="name"
                  value={profileData.name}
                  onChange={handleProfileChange}
                  variant="outlined"
                  sx={{ 
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />
                
                <TextField
                  fullWidth
                  margin="normal"
                  label="Email"
                  name="email"
                  type="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  variant="outlined"
                  sx={{ 
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />
                
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    sx={buttonStyle}
                  >
                    Update Profile
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card sx={cardStyle}>
            <CardHeader
              avatar={
                <Box sx={{ 
                  background: theme.palette.mode === 'dark' ? 'rgba(236, 72, 153, 0.2)' : 'rgba(236, 72, 153, 0.1)',
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <LockIcon color="secondary" />
                </Box>
              }
              title={
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Change Password
                </Typography>
              }
            />
            <Divider sx={{ mx: 2, opacity: 0.6 }} />
            <CardContent sx={{ pt: 3 }}>
              {passwordSuccess && (
                <Alert 
                  severity="success" 
                  sx={{ 
                    mb: 3, 
                    borderRadius: 2,
                    boxShadow: '0 4px 10px rgba(16, 185, 129, 0.1)'
                  }}
                >
                  {passwordSuccess}
                </Alert>
              )}
              
              {passwordError && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 3, 
                    borderRadius: 2,
                    boxShadow: '0 4px 10px rgba(239, 68, 68, 0.1)'
                  }}
                >
                  {passwordError}
                </Alert>
              )}
              
              <form onSubmit={handleUpdatePassword}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Current Password"
                  name="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                  variant="outlined"
                  sx={{ 
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />
                
                <TextField
                  fullWidth
                  margin="normal"
                  label="New Password"
                  name="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  variant="outlined"
                  sx={{ 
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                  helperText="Must be at least 8 characters long"
                />
                
                <TextField
                  fullWidth
                  margin="normal"
                  label="Confirm New Password"
                  name="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  variant="outlined"
                  sx={{ 
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />
                
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="secondary"
                    startIcon={<LockIcon />}
                    sx={buttonStyle}
                  >
                    Change Password
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Settings;
