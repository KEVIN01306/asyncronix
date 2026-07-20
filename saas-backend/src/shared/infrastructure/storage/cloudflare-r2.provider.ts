import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import type { IStorageProvider, FileDTO } from "../../domain/providers/storage.provider.js";
import { StorageError } from "./errors/StorageError.js";

export class CloudflareR2StorageProvider implements IStorageProvider {
    private client: S3Client;
    private bucketName: string;
    private publicUrl: string;

    constructor() {
        const accountId = process.env.R2_ACCOUNT_ID;
        const accessKeyId = process.env.R2_ACCESS_KEY_ID;
        const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
        const bucketName = process.env.R2_BUCKET_NAME;
        const publicUrl = process.env.R2_PUBLIC_URL;
        const endpoint = process.env.R2_ENDPOINT;

        if (!accountId || !accessKeyId || !secretAccessKey || !bucketName || !publicUrl || !endpoint) {
            throw new Error("Missing Cloudflare R2 environment variables. Ensure R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL and R2_ENDPOINT are set.");
        }

        this.bucketName = bucketName;
        this.publicUrl = publicUrl.endsWith("/") ? publicUrl.slice(0, -1) : publicUrl;

        this.client = new S3Client({
            region: "auto",
            endpoint: endpoint,
            credentials: {
                accessKeyId,
                secretAccessKey,
            }
        });
    }

    async uploadFile(file: FileDTO, path: string, fixedFileName?: string): Promise<string> {
        try {
            const extension = file.originalname.split('.').pop() || '';
            const fileName = fixedFileName ? `${fixedFileName}.${extension}` : `${uuidv4()}.${extension}`;
            const key = path ? `${path}/${fileName}` : fileName;

            const command = new PutObjectCommand({
                Bucket: this.bucketName,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
            });

            await this.client.send(command);

            return `${this.publicUrl}/${key}`;
        } catch (error) {
            throw new StorageError("Failed to upload file to Cloudflare R2", error);
        }
    }

    async deleteFile(url: string): Promise<void> {
        if (!url) return;

        try {
            // Extract the relative path / key from the URL
            const prefix = `${this.publicUrl}/`;
            let key = url;

            if (url.startsWith(prefix)) {
                key = url.slice(prefix.length);
            } else if (url.startsWith("http")) {
                const parsedUrl = new URL(url);
                key = parsedUrl.pathname.substring(1); // Remove leading slash
            }

            const command = new DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });

            await this.client.send(command);
        } catch (error) {
            // Log the error but don't fail the business logic if a delete fails,
            // as this is often a cleanup operation
            console.error(`Failed to delete file from Cloudflare R2: ${url}`, error);
        }
    }

    async replaceFile(oldUrl: string, newFile: FileDTO, path: string, fixedFileName?: string): Promise<string> {
        if (oldUrl) {
            await this.deleteFile(oldUrl);
        }
        return this.uploadFile(newFile, path, fixedFileName);
    }

    async checkFileExists(url: string): Promise<boolean> {
        try {
            const prefix = `${this.publicUrl}/`;
            let key = url;
            if (url.startsWith(prefix)) {
                key = url.slice(prefix.length);
            } else if (url.startsWith("http")) {
                const parsedUrl = new URL(url);
                key = parsedUrl.pathname.substring(1);
            }

            const command = new HeadObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });

            await this.client.send(command);
            return true;
        } catch (error: any) {
            if (error.name === "NotFound" || error.$metadata?.httpStatusCode === 404) {
                return false;
            }
            throw new StorageError("Failed to check file existence in Cloudflare R2", error);
        }
    }
}
