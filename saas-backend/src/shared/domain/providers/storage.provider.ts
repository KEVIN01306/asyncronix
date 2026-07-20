export interface FileDTO {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
    size: number;
}

export interface IStorageProvider {
    /**
     * Uploads a file to the storage provider
     * @param file The file data
     * @param path The path where the file will be stored (e.g., tenant_id/users/usr_id)
     * @param fixedFileName Optional fixed file name (e.g., profile.png). If not provided, a UUID will be generated.
     * @returns The public URL of the uploaded file
     */
    uploadFile(file: FileDTO, path: string, fixedFileName?: string): Promise<string>;

    /**
     * Deletes a file from the storage provider
     * @param url The public URL of the file to delete
     */
    deleteFile(url: string): Promise<void>;

    /**
     * Replaces an existing file with a new one
     * @param oldUrl The public URL of the file to replace
     * @param newFile The new file data
     * @param path The path where the new file will be stored
     * @param fixedFileName Optional fixed file name
     * @returns The public URL of the newly uploaded file
     */
    replaceFile?(oldUrl: string, newFile: FileDTO, path: string, fixedFileName?: string): Promise<string>;

    /**
     * Checks if a file exists in the storage provider
     * @param url The public URL of the file
     * @returns True if the file exists, false otherwise
     */
    checkFileExists?(url: string): Promise<boolean>;
}
