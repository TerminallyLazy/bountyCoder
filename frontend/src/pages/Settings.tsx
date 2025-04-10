import React, { useState } from 'react';
import { 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  Grid, 
  Divider,
  Alert,
  Box
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { usersApi } from '../services/api';

const Settings: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
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

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper className="p-4">
            <Typography variant="h6" gutterBottom>
              Profile Settings
            </Typography>
            <Divider className="mb-4" />
            
            {profileSuccess && (
              <Alert severity="success" className="mb-4">
                {profileSuccess}
              </Alert>
            )}
            
            {profileError && (
              <Alert severity="error" className="mb-4">
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
              />
              
              <TextField
                fullWidth
                margin="normal"
                label="Email"
                name="email"
                type="email"
                value={profileData.email}
                onChange={handleProfileChange}
              />
              
              <Box className="mt-4">
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                >
                  Update Profile
                </Button>
              </Box>
            </form>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper className="p-4">
            <Typography variant="h6" gutterBottom>
              Change Password
            </Typography>
            <Divider className="mb-4" />
            
            {passwordSuccess && (
              <Alert severity="success" className="mb-4">
                {passwordSuccess}
              </Alert>
            )}
            
            {passwordError && (
              <Alert severity="error" className="mb-4">
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
              />
              
              <Box className="mt-4">
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                >
                  Change Password
                </Button>
              </Box>
            </form>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default Settings;
