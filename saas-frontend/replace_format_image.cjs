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

for (const file of filesToUpdate) {
    const fullPath = path.join(__dirname, file);
    if (!fs.existsSync(fullPath)) {
        console.warn(`File not found: ${fullPath}`);
        continue;
    }
    
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Replace `${import.meta.env.VITE_API_URL}/${var}` with formatImage(var)
    // The regex matches `${import.meta.env.VITE_API_URL\s*}/\${([^}]+)}` (with backticks around it)
    const regex = /`\$\{import\.meta\.env\.VITE_API_URL\s*\}\/\$\{([^}]+)\}`/g;
    
    let modified = false;
    if (regex.test(content)) {
        content = content.replace(regex, 'formatImage($1)');
        modified = true;
    }
    
    // Add import statement if modified and not already imported
    if (modified && !content.includes("formatImage")) {
        // Find the last import statement to add ours after it
        const importRegex = /import .* from ['"].*['"];?\n/g;
        let match;
        let lastImportIndex = 0;
        while ((match = importRegex.exec(content)) !== null) {
            lastImportIndex = match.index + match[0].length;
        }
        
        const importStmt = "import { formatImage } from '@core/utils/formatImage';\n";
        content = content.slice(0, lastImportIndex) + importStmt + content.slice(lastImportIndex);
    } else if (modified) {
        // Even if it includes formatImage (because we just replaced it), we need to check if it's imported
        if (!content.includes("import { formatImage }")) {
            const importStmt = "import { formatImage } from '@core/utils/formatImage';\n";
            // Find last import
            const importLines = content.split('\n').filter(l => l.trim().startsWith('import '));
            if (importLines.length > 0) {
                const lastImport = importLines[importLines.length - 1];
                content = content.replace(lastImport, lastImport + '\n' + importStmt);
            } else {
                content = importStmt + content;
            }
        }
    }
    
    if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${file}`);
    }
}
