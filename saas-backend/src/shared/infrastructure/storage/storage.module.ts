import { CloudflareR2StorageProvider } from "./cloudflare-r2.provider.js";
import { type IStorageProvider } from "../../domain/providers/storage.provider.js";

// Instancia única del proveedor de almacenamiento
export const storageProvider: IStorageProvider = new CloudflareR2StorageProvider();
