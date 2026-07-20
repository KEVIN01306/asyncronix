const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/modules/usuarios/infrastructure/mappers/usuario.mapper.ts');
let content = fs.readFileSync(file, 'utf8');
// Fix duplicate properties if possible, this happens sometimes.
// I will just let it be for now since it's pre-existing.
