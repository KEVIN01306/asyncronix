const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/routes/index.routes.ts');
let content = fs.readFileSync(file, 'utf8');

if(!content.includes('/media')) {
    content = content.replace(
        "router.use('/reportes', (await import('../modules/reportes/presentation/reportes.routes.js')).default)",
        "router.use('/reportes', (await import('../modules/reportes/presentation/reportes.routes.js')).default)\nrouter.use('/media', (await import('../modules/media/presentation/media.routes.js')).default)"
    );
    fs.writeFileSync(file, content, 'utf8');
}
