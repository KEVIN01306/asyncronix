//import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import { RouterProvider } from 'react-router-dom'
import appRouter from './presentation/routers/appRouter'
import { Toaster } from 'sonner'
import activarNotificaciones from './core/notificaciones/notificaciones.config'
import { useUiStore } from './core/store/uiStore'
import { createAppTheme } from './core/theme/mainTheme'

const App = () => {
  const themeMode = useUiStore((state) => state.themeMode);
  const borderIntensity = useUiStore((state) => state.borderIntensity);
  const borderColorIntensity = useUiStore((state) => state.borderColorIntensity);
  const toasterPosition = useUiStore((state) => state.toasterPosition);
  const toasterStyle = useUiStore((state) => state.toasterStyle);

  return (
    <ThemeProvider theme={createAppTheme(themeMode, borderIntensity, borderColorIntensity)}>
      <CssBaseline />
      <RouterProvider router={appRouter} />
      <Toaster 
        position={toasterPosition}
        closeButton 
        theme={themeMode}
        richColors={toasterStyle === 'colorful'}
      />
    </ThemeProvider>
  );
};

export default App;

createRoot(document.getElementById('root')!).render(<App />);

activarNotificaciones();
