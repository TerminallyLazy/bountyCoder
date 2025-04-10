import React from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Grid, 
  useTheme 
} from '@mui/material';
import { useThemeContext } from '../contexts/ThemeContext';

const ThemeDemo: React.FC = () => {
  const theme = useTheme();
  const { mode } = useThemeContext();

  return (
    <Box sx={{ mt: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Theme Demonstration
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Current theme: <strong>{mode.charAt(0).toUpperCase() + mode.slice(1)}</strong>
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Primary color: <Box component="span" sx={{ color: 'primary.main' }}>This text uses the primary color</Box>
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Secondary color: <Box component="span" sx={{ color: 'secondary.main' }}>This text uses the secondary color</Box>
        </Typography>
        
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Button variant="contained" color="primary" sx={{ mr: 2, mb: 2 }}>
              Primary Button
            </Button>
            <Button variant="contained" color="secondary" sx={{ mr: 2, mb: 2 }}>
              Secondary Button
            </Button>
          </Grid>
          <Grid item xs={12} md={6}>
            <Button variant="outlined" color="primary" sx={{ mr: 2, mb: 2 }}>
              Outlined Primary
            </Button>
            <Button variant="outlined" color="secondary" sx={{ mr: 2, mb: 2 }}>
              Outlined Secondary
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default ThemeDemo;
