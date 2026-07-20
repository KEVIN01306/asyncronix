const fs = require('fs');
const path = require('path');

// 1. Update subir-imagen-producto.usecase.ts
let file = path.join(__dirname, 'src/modules/producto/application/subir-imagen-producto.usecase.ts');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    'export class SubirImagenProductoUseCase {',
    `import type { CrearMediaUseCase } from "../../media/application/crear-media.usecase.js";
import type { FileDTO } from "@shared/domain/providers/storage.provider.js";

export class SubirImagenProductoUseCase {`
);
content = content.replace(
    'constructor(private readonly repository: ProductoRepository) { }',
    'constructor(private readonly repository: ProductoRepository, private readonly crearMediaUseCase: CrearMediaUseCase) { }'
);
content = content.replace(
    'url: string;',
    'file: FileDTO;'
);
content = content.replace(
    'async execute({ producto_id, url, descripcion, negocio_id }: Params): Promise<ProductoDetalle> {',
    `async execute({ producto_id, file, descripcion, negocio_id }: Params): Promise<ProductoDetalle> {`
);
content = content.replace(
    'return await this.repository.registrarImagen(producto_id, url, descripcion ?? null, negocio_id);',
    `        const path = \`tenant_\${negocio_id}/products/prod_\${producto_id}\`;
        const url = await this.crearMediaUseCase.execute(file, negocio_id, path);
        return await this.repository.registrarImagen(producto_id, url, descripcion ?? null, negocio_id);`
);
fs.writeFileSync(file, content, 'utf8');

// 2. Update eliminar-imagen-producto.usecase.ts
file = path.join(__dirname, 'src/modules/producto/application/eliminar-imagen-producto.usecase.ts');
content = fs.readFileSync(file, 'utf8');
content = content.replace(
    'import type { IStorageProvider } from "@shared/domain/providers/storage.provider.js";',
    'import type { EliminarMediaUseCase } from "../../media/application/eliminar-media.usecase.js";'
);
content = content.replace(
    'private readonly storageProvider: IStorageProvider',
    'private readonly eliminarMediaUseCase: EliminarMediaUseCase'
);
content = content.replace(
    'await this.storageProvider.deleteFile(imagen.url);',
    'await this.eliminarMediaUseCase.execute(negocio_id, imagen.url);'
);
fs.writeFileSync(file, content, 'utf8');

// 3. Update actualizar-archivo-imagen-producto.usecase.ts
file = path.join(__dirname, 'src/modules/producto/application/actualizar-archivo-imagen-producto.usecase.ts');
content = fs.readFileSync(file, 'utf8');
content = content.replace(
    'import type { IStorageProvider, FileDTO } from "@shared/domain/providers/storage.provider.js";',
    `import type { FileDTO } from "@shared/domain/providers/storage.provider.js";
import type { ReemplazarMediaUseCase } from "../../media/application/reemplazar-media.usecase.js";`
);
content = content.replace(
    'private readonly storageProvider: IStorageProvider',
    'private readonly reemplazarMediaUseCase: ReemplazarMediaUseCase'
);
content = content.replace(
    'let nuevaUrl: string;',
    `const path = \`tenant_\${negocio_id}/products/prod_\${imagen.producto_id}\`;
        const nuevaUrl = await this.reemplazarMediaUseCase.execute(file, negocio_id, path, undefined, imagen.url);`
);
// Remove the if (this.storageProvider.replaceFile) block
const blockToRemove = `if (this.storageProvider.replaceFile) {
            nuevaUrl = await this.storageProvider.replaceFile(imagen.url, file, path);
        } else {
            await this.storageProvider.deleteFile(imagen.url);
            nuevaUrl = await this.storageProvider.uploadFile(file, path);
        }`;
content = content.replace(blockToRemove, '');
content = content.replace('const path = `tenant_${negocio_id}/products/prod_${imagen.producto_id}`;', ''); // because I put it inside the previous replace
fs.writeFileSync(file, content, 'utf8');

