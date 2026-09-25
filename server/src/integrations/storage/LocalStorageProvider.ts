import fs from "fs";
import path from "path";
import crypto from "crypto";
import { env } from "../../config/env";
import { StorageProvider, UploadInput, UploadResult } from "./StorageProvider";

const UPLOAD_ROOT = path.join(process.cwd(), "uploads");

/** Writes files to local disk under /uploads, served statically. Placeholder for S3/Cloudinary/Firebase in production. */
export class LocalStorageProvider implements StorageProvider {
  async upload(input: UploadInput): Promise<UploadResult> {
    const folder = input.folder ?? "misc";
    const dir = path.join(UPLOAD_ROOT, folder);
    fs.mkdirSync(dir, { recursive: true });

    const ext = path.extname(input.fileName);
    const key = `${folder}/${crypto.randomUUID()}${ext}`;
    const fullPath = path.join(UPLOAD_ROOT, key);
    fs.writeFileSync(fullPath, input.buffer);

    return { url: `${env.backendUrl}/uploads/${key}`, key };
  }

  async delete(key: string): Promise<void> {
    const fullPath = path.join(UPLOAD_ROOT, key);
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
  }
}
