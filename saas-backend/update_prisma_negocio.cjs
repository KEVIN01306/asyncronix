const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/modules/negocio/infrastructure/prisma-negocio.repository.ts');
let content = fs.readFileSync(file, 'utf8');

const injection = `
    async incrementarStorage(negocio_id: string, bytes: number): Promise<void> {
        await prisma.negocioLimite.update({
            where: { negocio_id },
            data: {
                storage_bytes_used: {
                    increment: bytes
                }
            }
        });
    }

    async decrementarStorage(negocio_id: string, bytes: number): Promise<void> {
        await prisma.negocioLimite.update({
            where: { negocio_id },
            data: {
                storage_bytes_used: {
                    decrement: bytes
                }
            }
        });
    }
}
`;

content = content.replace(/}\s*$/, injection);
fs.writeFileSync(file, content, 'utf8');
