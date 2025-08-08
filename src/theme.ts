
import { createTheme } from '@mui/material/styles';

// Create a theme instance.
const theme = createTheme({
  palette: {
    primary: {
      main: '#6C63FF', // A modern, vibrant purple
    },
    secondary: {
      main: '#FF6584', // A complementary pink
    },
    background: {
      default: '#F4F6F8', // A light grey background
    },
    text: {
      primary: '#333333', // Darker text for better readability
    }
  },
  typography: {
    fontFamily: [
      'Poppins',
      'sans-serif'
    ].join(','),
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
  },
});

export default theme;
