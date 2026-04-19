import fs from 'fs/promises';
import path from 'path';

class ManejadorArchivosUtils {

    static async eliminarArchivo(ruta: string): Promise<void> {
        try {
            const rutaCompleta = path.resolve(ruta);
            await fs.unlink(rutaCompleta);
        } catch (error) {
            console.error(`No se pudo borrar el archivo: ${ruta}`, error);
        }
    }

    static formatearRuta(ruta: string): string {
        if (!ruta) return '';
        return path.normalize(ruta).replace(/\\/g, '/');
    }
}

export default ManejadorArchivosUtils;