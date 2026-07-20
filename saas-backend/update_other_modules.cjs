const fs = require('fs');
const path = require('path');

// 1. VEHICULO - subir-avatar.usecase.ts
let file = path.join(__dirname, 'src/modules/vehiculo/application/subir-avatar.usecase.ts');
if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(
        'import type { IStorageProvider, FileDTO } from "@shared/domain/providers/storage.provider.js";',
        `import type { FileDTO } from "@shared/domain/providers/storage.provider.js";\nimport type { ReemplazarMediaUseCase } from "../../media/application/reemplazar-media.usecase.js";`
    );
    content = content.replace(
        'private readonly storageProvider: IStorageProvider',
        'private readonly reemplazarMediaUseCase: ReemplazarMediaUseCase'
    );
    // inside execute
    const block = `let avatar_url: string;
        if (vehiculo.avatar_url && this.storageProvider.replaceFile) {
            avatar_url = await this.storageProvider.replaceFile(vehiculo.avatar_url, avatarFile, path, 'avatar');
        } else {
            if (vehiculo.avatar_url) await this.storageProvider.deleteFile(vehiculo.avatar_url);
            avatar_url = await this.storageProvider.uploadFile(avatarFile, path, 'avatar');
        }`;
    content = content.replace(block, "const avatar_url = await this.reemplazarMediaUseCase.execute(avatarFile, negocio_id, path, 'avatar', vehiculo.avatar_url ?? undefined);");
    fs.writeFileSync(file, content, 'utf8');
}

// 2. VEHICULO - subir-calcomania.usecase.ts
file = path.join(__dirname, 'src/modules/vehiculo/application/subir-calcomania.usecase.ts');
if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(
        'import type { IStorageProvider, FileDTO } from "@shared/domain/providers/storage.provider.js";',
        `import type { FileDTO } from "@shared/domain/providers/storage.provider.js";\nimport type { ReemplazarMediaUseCase } from "../../media/application/reemplazar-media.usecase.js";`
    );
    content = content.replace(
        'private readonly storageProvider: IStorageProvider',
        'private readonly reemplazarMediaUseCase: ReemplazarMediaUseCase'
    );
    const block = `let calcomania_url: string;
        if (vehiculo.calcomania_url && this.storageProvider.replaceFile) {
            calcomania_url = await this.storageProvider.replaceFile(vehiculo.calcomania_url, calcomaniaFile, path, 'calcomania');
        } else {
            if (vehiculo.calcomania_url) await this.storageProvider.deleteFile(vehiculo.calcomania_url);
            calcomania_url = await this.storageProvider.uploadFile(calcomaniaFile, path, 'calcomania');
        }`;
    content = content.replace(block, "const calcomania_url = await this.reemplazarMediaUseCase.execute(calcomaniaFile, negocio_id, path, 'calcomania', vehiculo.calcomania_url ?? undefined);");
    fs.writeFileSync(file, content, 'utf8');
}

// 3. VEHICULO MODULE
file = path.join(__dirname, 'src/modules/vehiculo/vehiculo.module.ts');
if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(
        'import { storageProvider } from "@shared/infrastructure/storage/storage.module.js";',
        `import { storageProvider } from "@shared/infrastructure/storage/storage.module.js";\nimport { reemplazarMediaUseCase } from "../media/media.module.js";`
    );
    content = content.replace('new SubirAvatarUseCase(vehiculoRepository, storageProvider);', 'new SubirAvatarUseCase(vehiculoRepository, reemplazarMediaUseCase);');
    content = content.replace('new SubirCalcomaniaUseCase(vehiculoRepository, storageProvider);', 'new SubirCalcomaniaUseCase(vehiculoRepository, reemplazarMediaUseCase);');
    fs.writeFileSync(file, content, 'utf8');
}

// 4. SERVICIO VEHICULO - subir-imagen-servicio.usecase.ts
file = path.join(__dirname, 'src/modules/servicioVehiculo/application/subir-imagen-servicio.usecase.ts');
if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(
        'import type { IStorageProvider, FileDTO } from "@shared/domain/providers/storage.provider.js";',
        `import type { FileDTO } from "@shared/domain/providers/storage.provider.js";\nimport type { CrearMediaUseCase } from "../../media/application/crear-media.usecase.js";`
    );
    content = content.replace(
        'private readonly storageProvider: IStorageProvider',
        'private readonly crearMediaUseCase: CrearMediaUseCase'
    );
    content = content.replace(
        'const url = await this.storageProvider.uploadFile(file, path);',
        'const url = await this.crearMediaUseCase.execute(file, negocio_id, path);'
    );
    fs.writeFileSync(file, content, 'utf8');
}

// 5. SERVICIO VEHICULO - subir-imagen-progreso-servicio.usecase.ts
file = path.join(__dirname, 'src/modules/servicioVehiculo/application/subir-imagen-progreso-servicio.usecase.ts');
if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(
        'import type { IStorageProvider, FileDTO } from "@shared/domain/providers/storage.provider.js";',
        `import type { FileDTO } from "@shared/domain/providers/storage.provider.js";\nimport type { CrearMediaUseCase } from "../../media/application/crear-media.usecase.js";`
    );
    content = content.replace(
        'private readonly storageProvider: IStorageProvider',
        'private readonly crearMediaUseCase: CrearMediaUseCase'
    );
    content = content.replace(
        'const url = await this.storageProvider.uploadFile(file, path);',
        'const url = await this.crearMediaUseCase.execute(file, negocio_id, path);'
    );
    fs.writeFileSync(file, content, 'utf8');
}

// 6. SERVICIO VEHICULO MODULE
file = path.join(__dirname, 'src/modules/servicioVehiculo/servicio.module.ts');
if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(
        'import { storageProvider } from "@shared/infrastructure/storage/storage.module.js";',
        `import { storageProvider } from "@shared/infrastructure/storage/storage.module.js";\nimport { crearMediaUseCase } from "../media/media.module.js";`
    );
    content = content.replace('new SubirImagenServicioUseCase(servicioVehiculoRepository, storageProvider);', 'new SubirImagenServicioUseCase(servicioVehiculoRepository, crearMediaUseCase);');
    content = content.replace('new SubirImagenProgresoServicioUseCase(progresoServicioRepository, storageProvider);', 'new SubirImagenProgresoServicioUseCase(progresoServicioRepository, crearMediaUseCase);');
    fs.writeFileSync(file, content, 'utf8');
}
