export type SearchEntry = {
  label: string;
  path?: string;
  type: 'module' | 'action' | 'group' | 'theme' | 'custom';
  permiso?: string;
  module?: string;
  locationText?: string;
  synonyms?: string[];
  keywords?: string[];
};

const manualEntries: SearchEntry[] = [
  {
    label: 'Personalización',
    path: '/custom',
    type: 'theme',
    locationText: 'Ajustes > Personalización',
    synonyms: ['personalizacion', 'customization', 'settings', 'configuracion'],
    keywords: ['personalización', 'personalizacion', 'customization', 'settings', 'configuracion'],
  },
  {
    label: 'Atributos',
    path: '/productos',
    type: 'action',
    locationText: 'Productos > Atributos',
    permiso: 'VER_ATRIBUTOS',
    synonyms: ['atributo', 'attributes'],
    keywords: ['atributos', 'atributo', 'attributes', 'productos', 'products', 'catalogo'],
  },
  {
    label: 'Dashboard',
    path: '/',
    type: 'action',
    locationText: 'Home > Dashboard',
    synonyms: ['dashboard', 'inicio', 'home'],
    keywords: ['dashboard', 'inicio', 'home', 'panel', 'home'],
  },
  {
    label: 'Ventas',
    path: '/ventas',
    type: 'action',
    locationText: 'Enlaces rapidos > Ventas',
    permiso: 'VER_VENTAS',
    synonyms: ['venta', 'sales'],
    keywords: ['ventas', 'venta', 'sales', 'enlaces rapidos', 'sales'],
  },
  {
    label: 'Ventas',
    path: '/ventas',
    type: 'action',
    locationText: 'Enlaces rapidos > Ventas > Nueva venta',
    permiso: 'VER_VENTAS',
    synonyms: ['venta', 'sales'],
    keywords: ['ventas', 'venta', 'sales', 'enlaces rapidos', 'sales', 'nueva venta', 'new sale', 'crear venta', 'create sale'],
  },
  {
    label: 'Pin Caja',
    path: '/perfil',
    type: 'action',
    locationText: 'Perfil > Cambiar Pin de Caja',
    permiso: 'VENTAS_FORZAR_STOCK',
    synonyms: ['pin', 'caja', 'password','box','contraseña'],
    keywords: ['pin', 'caja', 'password', 'contraseña', 'perfil', 'cambiar pin', 'cambiar pin de caja', 'change pin', 'change password'],
  },
  {
    label: 'Clientes',
    path: '/clientes',
    type: 'action',
    locationText: 'Enlaces rapidos > Clientes',
    permiso: 'VER_CLIENTES',
    synonyms: ['cliente', 'customers', 'clients'],
    keywords: ['clientes', 'cliente', 'customers', 'clients', 'enlaces rapidos'],
  },
  {
    label: 'Salidas',
    path: '/traslados/salidas',
    type: 'action',
    module: 'traslados',
    locationText: 'Traslados > Salidas',
    permiso: 'VER_TRASLADO',
    synonyms: ['salida', 'transferencias', 'transfers'],
    keywords: ['salidas', 'salida', 'traslados', 'transferencias', 'transfers', 'movimientos'],
  },
  {
    label: 'Entradas',
    path: '/traslados/entradas',
    type: 'action',
    module: 'traslados',
    locationText: 'Traslados > Entradas',
    permiso: 'VER_TRASLADO',
    synonyms: ['entrada', 'recepciones', 'receipts'],
    keywords: ['entradas', 'entrada', 'traslados', 'recepciones', 'receipts', 'movimientos'],
  },
  {
    label: 'Buscar productos',
    path: '/productos/scanner',
    type: 'action',
    module: 'inventario',
    locationText: 'Inventario > Buscar productos',
    permiso: 'BUSCAR_PRODUCTOS',
    synonyms: ['scanner', 'buscar producto', 'buscar productos', 'qr'],
    keywords: ['buscar productos', 'scanner', 'qr', 'inventario', 'productos', 'buscar'],
  },
  {
    label: 'Proveedores',
    path: '/proveedores',
    type: 'action',
    module: 'inventario',
    locationText: 'Inventario > Proveedores',
    permiso: 'VER_PROVEEDORES',
    synonyms: ['proveedor', 'suppliers'],
    keywords: ['proveedores', 'proveedor', 'suppliers', 'inventario', 'compras'],
  },
  {
    label: 'Categorías',
    path: '/categorias',
    type: 'action',
    module: 'inventario',
    locationText: 'Inventario > Categorías',
    permiso: 'VER_CATEGORIAS_PRODUCTOS',
    synonyms: ['categoria', 'categories'],
    keywords: ['categorías', 'categorias', 'categoria', 'categories', 'inventario', 'productos'],
  },
  {
    label: 'Productos',
    path: '/productos',
    type: 'action',
    module: 'inventario',
    locationText: 'Inventario > Productos',
    permiso: 'VER_PRODUCTOS',
    synonyms: ['producto', 'products'],
    keywords: ['productos', 'producto', 'products', 'inventario', 'catalogo'],
  },
  {
    label: 'Lotes',
    path: '/lotes',
    type: 'action',
    module: 'inventario',
    locationText: 'Inventario > Lotes',
    permiso: 'VER_LOTES',
    synonyms: ['lote', 'batches'],
    keywords: ['lotes', 'lote', 'batches', 'inventario', 'productos'],
  },
  {
    label: 'Vehiculos',
    path: '/vehiculos',
    type: 'action',
    module: 'Vehiculos Configuración',
    locationText: 'Vehiculos Configuración > Vehiculos',
    permiso: 'VER_VEHICULOS',
    synonyms: ['vehiculo', 'vehicles', 'autos'],
    keywords: ['vehiculos', 'vehiculo', 'vehicles', 'autos', 'configuracion'],
  },
  {
    label: 'Marcas',
    path: '/marcas',
    type: 'action',
    module: 'Vehiculos Configuración',
    locationText: 'Vehiculos Configuración > Marcas',
    permiso: 'VER_MARCAS',
    synonyms: ['marca', 'brands'],
    keywords: ['marcas', 'marca', 'brands', 'vehiculos', 'configuracion'],
  },
  {
    label: 'Líneas',
    path: '/lineas',
    type: 'action',
    module: 'Vehiculos Configuración',
    locationText: 'Vehiculos Configuración > Líneas',
    permiso: 'VER_LINEAS',
    synonyms: ['línea', 'lines'],
    keywords: ['líneas', 'lineas', 'línea', 'lines', 'vehiculos', 'configuracion'],
  },
  {
    label: 'Cilindradas',
    path: '/cilindradas',
    type: 'action',
    module: 'Vehiculos Configuración',
    locationText: 'Vehiculos Configuración > Cilindradas',
    permiso: 'VER_CILINDRADAS',
    synonyms: ['cilindrada', 'engine capacity'],
    keywords: ['cilindradas', 'cilindrada', 'engine capacity', 'vehiculos', 'configuracion'],
  },
  {
    label: 'Modelos',
    path: '/modelos',
    type: 'action',
    module: 'Vehiculos Configuración',
    locationText: 'Vehiculos Configuración > Modelos',
    permiso: 'VER_MODELOS',
    synonyms: ['modelo', 'models'],
    keywords: ['modelos', 'modelo', 'models', 'vehiculos', 'configuracion'],
  },
  {
    label: 'Servicios',
    path: '/servicios-vehiculo',
    type: 'action',
    module: 'Recepción',
    locationText: 'Recepción > Servicios',
    permiso: 'VER_SERVICIOS',
    synonyms: ['servicio', 'services'],
    keywords: ['servicios', 'servicio', 'services', 'recepción', 'recepcion'],
  },
  {
    label: 'Opciones servicio',
    path: '/opciones-servicio',
    type: 'action',
    module: 'Servicio Vehiculos Configuración',
    locationText: 'Servicio Vehiculos Configuración > Opciones servicio',
    permiso: 'VER_OPCION_SERVICIO',
    synonyms: ['opción servicio', 'service options'],
    keywords: ['opciones servicio', 'opción servicio', 'service options', 'servicio', 'configuracion'],
  },
  {
    label: 'Tipos servicio',
    path: '/tipos-servicio',
    type: 'action',
    module: 'Servicio Vehiculos Configuración',
    locationText: 'Servicio Vehiculos Configuración > Tipos servicio',
    permiso: 'VER_TIPO_SERVICIO',
    synonyms: ['tipo servicio', 'service types'],
    keywords: ['tipos servicio', 'tipo servicio', 'service types', 'servicio', 'configuracion'],
  },
  {
    label: 'Checklist',
    path: '/checklist',
    type: 'action',
    module: 'Servicio Vehiculos Configuración',
    locationText: 'Servicio Vehiculos Configuración > Checklist',
    permiso: 'VER_CHECKLIST',
    synonyms: ['check list', 'lista de verificación'],
    keywords: ['checklist', 'check list', 'lista de verificación', 'servicio', 'configuracion'],
  },
  {
    label: 'Usuarios',
    path: '/usuarios',
    type: 'action',
    module: 'Configuración',
    locationText: 'Configuración negocio > Usuarios',
    permiso: 'VER_USUARIOS',
    synonyms: ['usuario', 'users'],
    keywords: ['usuarios', 'usuario', 'users', 'configuración', 'negocio'],
  },
  {
    label: 'Roles',
    path: '/roles',
    type: 'action',
    module: 'Configuración',
    locationText: 'Configuración negocio > Roles',
    permiso: 'VER_ROLES',
    synonyms: ['rol', 'roles', 'roles usuario'],
    keywords: ['roles', 'rol', 'roles usuario', 'configuración', 'negocio'],
  },
  {
    label: 'Sucursales',
    path: '/sucursales',
    type: 'action',
    module: 'Configuración',
    locationText: 'Configuración negocio > Sucursales',
    permiso: 'VER_SUCURSALES',
    synonyms: ['sucursal', 'branches'],
    keywords: ['sucursales', 'sucursal', 'branches', 'configuración', 'negocio'],
  },
  {
    label: 'Negocio',
    path: '/negocio',
    type: 'action',
    module: 'Configuración',
    locationText: 'Configuración negocio > Negocio',
    permiso: 'VER_NEGOCIOS_DETALLE_ME',
    synonyms: ['empresa', 'business'],
    keywords: ['negocio', 'empresa', 'business', 'configuración'],
  },
  {
    label: 'Alerts',
    path: '/custom#alerts',
    type: 'custom',
    locationText: 'Personalización',
    synonyms: ['alertas', 'alerts', 'notificaciones'],
    keywords: ['alerts', 'alertas', 'notificaciones', 'personalización', 'settings'],
  },
  {
    label: 'Perfil',
    path: '/perfil',
    type: 'action',
    locationText: 'Mi Cuenta > Perfil',
    synonyms: ['profile', 'mi perfil', 'account', 'cuenta'],
    keywords: ['perfil', 'mi perfil', 'profile', 'account', 'cuenta', 'usuario', 'usuario perfil'],
  },
  {
    label: 'Editar Perfil',
    path: '/perfil#edit',
    type: 'action',
    locationText: 'Mi Cuenta > Editar Perfil',
    synonyms: ['edit profile', 'editar', 'cambiar perfil', 'modificar perfil'],
    keywords: ['editar perfil', 'edit profile', 'editar', 'cambiar perfil', 'modificar perfil', 'perfil'],
  },
  {
    label: 'Cambiar Contraseña',
    path: '/perfil#password',
    type: 'action',
    locationText: 'Mi Cuenta > Cambiar Contraseña',
    synonyms: ['change password', 'password', 'contraseña', 'cambiar clave', 'modificar contraseña'],
    keywords: ['cambiar contraseña', 'password', 'contraseña', 'change password', 'cambiar clave', 'modificar contraseña'],
  },
  {
    label: 'Avatar',
    path: '/perfil#avatar',
    type: 'action',
    locationText: 'Mi Cuenta > Avatar',
    synonyms: ['foto de perfil', 'profile picture', 'foto', 'imagen', 'picture'],
    keywords: ['avatar', 'foto de perfil', 'profile picture', 'foto', 'imagen', 'picture', 'perfil'],
  },
];

