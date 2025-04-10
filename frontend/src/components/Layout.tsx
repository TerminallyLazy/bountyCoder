import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link, Outlet } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  VpnKey as ApiKeyIcon,
  People as CustomersIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Brightness4,
  Brightness7,
} from '@mui/icons-material';
import { logout } from '../redux/slices/authSlice';
import { RootState } from '../redux/store';
import { useThemeContext } from '../contexts/ThemeContext';

const drawerWidth = 240;

const Layout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { mode, toggleTheme } = useThemeContext();
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'API Keys', icon: <ApiKeyIcon />, path: '/api-keys' },
    { text: 'Customers', icon: <CustomersIcon />, path: '/customers', adminOnly: true },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Qwen 32B Admin
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          (!item.adminOnly || user?.role === 'ADMIN') && (
            <ListItem key={item.text} disablePadding>
              <ListItemButton component={Link} to={item.path}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          )
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: (theme) => theme.palette.mode === 'dark' 
            ? 'linear-gradient(90deg, #1e293b 0%, #0f172a 100%)' 
            : 'linear-gradient(90deg, #ffffff 0%, #f8fafc 100%)',
          boxShadow: (theme) => theme.palette.mode === 'dark'
            ? '0 4px 20px rgba(0, 0, 0, 0.25)'
            : '0 2px 10px rgba(0, 0, 0, 0.05)'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ 
            flexGrow: 1,
            fontWeight: 600,
            letterSpacing: '0.02em',
            color: (theme) => theme.palette.mode === 'dark' ? '#f1f5f9' : '#1e293b'
          }}>
            Qwen 32B Coder API Admin
          </Typography>

          <IconButton
            onClick={toggleTheme}
            sx={{
              mr: 2,
              transition: 'all 0.3s ease',
              background: (theme) => theme.palette.mode === 'dark' 
                ? 'rgba(139, 92, 246, 0.15)'
                : 'rgba(37, 99, 235, 0.1)',
              '&:hover': {
                background: (theme) => theme.palette.mode === 'dark'
                  ? 'rgba(139, 92, 246, 0.25)'
                  : 'rgba(37, 99, 235, 0.2)',
                transform: 'translateY(-2px)'
              }
            }}
          >
            {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>

          <Button 
            color="inherit" 
            onClick={handleLogout}
            className="action-button"
            sx={{
              fontWeight: 600,
              borderRadius: '8px',
              padding: '8px 16px',
              transition: 'all 0.3s ease',
              background: (theme) => theme.palette.mode === 'dark'
                ? 'linear-gradient(45deg, #7c3aed30, #8b5cf630)'
                : 'linear-gradient(45deg, #2563eb20, #3b82f620)',
              '&:hover': {
                background: (theme) => theme.palette.mode === 'dark'
                  ? 'linear-gradient(45deg, #7c3aed40, #8b5cf640)'
                  : 'linear-gradient(45deg, #2563eb30, #3b82f630)',
                transform: 'translateY(-2px)',
                boxShadow: (theme) => theme.palette.mode === 'dark'
                  ? '0 5px 15px rgba(124, 58, 237, 0.2)'
                  : '0 5px 15px rgba(37, 99, 235, 0.15)'
              }
            }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              background: (theme) => theme.palette.mode === 'dark'
                ? 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)'
                : '#ffffff'
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              background: (theme) => theme.palette.mode === 'dark'
                ? 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)'
                : '#ffffff',
              boxShadow: (theme) => theme.palette.mode === 'dark'
                ? '1px 0 10px rgba(0, 0, 0, 0.2)'
                : '1px 0 5px rgba(0, 0, 0, 0.05)',
              borderRight: (theme) => theme.palette.mode === 'dark'
                ? '1px solid rgba(255, 255, 255, 0.05)'
                : '1px solid rgba(0, 0, 0, 0.08)'
            },
          }}
          open
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto', py: 2 }}>
            <List>
              {menuItems.map((item) => (
                <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
                  <ListItemButton 
                    component={Link} 
                    to={item.path}
                    sx={{
                      borderRadius: '8px',
                      mx: 1,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: (theme) => theme.palette.mode === 'dark'
                          ? 'rgba(139, 92, 246, 0.15)'
                          : 'rgba(37, 99, 235, 0.1)',
                        transform: 'translateX(5px)'
                      },
                      '&.Mui-selected': {
                        background: (theme) => theme.palette.mode === 'dark'
                          ? 'rgba(139, 92, 246, 0.2)'
                          : 'rgba(37, 99, 235, 0.15)',
                        '&:hover': {
                          background: (theme) => theme.palette.mode === 'dark'
                            ? 'rgba(139, 92, 246, 0.25)'
                            : 'rgba(37, 99, 235, 0.2)',
                        }
                      }
                    }}
                  >
                    <ListItemIcon sx={{ 
                      color: (theme) => theme.palette.mode === 'dark' 
                        ? '#8b5cf6' 
                        : '#2563eb',
                      minWidth: '40px'
                    }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.text} 
                      primaryTypographyProps={{ 
                        fontWeight: 500,
                        fontSize: '0.95rem'
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
              <Divider sx={{ my: 2, opacity: 0.5 }} />
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton 
                  onClick={handleLogout}
                  sx={{
                    borderRadius: '8px',
                    mx: 1,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: (theme) => theme.palette.mode === 'dark'
                        ? 'rgba(139, 92, 246, 0.15)'
                        : 'rgba(239, 68, 68, 0.1)',
                      transform: 'translateX(5px)'
                    }
                  }}
                >
                  <ListItemIcon sx={{ 
                    color: (theme) => theme.palette.mode === 'dark' 
                      ? '#f87171' 
                      : '#ef4444',
                    minWidth: '40px'
                  }}>
                    <LogoutIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Logout" 
                    primaryTypographyProps={{ 
                      fontWeight: 500,
                      fontSize: '0.95rem'
                    }}
                  />
                </ListItemButton>
              </ListItem>
            </List>
          </Box>
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          background: (theme) => theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #0f172a 0%, #111827 100%)'
            : 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
          minHeight: '100vh'
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
