const fs = require('fs');
const path = require('path');

// 1. MediaGallery
let file = path.join(__dirname, 'src/modules/negocio/presentation/components/MediaGallery.tsx');
let content = fs.readFileSync(file, 'utf8');
content = content.replace("import formatImage from '../../../../core/utils/formatImage';", "import { formatImage } from '../../../../core/utils/formatImage';");
content = content.replace("event: React.ChangeEvent<unknown>, ", ""); // in handlePageChange
content = content.replace("(path: string)", "()"); // in handleDelete
content = content.replace("handleDelete(item.path)", "handleDelete()");
fs.writeFileSync(file, content, 'utf8');

// 2. MediaTab
file = path.join(__dirname, 'src/modules/negocio/presentation/components/MediaTab.tsx');
content = fs.readFileSync(file, 'utf8');
content = content.replace(/<Grid item/g, '<Grid');
content = content.replace("CloudQueue, ", ""); // remove unused CloudQueue
fs.writeFileSync(file, content, 'utf8');

// 3. NegocioLimitesTab
file = path.join(__dirname, 'src/modules/negocio/presentation/components/NegocioLimitesTab.tsx');
content = fs.readFileSync(file, 'utf8');
content = content.replace(/<Grid item/g, '<Grid');
content = content.replace("event: React.SyntheticEvent, ", ""); // in handleChangeTab
content = content.replace("onChange={handleChangeTab}", "onChange={(_, val) => handleChangeTab(val)}");
fs.writeFileSync(file, content, 'utf8');

