import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';

export class QrCodeProvider {
    async generar(text: string): Promise<string> {
        const uploadsDir = path.join(process.cwd(), 'uploads', 'qr');

        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const fileName = `${uuidv4()}.png`;
        const filePath = path.join(uploadsDir, fileName);

        await QRCode.toFile(filePath, text, {
            type: 'png',
            width: 300,
            margin: 2
        });

        return path.join('uploads', 'qr', fileName).replace(/\\/g, '/');
    }
}
