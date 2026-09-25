export interface UploadInput {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
  folder?: string;
}

export interface UploadResult {
  url: string;
  key: string;
}

export interface StorageProvider {
  upload(input: UploadInput): Promise<UploadResult>;
  delete(key: string): Promise<void>;
}
