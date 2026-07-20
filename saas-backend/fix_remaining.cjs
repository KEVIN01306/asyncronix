const fs = require('fs');
const path = require('path');

// 1. VEHICULO MODULE Fix
let file = path.join(__dirname, 'src/modules/vehiculo/vehiculo.module.ts');
let content = fs.readFileSync(file, 'utf8');
content = content.replace('const subirAvatarVehiculoUseCase = new SubirAvatarVehiculoUseCase(vehiculoRepository, reemplazarMediaUseCase);', 'const subirAvatarUseCase = new SubirAvatarVehiculoUseCase(repository, reemplazarMediaUseCase);');
content = content.replace('const subirCalcomaniaVehiculoUseCase = new SubirCalcomaniaVehiculoUseCase(vehiculoRepository, reemplazarMediaUseCase);', 'const subirCalcomaniaUseCase = new SubirCalcomaniaVehiculoUseCase(repository, reemplazarMediaUseCase);');
fs.writeFileSync(file, content, 'utf8');

// 2. SERVICIO VEHICULO MODULE Fix
file = path.join(__dirname, 'src/modules/servicioVehiculo/servicio.module.ts');
content = fs.readFileSync(file, 'utf8');
content = content.replace('new SubirImagenServicioUseCase(servicioRepository, storageProvider);', 'new SubirImagenServicioUseCase(servicioRepository, crearMediaUseCase);');
content = content.replace('new SubirImagenProgresoServicioUseCase(progresoRepository, storageProvider);', 'new SubirImagenProgresoServicioUseCase(progresoRepository, crearMediaUseCase);');
fs.writeFileSync(file, content, 'utf8');

// 3. PRODUCTO MODULE Fix expected 2 arguments
file = path.join(__dirname, 'src/modules/producto/producto.module.ts');
content = fs.readFileSync(file, 'utf8');
// The module actually had `new SubirImagenProductoUseCase(productoRepository, crearMediaUseCase);` which is correct! The error was from something else?
// Wait, the error was "Expected 2 arguments, but got 1" at src/modules/producto/producto.module.ts(36,33).
// Let's look at what's at line 36.
