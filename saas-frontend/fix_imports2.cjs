const fs = require('fs');
const path = require('path');

const filesToUpdate = [
    "src/modules/productos/presentation/pages/ProductoDetailPage.tsx",
    "src/modules/productos/presentation/pages/BuscarProductosPage.tsx",
    "src/modules/productos/presentation/pages/components/ProductoVariantesTab.tsx",
    "src/modules/negocio/presentation/pages/NegocioDetailPage.tsx",
    "src/modules/negocio/presentation/pages/NegocioEditPage.tsx"
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
    
    const badImport = "import { formatImage } from '@core/utils/formatImage';";
    const goodImport = `import { formatImage } from '${relativePath}';`;
    
    if (content.includes(badImport)) {
        content = content.replace(badImport, goodImport);
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Fixed import in ${file} -> ${goodImport}`);
    } else {
        console.log(`Did not find bad import in ${file}`);
    }
}
