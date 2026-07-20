const fs = require('fs');
const path = require('path');

function removeGridItem(file) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/<Grid item component="div"/g, '<Grid');
    content = content.replace(/<Grid container component="div"/g, '<Grid container');
    fs.writeFileSync(file, content, 'utf8');
}

removeGridItem(path.join(__dirname, 'src/modules/negocio/presentation/components/MediaTab.tsx'));
removeGridItem(path.join(__dirname, 'src/modules/negocio/presentation/components/NegocioLimitesTab.tsx'));

