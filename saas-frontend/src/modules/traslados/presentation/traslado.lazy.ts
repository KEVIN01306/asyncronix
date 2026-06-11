import { lazy } from 'react';

export const TrasladosSalidaLazy = lazy(() =>
    import('./pages/TrasladosSalidaPage').then(m => ({ default: m.TrasladosSalidaPage }))
);

export const TrasladosEntradaLazy = lazy(() =>
    import('./pages/TrasladosEntradaPage').then(m => ({ default: m.TrasladosEntradaPage }))
);

export const TrasladoFormLazy = lazy(() =>
    import('./pages/TrasladoFormPage').then(m => ({ default: m.TrasladoFormPage }))
);

export const TrasladoDetalleLazy = lazy(() =>
    import('./pages/TrasladoDetallePage').then(m => ({ default: m.TrasladoDetallePage }))
);