const normalizeText = (text?: string) =>
  text
    ? text
        .toString()
        .trim()
        .replace(/[#/ -]/g, ' ')
        .replace(/\s+/g, ' ')
        .toLowerCase()
    : '';

const buildKeywords = (entry: {
  label: string;
  module?: string;
  locationText?: string;
  path?: string;
  synonyms?: string[];
  extra?: string[];
}) => {
  const tokens = new Set<string>();
  const add = (value?: string | string[]) => {
    if (!value) return;
    if (Array.isArray(value)) {
      value.forEach((v) => v && tokens.add(normalizeText(v)));
      return;
    }
    normalizeText(value)
      .split(' ')
      .filter(Boolean)
      .forEach((word) => tokens.add(word));
    const full = normalizeText(value);
    if (full) tokens.add(full);
  };

  add(entry.label);
  add(entry.module);
  add(entry.locationText);
  add(entry.path);
  add(entry.synonyms);
  add(entry.extra);

  // add route segments as keywords
  if (entry.path) {
    entry.path
      .split(/[#/ -]+/)
      .filter(Boolean)
      .map(normalizeText)
      .forEach((segment) => tokens.add(segment));
  }

  return Array.from(tokens).filter(Boolean);
};

export function buildSearchIndex(): SearchEntry[] {
  return manualEntries.map((m) => ({
    ...m,
    keywords:
      m.keywords ??
      buildKeywords({
        label: m.label,
        module: m.module,
        locationText: m.locationText,
        path: m.path,
        synonyms: m.synonyms,
      }),
  }));
}
