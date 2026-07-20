const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../saas-frontend/src/modules/negocio/domain/negocio.schema.ts');
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('storage:')) {
    content = content.replace(
        'export interface ObtenerLimitesResponse {',
        `export interface ObtenerLimitesResponse {
  generales: NegocioLimiteItem[];
  storage: {
    storage_bytes_used: number;
    storage_max_bytes: number | null;
  };`
    );
    // actually it didn't have ObtenerLimitesResponse maybe? Let's check the schema
}
fs.writeFileSync(file, content, 'utf8');
