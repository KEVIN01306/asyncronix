const fs = require('fs');
const path = require('path');

// 1. vehiculo.module.ts missing import of reemplazarMediaUseCase?
let file = path.join(__dirname, 'src/modules/vehiculo/vehiculo.module.ts');
let content = fs.readFileSync(file, 'utf8');
if (!content.includes('reemplazarMediaUseCase')) {
    content = content.replace(
        'import { storageProvider } from "@shared/infrastructure/storage/storage.module.js";',
        'import { storageProvider } from "@shared/infrastructure/storage/storage.module.js";\nimport { reemplazarMediaUseCase } from "../media/media.module.js";'
    );
} else if (content.match(/reemplazarMediaUseCase/g).length === 2) {
    // Only used in instantiation but not imported
    content = content.replace(
        'import { storageProvider } from "@shared/infrastructure/storage/storage.module.js";',
        'import { storageProvider } from "@shared/infrastructure/storage/storage.module.js";\nimport { reemplazarMediaUseCase } from "../media/media.module.js";'
    );
}
fs.writeFileSync(file, content, 'utf8');


// 2. servicio.module.ts missing import of crearMediaUseCase and fixing the constructor arguments!
file = path.join(__dirname, 'src/modules/servicioVehiculo/servicio.module.ts');
content = fs.readFileSync(file, 'utf8');
if (!content.includes('crearMediaUseCase')) {
    content = content.replace(
        'import { storageProvider } from "@shared/infrastructure/storage/storage.module.js";',
        'import { storageProvider } from "@shared/infrastructure/storage/storage.module.js";\nimport { crearMediaUseCase } from "../media/media.module.js";'
    );
} else if (content.match(/crearMediaUseCase/g).length === 2) {
    content = content.replace(
        'import { storageProvider } from "@shared/infrastructure/storage/storage.module.js";',
        'import { storageProvider } from "@shared/infrastructure/storage/storage.module.js";\nimport { crearMediaUseCase } from "../media/media.module.js";'
    );
}
// Fixing the constructor arguments because it seems they didn't replace correctly in the previous script!
content = content.replace('new SubirImagenServicioUseCase(servicioRepository, storageProvider);', 'new SubirImagenServicioUseCase(servicioRepository, crearMediaUseCase);');
content = content.replace('new SubirImagenProgresoServicioUseCase(progresoRepository, storageProvider);', 'new SubirImagenProgresoServicioUseCase(progresoRepository, crearMediaUseCase);');
content = content.replace('new SubirImagenServicioUseCase(servicioVehiculoRepository, storageProvider);', 'new SubirImagenServicioUseCase(servicioVehiculoRepository, crearMediaUseCase);');
content = content.replace('new SubirImagenProgresoServicioUseCase(progresoServicioRepository, storageProvider);', 'new SubirImagenProgresoServicioUseCase(progresoServicioRepository, crearMediaUseCase);');
fs.writeFileSync(file, content, 'utf8');
