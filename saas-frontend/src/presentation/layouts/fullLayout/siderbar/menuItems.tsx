import {
  AdminPanelSettingsOutlined,
  Inventory2,
  SettingsSuggest,
  StoreMallDirectory,
  BusinessCenterOutlined,
  AccountCircleOutlined,
  CarCrash,
  Build,
  PrecisionManufacturing,
  ListAlt,
  SettingsSharp,
  ViewHeadlineRounded,
  MoveDownRounded,
  QrCodeScanner,
} from '@mui/icons-material';
import type { ElementType } from 'react';

export interface MenuItem {
  name?: string;
  module?: string;
  link?: string;
  icon: ElementType;
  permiso?: string;
  children?: MenuItem[];
}

const MenuItems: MenuItem[] = [
  { name: "Dashboard", icon: AdminPanelSettingsOutlined, link: "/" },
  { name: "Ventas", icon: BusinessCenterOutlined, link: "/ventas", permiso: "VER_VENTAS" },
  { name: "Clientes", icon: AccountCircleOutlined, link: "/clientes", permiso: "VER_CLIENTES" },
  { 
    module: "traslados", name: "Traslados", icon: MoveDownRounded, children: [
      { name: "Salidas", link: "/traslados/salidas", icon: ViewHeadlineRounded, permiso: "VER_TRASLADO" },
      { name: "Entradas", link: "/traslados/entradas", icon: ViewHeadlineRounded, permiso: "VER_TRASLADO" },
    ]
  },
  {
    module: "inventario", name: "Inventario", icon: Inventory2, children: [
      { name: "Buscar productos", link: "/productos/scanner", icon: QrCodeScanner, permiso: "BUSCAR_PRODUCTOS" },
      { name: "Proveedores", icon: ViewHeadlineRounded, link: "/proveedores", permiso: "VER_PROVEEDORES" },
      { name: "Categorías", link: "/categorias", icon: AdminPanelSettingsOutlined, permiso: "VER_CATEGORIAS_PRODUCTOS" },
      { name: "Productos", link: "/productos", icon: AdminPanelSettingsOutlined, permiso: "VER_PRODUCTOS" },
      { name: "Lotes", link: "/lotes", icon: AdminPanelSettingsOutlined, permiso: "VER_LOTES" },
    ]
  },
  { module: "Vehiculos Configuración", icon: CarCrash, children: [
    { name: "Vehiculos", link: "/vehiculos", icon: AdminPanelSettingsOutlined, permiso: "VER_VEHICULOS" },
    { name: "Marcas", link: "/marcas", icon: AdminPanelSettingsOutlined, permiso: "VER_MARCAS" },
    { name: "Líneas", link: "/lineas", icon: AdminPanelSettingsOutlined, permiso: "VER_LINEAS" },
    { name: "Cilindradas", link: "/cilindradas", icon: AdminPanelSettingsOutlined, permiso: "VER_CILINDRADAS" },
    { name: "Modelos", link: "/modelos", icon: AdminPanelSettingsOutlined, permiso: "VER_MODELOS" },
  ]},
  { module: "Recepción", icon: Build, children: [
    { name: "Servicios", link: "/servicios-vehiculo", icon: Build, permiso: "VER_SERVICIOS" },
  ]}, 
    { module: "Servicio Vehiculos Configuración", icon: SettingsSharp, children: [
    { name: "Opciones servicio", link: "/opciones-servicio", icon: Build, permiso: "VER_OPCION_SERVICIO" },
    { name: "Tipos servicio", link: "/tipos-servicio", icon: PrecisionManufacturing, permiso: "VER_TIPO_SERVICIO" },
    { name: "Checklist", link: "/checklist", icon: ListAlt, permiso: "VER_CHECKLIST" },
  ]}, 
  {
    module: "configuracion", name: "Configuración", icon: SettingsSuggest, children: [
      { name: "Usuarios", link: "/usuarios", icon: AdminPanelSettingsOutlined, permiso: "VER_USUARIOS" },
      { name: "Roles", link: "/roles", icon: AdminPanelSettingsOutlined, permiso: "VER_ROLES" },
      { name: "Sucursales", link: "/sucursales", icon: StoreMallDirectory, permiso: "VER_SUCURSALES" },
      { name: "Negocio", link: "/negocio", icon: AdminPanelSettingsOutlined, permiso: "VER_NEGOCIOS_DETALLE_ME" },
    ]
  },
];

export default MenuItems;