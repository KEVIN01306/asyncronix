const fs = require('fs');
const path = require('path');

const filesToUpdate = [
    "src/presentation/layouts/fullLayout/siderbar/components/SidebarFooter.tsx",
    "src/presentation/layouts/fullLayout/navbar/Navbar.tsx",
    "src/modules/productos/presentation/pages/ProductoDetailPage.tsx",
    "src/modules/vehiculos/presentation/pages/VehiculoDetailPage.tsx",
    "src/modules/vehiculos/presentation/pages/VehiculosListPage.tsx",
    "src/modules/productos/presentation/pages/BuscarProductosPage.tsx",
    "src/modules/productos/presentation/pages/components/ProductoVariantesTab.tsx",
    "src/modules/productos/presentation/pages/components/ProductoImagenesTab.tsx",
    "src/modules/vehiculos/presentation/components/VehicleImageUploader.tsx",
    "src/modules/usuarios/presentation/pages/UsuarioDetailPage.tsx",
    "src/modules/negocio/presentation/pages/NegocioDetailPage.tsx",
    "src/modules/negocio/presentation/pages/NegocioEditPage.tsx",
    "src/modules/perfil/presentation/pages/PerfilPage.tsx",
    "src/modules/perfil/presentation/components/EditAvatarModal.tsx",
    "src/modules/serviciosVehiculos/presentation/pages/ServicioVehiculoDetailPage.tsx",
    "src/modules/serviciosVehiculos/presentation/components/ServiceSignatures.tsx",
    "src/modules/serviciosVehiculos/presentation/components/ServiceImages.tsx",
    "src/modules/serviciosVehiculos/presentation/components/ServiceProgressImages.tsx",
    "src/modules/serviciosVehiculos/presentation/pages/ServicioVehiculoSalidaPage.tsx",
    "src/modules/serviciosVehiculos/presentation/pages/ServicioVehiculoHojaPage.tsx"
];

const srcDir = path.join(__dirname, 'src');
const formatImagePath = path.join(srcDir, 'core/utils/formatImage');

for (const file of filesToUpdate) {
    const fullPath = path.join(__dirname, file);
    if (!fs.existsSync(fullPath)) continue;
    
    let content = fs.readFileSync(fullPath, 'utf8');
    
    const fileDir = path.dirname(fullPath);
    let relativePath = path.relative(fileDir, formatImagePath);
    if (!relativePath.startsWith('.')) {
        relativePath = './' + relativePath;
    }
    
    // Some TS environments prefer omitting .ts/.tsx extensions or keeping them if bundler is used
    // Let's replace the import statement
    const badImport = "import { formatImage } from '@core/utils/formatImage';";
    const goodImport = `import { formatImage } from '${relativePath}';`;
    
    if (content.includes(badImport)) {
        content = content.replace(badImport, goodImport);
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Fixed import in ${file} -> ${goodImport}`);
    }
}
