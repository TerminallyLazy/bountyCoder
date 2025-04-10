import React from 'react';
import { Typography, Grid, Paper, Box } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

const Dashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      <Typography variant="subtitle1" gutterBottom>
        Welcome back, {user?.name || user?.email}!
      </Typography>
      
      <Grid container spacing={3} className="mt-4">
        <Grid item xs={12} md={6} lg={3}>
          <Paper className="p-4">
            <Typography variant="h6" gutterBottom>
              API Keys
            </Typography>
            <Typography variant="h4">
              0
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Active API Keys
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <Paper className="p-4">
            <Typography variant="h6" gutterBottom>
              Usage
            </Typography>
            <Typography variant="h4">
              0
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Total Tokens Used
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <Paper className="p-4">
            <Typography variant="h6" gutterBottom>
              Customers
            </Typography>
            <Typography variant="h4">
              0
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Total Customers
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <Paper className="p-4">
            <Typography variant="h6" gutterBottom>
              Models
            </Typography>
            <Typography variant="h4">
              1
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Active Models
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      <Box className="mt-6">
        <Typography variant="h5" gutterBottom>
          Recent Activity
        </Typography>
        <Paper className="p-4">
          <Typography variant="body1">
            No recent activity to display.
          </Typography>
        </Paper>
      </Box>
    </div>
  );
};

export default Dashboard;
