//import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@mui/material/styles'
import { mainTheme } from './core/theme/mainTheme'
import { CssBaseline } from '@mui/material'
import { RouterProvider } from 'react-router-dom'
import appRouter from './presentation/routers/appRouter'
import { Toaster } from 'sonner'
import activarNotificaciones  from './core/notificaciones/notificaciones.config';


createRoot(document.getElementById('root')!).render(
    <ThemeProvider theme={mainTheme}>
      <CssBaseline />
        <RouterProvider router={appRouter}/>
        <Toaster position="top-right" closeButton />
    </ThemeProvider>
)

activarNotificaciones();
