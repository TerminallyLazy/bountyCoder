import React from 'react';
import { Typography, Grid, Paper, Box, Card, CardContent, Divider, useTheme, alpha } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import PeopleIcon from '@mui/icons-material/People';
import CodeIcon from '@mui/icons-material/Code';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const Dashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const theme = useTheme();
  
  // Card styles based on current theme
  const cardStyle = {
    height: '100%',
    transition: 'all 0.3s ease',
    background: theme.palette.mode === 'dark' 
      ? 'linear-gradient(145deg, #1e293b, #1a2234)'
      : 'linear-gradient(145deg, #ffffff, #f5f5f5)',
    border: theme.palette.mode === 'dark' 
      ? '1px solid rgba(255, 255, 255, 0.03)'
      : 'none',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: theme.palette.mode === 'dark'
        ? '0 8px 25px rgba(0, 0, 0, 0.3), 0 0 15px rgba(139, 92, 246, 0.3)'
        : '0 8px 25px rgba(37, 99, 235, 0.1)',
      border: theme.palette.mode === 'dark'
        ? '1px solid rgba(139, 92, 246, 0.2)'
        : 'none',
    }
  };

  // Stats card with icons
  const statCards = [
    { 
      title: 'API Keys', 
      value: '12', 
      description: 'Active API Keys',
      icon: <VpnKeyIcon sx={{ 
        fontSize: 40, 
        color: theme.palette.mode === 'dark' ? '#8b5cf6' : '#2563eb' 
      }} />,
      color: theme.palette.mode === 'dark' ? '#8b5cf6' : '#2563eb'
    },
    { 
      title: 'Usage', 
      value: '1.2M', 
      description: 'Total Tokens Used',
      icon: <TrendingUpIcon sx={{ 
        fontSize: 40, 
        color: theme.palette.mode === 'dark' ? '#ec4899' : '#10b981' 
      }} />,
      color: theme.palette.mode === 'dark' ? '#ec4899' : '#10b981'
    },
    { 
      title: 'Customers', 
      value: '24', 
      description: 'Total Customers',
      icon: <PeopleIcon sx={{ 
        fontSize: 40, 
        color: theme.palette.mode === 'dark' ? '#38bdf8' : '#f59e0b' 
      }} />,
      color: theme.palette.mode === 'dark' ? '#38bdf8' : '#f59e0b'
    },
    { 
      title: 'Models', 
      value: '3', 
      description: 'Active Models',
      icon: <CodeIcon sx={{ 
        fontSize: 40, 
        color: theme.palette.mode === 'dark' ? '#4ade80' : '#0ea5e9' 
      }} />,
      color: theme.palette.mode === 'dark' ? '#4ade80' : '#0ea5e9'
    }
  ];

  const recentActivity = [
    {
      time: '1 hour ago',
      activity: 'API key AX72B3-C was created by admin@example.com'
    },
    {
      time: '3 hours ago',
      activity: 'Customer John Doe completed 120 requests'
    },
    {
      time: '6 hours ago',
      activity: 'System maintenance completed successfully'
    }
  ];

  return (
    <Box sx={{ p: 2 }}>
      {/* Dashboard header with welcome message */}
      <Box sx={{ 
        mb: 4, 
        p: 3, 
        borderRadius: 2,
        background: theme.palette.mode === 'dark' 
          ? `linear-gradient(90deg, ${alpha(theme.palette.primary.dark, 0.7)}, ${alpha(theme.palette.primary.main, 0.4)})`
          : `linear-gradient(90deg, ${alpha(theme.palette.primary.light, 0.1)}, ${alpha(theme.palette.background.default, 0.6)})`
      }}>
        <Typography variant="h4" gutterBottom fontWeight="bold" 
          sx={{ 
            color: theme.palette.mode === 'dark' ? 'white' : theme.palette.primary.main,
            textShadow: theme.palette.mode === 'dark' ? '0 0 5px rgba(139, 92, 246, 0.5)' : 'none'
          }}>
          Admin Dashboard
        </Typography>
        
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          Welcome back, {user?.name || user?.email}!
        </Typography>
      </Box>
      
      {/* Stat cards */}
      <Grid container spacing={3}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={cardStyle} className="dashboard-card">
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600,
                      color: card.color
                    }}
                  >
                    {card.title}
                  </Typography>
                  {card.icon}
                </Box>
                
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  {card.value}
                </Typography>
                
                <Typography variant="body2" color="text.secondary">
                  {card.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {/* Recent Activity */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccessTimeIcon sx={{ color: theme.palette.mode === 'dark' ? '#8b5cf6' : '#2563eb' }} /> 
            Recent Activity
          </Box>
        </Typography>
        
        <Card sx={cardStyle} className="dashboard-card">
          <CardContent sx={{ p: 0 }}>
            {recentActivity.length > 0 ? (
              recentActivity.map((item, index) => (
                <React.Fragment key={index}>
                  <Box sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ 
                        fontWeight: 600,
                        color: theme.palette.mode === 'dark' ? '#8b5cf6' : '#2563eb'
                      }}>
                        {item.time}
                      </Typography>
                    </Box>
                    <Typography variant="body1">
                      {item.activity}
                    </Typography>
                  </Box>
                  {index < recentActivity.length - 1 && <Divider />}
                </React.Fragment>
              ))
            ) : (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1">
                  No recent activity to display.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Dashboard;
