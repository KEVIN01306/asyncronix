const fs = require('fs');
const path = require('path');

const files = [
    "src/modules/negocio/presentation/pages/NegocioEditPage.tsx",
    "src/modules/perfil/presentation/components/EditAvatarModal.tsx",
    "src/modules/serviciosVehiculos/presentation/components/ServiceImages.tsx",
    "src/modules/serviciosVehiculos/presentation/components/ServiceProgressImages.tsx",
    "src/modules/vehiculos/presentation/pages/VehiculoDetailPage.tsx"
];

for (const file of files) {
    const fullPath = path.join(__dirname, file);
    if (!fs.existsSync(fullPath)) continue;
    
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // In NegocioEditPage and EditAvatarModal:
    // formatImage(...) -> formatImage(...) ?? null
    content = content.replace(/setLogoPreview\((negocio\.logo_url \? formatImage\(negocio\.logo_url\) : null)\);/, 
        "setLogoPreview(negocio.logo_url ? (formatImage(negocio.logo_url) ?? null) : null);");
        
    content = content.replace(/setPreview\((initialUrl \? formatImage\(initialUrl\) : null)\);/, 
        "setPreview(initialUrl ? (formatImage(initialUrl) ?? null) : null);");
        
    // ServiceImages and ServiceProgressImages
    content = content.replace(/setPreviewUrl\(formatImage\(imagen\.url\)\);/g, "setPreviewUrl(formatImage(imagen.url) ?? null);");
    
    // VehiculoDetailPage
    content = content.replace(/fetch\(formatImage\(vehiculo\.calcomania_url\)\)/, "fetch(formatImage(vehiculo.calcomania_url)!)");
    
    fs.writeFileSync(fullPath, content, 'utf8');
}
