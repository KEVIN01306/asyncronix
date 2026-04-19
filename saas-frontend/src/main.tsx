import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@mui/material/styles'
import { mainTheme } from './core/theme/mainTheme'
import { CssBaseline } from '@mui/material'
import { RouterProvider } from 'react-router-dom'
import appRouter from './presentation/routers/appRouter'
import { Toaster } from 'sonner'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={mainTheme}>
      <CssBaseline />
        <RouterProvider router={appRouter}/>
        <Toaster position="top-right" closeButton />
    </ThemeProvider>
  </StrictMode>,
)
