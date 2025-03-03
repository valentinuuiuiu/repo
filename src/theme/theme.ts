import { PaletteMode } from '@mui/material';
import { ThemeOptions } from '@mui/material/styles';

/**
 * Get design tokens based on the current theme mode
 * This function returns the appropriate theme options for light or dark mode
 */
export const getDesignTokens = (mode: PaletteMode): ThemeOptions => {
  // Common palette values
  const primaryMain = '#1976d2';
  const secondaryMain = '#dc004e';

  return {
    palette: {
      mode,
      ...(mode === 'light'
        ? {
            // Light mode palette
            primary: {
              main: primaryMain,
              light: '#42a5f5',
              dark: '#1565c0',
              contrastText: '#ffffff',
            },
            secondary: {
              main: secondaryMain,
              light: '#ff4081',
              dark: '#c51162',
              contrastText: '#ffffff',
            },
            error: {
              main: '#f44336',
            },
            warning: {
              main: '#ff9800',
            },
            info: {
              main: '#2196f3',
            },
            success: {
              main: '#4caf50',
            },
            background: {
              default: '#f5f5f5',
              paper: '#ffffff',
            },
            text: {
              primary: 'rgba(0, 0, 0, 0.87)',
              secondary: 'rgba(0, 0, 0, 0.6)',
            },
          }
        : {
            // Dark mode palette
            primary: {
              main: '#90caf9',
              light: '#e3f2fd',
              dark: '#42a5f5',
              contrastText: 'rgba(0, 0, 0, 0.87)',
            },
            secondary: {
              main: '#f48fb1',
              light: '#f8bbd0',
              dark: '#c2185b',
              contrastText: 'rgba(0, 0, 0, 0.87)',
            },
            error: {
              main: '#f44336',
              light: '#e57373',
            },
            warning: {
              main: '#ff9800',
              light: '#ffb74d',
            },
            info: {
              main: '#2196f3',
              light: '#64b5f6',
            },
            success: {
              main: '#4caf50',
              light: '#81c784',
            },
            background: {
              default: '#121212',
              paper: '#1e1e1e',
            },
            text: {
              primary: '#ffffff',
              secondary: 'rgba(255, 255, 255, 0.7)',
            },
          }),
    },
    typography: {
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
      h1: {
        fontSize: '2.5rem',
        fontWeight: 500,
      },
      h4: {
        fontWeight: 600,
      },
      button: {
        textTransform: 'none',
        fontWeight: 600,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '8px 16px',
          },
          contained: {
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
            },
          },
        },
      },
      MuiContainer: {
        styleOverrides: {
          root: {
            paddingTop: 24,
            paddingBottom: 24,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
  };
};