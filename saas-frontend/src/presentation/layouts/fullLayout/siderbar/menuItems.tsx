import {
  AdminPanelSettingsOutlined,
  Inventory2,
  SettingsSuggest,
  StoreMallDirectory,
  AttachMoney,
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
  { module: "inventario", name: "Inventario", icon: Inventory2, children: [
      { name: "Categorías", link: "/categorias", icon: AdminPanelSettingsOutlined, permiso: "VER_CATEGORIAS_PRODUCTOS" },
      { name: "Productos", link: "/productos", icon: AdminPanelSettingsOutlined, permiso: "VER_PRODUCTOS" },
      { name: "Lotes", link: "/lotes", icon: AdminPanelSettingsOutlined, permiso: "VER_LOTES" },
    ]
  },
  { name: "Ventas", icon: AttachMoney, link: "/ventas", permiso: "VER_VENTAS" },
  { name: "Sucursales", icon: StoreMallDirectory, link: "/sucursales", permiso: "VER_SUCURSALES" },
  { module: "configuracion", name: "Configuración", icon: SettingsSuggest, children: [
      { name: "Usuarios", link: "/usuarios", icon: AdminPanelSettingsOutlined, permiso: "VER_USUARIOS" },
      { name: "Roles", link: "/roles", icon: AdminPanelSettingsOutlined, permiso: "VER_ROLES" },
      { name: "Negocio", link: "/negocio", icon: AdminPanelSettingsOutlined, permiso: "VER_NEGOCIOS_DETALLE_ME"},
    ]
  },
];

export default MenuItems;