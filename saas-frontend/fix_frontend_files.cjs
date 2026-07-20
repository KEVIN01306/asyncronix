const fs = require('fs');
const path = require('path');

const galleryFile = path.join(__dirname, 'src/modules/negocio/presentation/components/MediaGallery.tsx');
let galleryContent = fs.readFileSync(galleryFile, 'utf8');
galleryContent = galleryContent.replace(/\\`/g, '`');
galleryContent = galleryContent.replace(/\\\$/g, '$');
fs.writeFileSync(galleryFile, galleryContent, 'utf8');

const tabFile = path.join(__dirname, 'src/modules/negocio/presentation/components/MediaTab.tsx');
let tabContent = fs.readFileSync(tabFile, 'utf8');
tabContent = tabContent.replace(/\\`/g, '`');
tabContent = tabContent.replace(/\\\$/g, '$');
fs.writeFileSync(tabFile, tabContent, 'utf8');

const limitesFile = path.join(__dirname, 'src/modules/negocio/presentation/components/NegocioLimitesTab.tsx');
let limitesContent = fs.readFileSync(limitesFile, 'utf8');
limitesContent = limitesContent.replace(/\\`/g, '`');
limitesContent = limitesContent.replace(/\\\$/g, '$');
fs.writeFileSync(limitesFile, limitesContent, 'utf8');
