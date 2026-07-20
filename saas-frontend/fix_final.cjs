const fs = require('fs');
const path = require('path');

// 1. MediaGallery
let file = path.join(__dirname, 'src/modules/negocio/presentation/components/MediaGallery.tsx');
let content = fs.readFileSync(file, 'utf8');
content = content.replace("onChange={handlePageChange}", "onChange={(e, val) => handlePageChange(e, val)}");
fs.writeFileSync(file, content, 'utf8');

// 2. MediaTab
file = path.join(__dirname, 'src/modules/negocio/presentation/components/MediaTab.tsx');
content = fs.readFileSync(file, 'utf8');
content = content.replace(/<Grid/g, '<Grid item component="div"');
content = content.replace('<Grid item component="div" container', '<Grid container component="div"');
content = content.replace("import { CloudQueue, PhotoLibrary } from '@mui/icons-material';", "import { CloudQueue, PhotoLibrary } from '@mui/icons-material';");
if (!content.includes("CloudQueue")) {
    content = content.replace("import { PhotoLibrary } from '@mui/icons-material';", "import { CloudQueue, PhotoLibrary } from '@mui/icons-material';");
}
content = content.replace("import { CloudQueue } from '@mui/icons-material';", "import { CloudQueue, PhotoLibrary } from '@mui/icons-material';");
content = content.replace("import { PhotoLibrary, CloudQueue } from '@mui/icons-material';", "import { CloudQueue, PhotoLibrary } from '@mui/icons-material';");
// the error was CloudQueue is not defined?
// src/modules/negocio/presentation/components/MediaTab.tsx(88,42): error TS2304: Cannot find name 'CloudQueue'.
if (!content.includes('import { CloudQueue, PhotoLibrary }')) {
    content = content.replace("import { PhotoLibrary } from '@mui/icons-material';", "import { CloudQueue, PhotoLibrary } from '@mui/icons-material';");
}
content = content.replace("import { CloudQueue, PhotoLibrary } from '@mui/icons-material';", "import { CloudQueue, PhotoLibrary } from '@mui/icons-material';");
fs.writeFileSync(file, content, 'utf8');

// 3. NegocioLimitesTab
file = path.join(__dirname, 'src/modules/negocio/presentation/components/NegocioLimitesTab.tsx');
content = fs.readFileSync(file, 'utf8');
content = content.replace(/<Grid/g, '<Grid item component="div"');
content = content.replace('<Grid item component="div" container', '<Grid container component="div"');
content = content.replace("CloudQueue,", "");
fs.writeFileSync(file, content, 'utf8');
