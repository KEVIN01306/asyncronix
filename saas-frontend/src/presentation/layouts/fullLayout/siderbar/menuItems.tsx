import {
  AdminPanelSettingsOutlined,
  Inventory2,
  SettingsSuggest,
  StoreMallDirectory,
  BusinessCenterOutlined,
  AccountCircleOutlined,
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
  {
    module: "inventario", name: "Inventario", icon: Inventory2, children: [
      { name: "Categorías", link: "/categorias", icon: AdminPanelSettingsOutlined, permiso: "VER_CATEGORIAS_PRODUCTOS" },
      { name: "Productos", link: "/productos", icon: AdminPanelSettingsOutlined, permiso: "VER_PRODUCTOS" },
      { name: "Lotes", link: "/lotes", icon: AdminPanelSettingsOutlined, permiso: "VER_LOTES" },
    ]
  },
  { name: "Ventas", icon: BusinessCenterOutlined, link: "/ventas", permiso: "VER_VENTAS" },
  { name: "Clientes", icon: AccountCircleOutlined, link: "/clientes", permiso: "VER_CLIENTES" },
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