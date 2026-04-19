import {
  AdminPanelSettingsOutlined,
  Inventory2,
  PrecisionManufacturing,
  SettingsSuggest,
  StoreMallDirectory,
} from '@mui/icons-material';
import type { ElementType } from 'react';

export interface MenuItem {
  name?: string;
  module?: string;
  link?: string;
  icon: ElementType;
  children?: MenuItem[];
}

const MenuItems: MenuItem[] = [
  { name: "Dashboard", icon: AdminPanelSettingsOutlined, link: "/"},
  { name: "Prveedores", icon: PrecisionManufacturing, link: "/proveedores"},
  { module: "inventario", name: "Inventario", icon: Inventory2, children: [
    { name: "Productos", link: "/inventario/productos", icon: AdminPanelSettingsOutlined },
    { name: "Categorías", link: "/categorias", icon: AdminPanelSettingsOutlined },
  ]},
  { name: "Sucursales", icon: StoreMallDirectory, link: "/sucursales"},
  { module: "configuracion", name: "Configuración", icon: SettingsSuggest, children: [
    { name: "Usuarios", link: "/usuarios", icon: AdminPanelSettingsOutlined },
  ]},
];

export default MenuItems;