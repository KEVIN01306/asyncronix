const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/modules/negocio/application/obtener-limites-negocio.usecase.ts');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /Promise<NegocioLimiteItem\[\]>/g,
    'Promise<{ generales: NegocioLimiteItem[], storage: { storage_bytes_used: number, storage_max_bytes: number | null } }>'
);

content = content.replace(
    /return \[\s*this\.buildItem\(LimiteNegocio\.USUARIOS, limites\.max_usuarios, usuariosCount\),[\s\S]*?\];/g,
    `return {
                generales: [
                    this.buildItem(LimiteNegocio.USUARIOS, limites.max_usuarios, usuariosCount),
                    this.buildItem(LimiteNegocio.SUCURSALES, limites.max_sucursales, sucursalesCount),
                    this.buildItem(LimiteNegocio.PRODUCTOS, limites.max_productos, productosCount),
                    this.buildItem(LimiteNegocio.VARIANTES, limites.max_variantes, variantesCount),
                    this.buildItem(LimiteNegocio.VEHICULOS, limites.max_vehiculos, vehiculosCount),
                    this.buildItem(LimiteNegocio.CAJAS, limites.max_cajas, cajasCount),
                    this.buildItem(LimiteNegocio.CUENTAS_BANCARIAS, limites.max_cuentas_bancarias, cuentasCount)
                ],
                storage: {
                    storage_bytes_used: Number(limites.storage_bytes_used ?? 0),
                    storage_max_bytes: limites.storage_max_bytes ? Number(limites.storage_max_bytes) : null
                }
            };`
);

fs.writeFileSync(file, content, 'utf8');
