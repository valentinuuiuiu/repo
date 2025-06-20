import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';
import React, { createContext, useContext, useMemo, useState } from 'react';

// Define the ColorModeContext type
interface ColorModeContextType {
  toggleColorMode: () => void;
  mode: PaletteMode;
}

// Create a context for color mode
export const ColorModeContext = createContext<ColorModeContextType>({
  toggleColorMode: () => {},
  mode: 'light',
});

// Custom hook to use the theme mode
export const useThemeMode = () => {
  return useContext(ColorModeContext);
};

// Theme provider component with proper JSX syntax
export const ThemeModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<PaletteMode>('light');

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
      mode,
    }),
    [mode]
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#1976d2',
          },
          secondary: {
            main: '#dc004e',
          },
        },
      }),
    [mode]
  );

  // Fixed JSX nesting and closing tags
  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

// Default theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

export default theme;