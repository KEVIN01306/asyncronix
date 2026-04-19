import { createTheme } from '@mui/material/styles';

export const mainTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#673de6',
        },
        secondary: {
            main: '#8863F8',
        },
        warning: {
            main: '#f59e0b',
        },
        success: {
            main: '#10b981',
        },
        info: {
            main: '#38bdf8',
        },
        background: {
            default: '#f8faff',
            paper: '#ffffff',
        },
        text: {
            primary: '#0f172a', 
            secondary: '#64748b',
        },
        divider: '#e3e8ee'
    },
    shape: {
        borderRadius: 12
    },
    typography: {
        fontFamily: '"Inter","Roboto", "Helvetica", Arial, sans-serif',
        h1: { fontSize: '2.5rem', fontWeight: 700 },
        button: { textTransform: 'none', fontWeight: 600 }
    },
    components: {
        MuiButton: {
            defaultProps: {
                disableElevation: true
            }
        },
        MuiCard: {
                styleOverrides: {
                root: ({ theme }) => ({
                    border: `1px solid ${theme.palette.divider}`
                })
            }
        },
        MuiPaper: {
            styleOverrides: {
                root: ({ theme }) => ({
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: 'none'
                })
            }
        }
    }
})