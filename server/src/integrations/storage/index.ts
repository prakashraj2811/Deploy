import { StorageProvider } from "./StorageProvider";
import { LocalStorageProvider } from "./LocalStorageProvider";

// Swap in S3StorageProvider / CloudinaryStorageProvider / FirebaseStorageProvider here
// once STORAGE_PROVIDER is set and credentials are configured. All implement StorageProvider,
// so only this file changes — callers depend on the interface only.
export const storageProvider: StorageProvider = new LocalStorageProvider();

export * from "./StorageProvider";
