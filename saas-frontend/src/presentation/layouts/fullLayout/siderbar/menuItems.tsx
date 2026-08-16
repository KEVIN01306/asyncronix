import {
  // Global / Home
  DashboardOutlined,
  PointOfSaleOutlined,
  PeopleAltOutlined,

  // Finanzas & Reportes
  AccountBalanceOutlined,
  PriceChangeOutlined,
  AccountBalanceWalletOutlined,
  CategoryOutlined,
  SwapHorizOutlined,
  AssessmentOutlined,
  BarChartOutlined,

  // Traslados e Inventario
  LocalShippingOutlined,
  InputOutlined,
  OutputOutlined,
  Inventory2Outlined,
  QrCodeScannerOutlined,
  BadgeOutlined,
  LayersOutlined,

  // Vehículos & Recepción
  DirectionsCarOutlined,
  BrandingWatermarkOutlined,
  AltRouteOutlined,
  SpeedOutlined,
  CalendarTodayOutlined,
  BuildCircleOutlined,
  HandymanOutlined,

  // Configuración de Servicios
  SettingsApplicationsOutlined,
  ConstructionOutlined,
  FactCheckOutlined,

  // Configuración Negocio
  SettingsOutlined,
  ManageAccountsOutlined,
  AdminPanelSettingsOutlined,
  StorefrontOutlined,
  BusinessOutlined,
  Receipt,
} from '@mui/icons-material';
import type { ElementType } from 'react';

export interface MenuItem {
  name?: string;
  module?: string;
  group?: string;
  link?: string;
  icon?: ElementType;
  permiso?: string;
  children?: MenuItem[];
}

const MenuItems: MenuItem[] = [
  { group: "Home" },
  { name: "Dashboard", icon: DashboardOutlined, link: "/" },

  { group: "Enlaces rapidos" },
  { name: "Ventas", icon: PointOfSaleOutlined, link: "/ventas", permiso: "VER_VENTAS" },
  { name: "Cotizador", icon: Receipt, link: "/cotizaciones", permiso: "VER_COTIZACIONES" },
  { name: "Clientes", icon: PeopleAltOutlined, link: "/clientes", permiso: "VER_CLIENTES" },

  { group: "modulos" },
  {
    module: "Finanzas",
    name: "Finanzas",
    icon: AccountBalanceOutlined,
    children: [
      { name: "Cajas", link: "/cajas", icon: AccountBalanceWalletOutlined, permiso: "VER_CAJAS" },
      { name: "Cuentas bancarias", link: "/cuentas-bancarias", icon: AccountBalanceOutlined, permiso: "VER_CUENTA_BANCARIA" },
      { name: "Categorías de transacción", link: "/categorias-transaccion", icon: CategoryOutlined, permiso: "VER_CATEGORIAS_TRANSACCION" },
      { name: "Ingresos y Egresos", link: "/ingresos-egresos", icon: PriceChangeOutlined, permiso: "VER_INGRESOS_EGRESOS" },
      { name: "Movimientos Internos", link: "/movimientos-internos", icon: SwapHorizOutlined, permiso: "VER_MOVIMIENTOS" },
    ]
  },
  {
    module: "Reportes",
    name: "Reportes",
    icon: AssessmentOutlined,
    children: [
      { name: "Reporte Financiero", link: "/reportes/financiero", icon: BarChartOutlined, permiso: "REPORTES_FINANCIERO" },
    ]
  },
  {
    module: "traslados",
    name: "Traslados",
    icon: LocalShippingOutlined,
    children: [
      { name: "Salidas", link: "/traslados/salidas", icon: OutputOutlined, permiso: "VER_TRASLADO" },
      { name: "Entradas", link: "/traslados/entradas", icon: InputOutlined, permiso: "VER_TRASLADO" },
    ]
  },
  {
    module: "inventario",
    name: "Inventario",
    icon: Inventory2Outlined,
    children: [
      { name: "Buscar productos", link: "/productos/scanner", icon: QrCodeScannerOutlined, permiso: "BUSCAR_PRODUCTOS" },
      { name: "Proveedores", link: "/proveedores", icon: BadgeOutlined, permiso: "VER_PROVEEDORES" },
      { name: "Categorías", link: "/categorias", icon: CategoryOutlined, permiso: "VER_CATEGORIAS_PRODUCTOS" },
      { name: "Productos", link: "/productos", icon: Inventory2Outlined, permiso: "VER_PRODUCTOS" },
      { name: "Lotes", link: "/lotes", icon: LayersOutlined, permiso: "VER_LOTES" },
    ]
  },
  {
    module: "Vehiculos Configuración",
    name: "Vehículos Config.",
    icon: DirectionsCarOutlined,
    children: [
      { name: "Vehiculos", link: "/vehiculos", icon: DirectionsCarOutlined, permiso: "VER_VEHICULOS" },
      { name: "Marcas", link: "/marcas", icon: BrandingWatermarkOutlined, permiso: "VER_MARCAS" },
      { name: "Líneas", link: "/lineas", icon: AltRouteOutlined, permiso: "VER_LINEAS" },
      { name: "Cilindradas", link: "/cilindradas", icon: SpeedOutlined, permiso: "VER_CILINDRADAS" },
      { name: "Modelos", link: "/modelos", icon: CalendarTodayOutlined, permiso: "VER_MODELOS" },
    ]
  },
  {
    module: "Recepción",
    name: "Recepción",
    icon: HandymanOutlined,
    children: [
      { name: "Servicios", link: "/servicios-vehiculo", icon: BuildCircleOutlined, permiso: "VER_SERVICIOS" },
    ]
  },
  {
    module: "Servicio Vehiculos Configuración",
    name: "Servicios Config.",
    icon: SettingsApplicationsOutlined,
    children: [
      { name: "Opciones servicio", link: "/opciones-servicio", icon: ConstructionOutlined, permiso: "VER_OPCION_SERVICIO" },
      { name: "Tipos servicio", link: "/tipos-servicio", icon: HandymanOutlined, permiso: "VER_TIPO_SERVICIO" },
      { name: "Checklist", link: "/checklist", icon: FactCheckOutlined, permiso: "VER_CHECKLIST" },
    ]
  },
  { group: "Configuración negocio" },
  {
    module: "configuracion",
    name: "Configuración",
    icon: SettingsOutlined,
    children: [
      { name: "Usuarios", link: "/usuarios", icon: ManageAccountsOutlined, permiso: "VER_USUARIOS" },
      { name: "Roles", link: "/roles", icon: AdminPanelSettingsOutlined, permiso: "VER_ROLES" },
      { name: "Mi Sucursal", link: "/sucursal/me", icon: StorefrontOutlined, permiso: "VER_SUCURSALES_DETALLE" },
      { name: "Sucursales", link: "/sucursales", icon: BusinessOutlined, permiso: "VER_SUCURSALES" },
      { name: "Negocio", link: "/negocio", icon: BusinessOutlined, permiso: "VER_NEGOCIOS_DETALLE_ME" },
    ]
  },
];

export default MenuItems;