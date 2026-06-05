/**
 * Reduce la calidad de una imagen y devuelve un objeto de tipo File.
 * @param archivoOriginal - El archivo obtenido del input (e.target.files[0]).
 * @param calidad - Nivel de calidad de 0.1 a 1.0. Por defecto 0.6.
 * @returns Una promesa que devuelve un objeto File optimizado.
 */
export const bajarCalidadImagen = (
    archivoOriginal: File,
    calidad: number = 0.4,
    extension: string = 'webp'
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

                const maxDimension = 1024;
                let targetWidth = img.width;
                let targetHeight = img.height;

                if (img.width > maxDimension || img.height > maxDimension) {
                    const scale = Math.min(maxDimension / img.width, maxDimension / img.height);
                    targetWidth = Math.round(img.width * scale);
                    targetHeight = Math.round(img.height * scale);
                }

                canvas.width = targetWidth;
                canvas.height = targetHeight;
                ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

                canvas.toBlob(
                    (blobComprimido) => {
                        if (blobComprimido) {
                            const nombreArchivo = archivoOriginal.name.replace(/\.[^/.]+$/, "") + `.${extension}`;
                            const archivoOptimizado = new File(
                                [blobComprimido],
                                nombreArchivo,
                                {
                                    type: `image/${extension}`,
                                    lastModified: Date.now()
                                }
                            );
                            resolve(archivoOptimizado);
                        } else {
                            reject(new Error('No se pudo procesar la compresión de la imagen.'));
                        }
                    },
                    `image/${extension}`,
                    calidad
                );
            };

            img.onerror = () => reject(new Error('Error al cargar la estructura de la imagen.'));
        };

        lector.onerror = () => reject(new Error('Error al leer el archivo físico.'));
    });
};