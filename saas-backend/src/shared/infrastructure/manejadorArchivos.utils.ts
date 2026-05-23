import fs from 'fs/promises';
import path from 'path';

class ManejadorArchivos {
    static async eliminarArchivo(ruta: string): Promise<void> {
        if (!ruta) return;
        try {
            // si es URL completa, extraer path relativo si aplica
            const posibleRuta = ruta.startsWith('http') ? new URL(ruta).pathname : ruta;
            const rutaCompleta = path.resolve(posibleRuta);
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

export default ManejadorArchivos;
