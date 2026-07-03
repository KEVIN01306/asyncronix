// Componentes
export { CategoriaAutocomplete } from './presentation/components/CategoriaAutocomplete';
export { CategoriaJerarquiaChips, CategoriaJerarquiaTexto } from './presentation/components/CategoriaJerarquiaDisplay';

// Hooks
export { useJerarquiaTexto, usePadreInmediato, useRutaCategoria } from './presentation/hooks/useJerarquiaTexto';
export { usePadresDisponibles } from './presentation/hooks/usePadresDisponibles';

// Types
export type { 
    Categoria, 
    CategoriaPadre, 
    CategoriaConJerarquiaCompleta,
    CategoriaJerarquia
} from './domain/interfaces/categoria.interface';
