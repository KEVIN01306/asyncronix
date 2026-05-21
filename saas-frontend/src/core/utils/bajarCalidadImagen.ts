/**
 * Reduce la calidad de una imagen y devuelve un objeto de tipo File.
 * @param archivoOriginal - El archivo obtenido del input (e.target.files[0]).
 * @param calidad - Nivel de calidad de 0.1 a 1.0. Por defecto 0.6.
 * @returns Una promesa que devuelve un objeto File optimizado.
 */
export const bajarCalidadImagen = (
    archivoOriginal: File,
    calidad: number = 0.6
): Promise<File> => {
    return new Promise((resolve, reject) => {
        if (!archivoOriginal || !archivoOriginal.type.startsWith('image/')) {
            reject(new Error('El archivo proporcionado no es una imagen válida.'));
            return;
        }

        const lector = new FileReader();
        lector.readAsDataURL(archivoOriginal);

        lector.onload = (eventoLector: ProgressEvent<FileReader>) => {
            const resultadoSrc = eventoLector.target?.result;

            if (typeof resultadoSrc !== 'string') {
                reject(new Error('Error al procesar el origen de la imagen.'));
                return;
            }

            const img = new Image();
            img.src = resultadoSrc;

            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    reject(new Error('No se pudo obtener el contexto 2D del Canvas.'));
                    return;
                }

                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0, img.width, img.height);

                canvas.toBlob(
                    (blobComprimido) => {
                        if (blobComprimido) {

                            const nombreArchivo = archivoOriginal.name.replace(/\.[^/.]+$/, "") + ".png";

                            const archivoOptimizado = new File(
                                [blobComprimido],
                                nombreArchivo,
                                {
                                    type: 'image/png',
                                    lastModified: Date.now()
                                }
                            );

                            resolve(archivoOptimizado);
                        } else {
                            reject(new Error('No se pudo procesar la compresión de la imagen.'));
                        }
                    },
                    'image/png',
                    calidad
                );
            };

            img.onerror = () => reject(new Error('Error al cargar la estructura de la imagen.'));
        };

        lector.onerror = () => reject(new Error('Error al leer el archivo físico.'));
    });
};