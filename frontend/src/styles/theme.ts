import { createTheme, alpha } from '@mui/material/styles';
import { Components } from '@mui/material/styles/components';
import { Theme } from '@mui/material/styles';

// Common component overrides for both themes
const commonComponents = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        textTransform: 'none',
        fontWeight: 600,
        boxShadow: 'none',
        padding: '10px 20px',
      },
      contained: {
        '&:hover': {
          boxShadow: '0 8px 16px 0 rgba(0, 0, 0, 0.1)',
        },
      },
      outlined: {
        borderWidth: 2,
        '&:hover': {
          borderWidth: 2,
        },
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: 12,
      },
      elevation1: {
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        overflow: 'hidden',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
        }
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 8,
        },
      },
    },
  },
} as Components<Omit<Theme, "components">>;

// Light theme - Clean, professional
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb', // Modern blue
      light: '#60a5fa',
      dark: '#1e40af',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#10b981', // Fresh teal/green
      light: '#34d399',
      dark: '#059669',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f9fafb',
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
    },
    error: {
      main: '#ef4444',
    },
    warning: {
      main: '#f59e0b',
    },
    info: {
      main: '#0ea5e9',
    },
    success: {
      main: '#10b981',
    },
    divider: 'rgba(0, 0, 0, 0.08)',
  },
  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 1px 3px rgba(0, 0, 0, 0.08)',
    '0px 2px 6px rgba(0, 0, 0, 0.04)',
    '0px 4px 12px rgba(0, 0, 0, 0.04)',
    '0px 6px 16px rgba(0, 0, 0, 0.04)',
    '0px 8px 24px rgba(0, 0, 0, 0.04)',
    '0px 12px 32px rgba(0, 0, 0, 0.04)',
    '0px 16px 40px rgba(0, 0, 0, 0.04)',
    'none', 'none', 'none', 'none', 'none',
    'none', 'none', 'none', 'none', 'none',
    'none', 'none', 'none', 'none', 'none',
    'none', 'none',
  ] as ["none", string, string, string, string, string, string, string, string, string, string, string, string, string, string, string, string, string, string, string, string, string, string, string, string],
  components: {
    ...commonComponents,
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#1e293b',
        },
      },
    },
  },
});

// Dark theme - Elegant, glowing, modern
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#8b5cf6', // Vibrant purple
      light: '#a78bfa',
      dark: '#7c3aed',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ec4899', // Bright pink
      light: '#f472b6',
      dark: '#db2777',
      contrastText: '#ffffff',
    },
    background: {
      default: '#0f172a', // Deep blue-black
      paper: '#1e293b', // Navy blue-gray
    },
    text: {
      primary: '#f1f5f9',
      secondary: '#94a3b8',
    },
    error: {
      main: '#f87171',
    },
    warning: {
      main: '#fbbf24',
    },
    info: {
      main: '#38bdf8',
    },
    success: {
      main: '#4ade80',
    },
    divider: 'rgba(255, 255, 255, 0.08)',
  },
  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 2px 6px rgba(0, 0, 0, 0.2)',
    '0px 4px 12px rgba(0, 0, 0, 0.2)',
    '0px 6px 18px rgba(0, 0, 0, 0.2)',
    '0px 8px 24px rgba(124, 58, 237, 0.05)',
    '0px 10px 30px rgba(124, 58, 237, 0.06)',
    '0px 12px 36px rgba(124, 58, 237, 0.07)',
    '0px 14px 42px rgba(124, 58, 237, 0.08)',
    '0px 16px 48px rgba(124, 58, 237, 0.09)',
    '0px 18px 54px rgba(124, 58, 237, 0.10)',
    '0px 20px 60px rgba(124, 58, 237, 0.11)',
    '0px 22px 66px rgba(124, 58, 237, 0.12)',
    '0px 24px 72px rgba(124, 58, 237, 0.13)',
    '0px 26px 78px rgba(124, 58, 237, 0.14)',
    '0px 28px 84px rgba(124, 58, 237, 0.15)',
    '0px 30px 90px rgba(124, 58, 237, 0.16)',
    '0px 32px 96px rgba(124, 58, 237, 0.17)',
    '0px 34px 102px rgba(124, 58, 237, 0.18)',
    '0px 36px 108px rgba(124, 58, 237, 0.19)',
    '0px 38px 114px rgba(124, 58, 237, 0.20)',
    '0px 40px 120px rgba(124, 58, 237, 0.21)',
    '0px 42px 126px rgba(124, 58, 237, 0.22)',
    '0px 44px 132px rgba(124, 58, 237, 0.23)',
    '0px 46px 138px rgba(124, 58, 237, 0.24)',
    '0px 48px 144px rgba(124, 58, 237, 0.25)',
  ] as ["none", string, string, string, string, string, string, string, string, string, string, string, string, string, string, string, string, string, string, string, string, string, string, string, string],
  components: {
    ...commonComponents,
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(90deg, #1e293b 0%, #0f172a 100%)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.025), rgba(255, 255, 255, 0))',
          backdropFilter: 'blur(2px)',
        },
        elevation1: {
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
        },
        elevation2: {
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          background: 'linear-gradient(45deg, #7c3aed 30%, #8b5cf6 90%)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            background: 'linear-gradient(45deg, #6d28d9 30%, #7c3aed 90%)',
            boxShadow: '0 8px 20px rgba(124, 58, 237, 0.3), 0 0 10px rgba(124, 58, 237, 0.2)',
            transform: 'translateY(-2px)',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
            opacity: '0',
            transition: 'opacity 0.5s ease',
            pointerEvents: 'none',
          },
          '&:hover::after': {
            opacity: '1',
          }
        },
        containedSecondary: {
          background: 'linear-gradient(45deg, #db2777 30%, #ec4899 90%)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            background: 'linear-gradient(45deg, #be185d 30%, #db2777 90%)',
            boxShadow: '0 8px 20px rgba(236, 72, 153, 0.3), 0 0 10px rgba(236, 72, 153, 0.2)',
            transform: 'translateY(-2px)',
          },
        },
        outlined: {
          borderColor: 'rgba(255, 255, 255, 0.15)',
          borderWidth: '2px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            borderColor: 'rgba(255, 255, 255, 0.25)',
            boxShadow: '0 4px 15px rgba(255, 255, 255, 0.1), 0 0 8px rgba(139, 92, 246, 0.2)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(255, 255, 255, 0.15)',
          '&.Mui-selected': {
            background: 'rgba(124, 58, 237, 0.2)',
            color: '#a78bfa',
            borderColor: '#7c3aed',
          },
        },
      },
    },
    MuiIcon: {
      styleOverrides: {
        root: {
          filter: 'drop-shadow(0 0 5px rgba(139, 92, 246, 0.4))',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
          },
        },
      },
    },
  },
});

