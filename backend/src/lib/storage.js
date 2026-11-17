// Image storage: Cloudinary when CLOUDINARY_URL is set (cloudinary://<key>:<secret>@<cloud>),
// otherwise the local disk (UPLOAD_DIR, served at /uploads). Render's free disk is ephemeral, so
// use Cloudinary in production if uploaded images must survive a redeploy.
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { config } from '../config.js';

const EXT = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/avif': '.avif' };
export const ALLOWED_TYPES = Object.keys(EXT);

function parseCloudinary(url) {
  const m = /^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/.exec(url);
  return m ? { key: m[1], secret: m[2], cloud: m[3] } : null;
}

async function toCloudinary(file, creds) {
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = 'hueline';
  const signature = crypto.createHash('sha1').update(`folder=${folder}&timestamp=${timestamp}${creds.secret}`).digest('hex');
  const form = new FormData();
  form.append('file', new Blob([file.buffer], { type: file.mimetype }), file.originalname || 'upload');
  form.append('api_key', creds.key);
  form.append('timestamp', String(timestamp));
  form.append('folder', folder);
  form.append('signature', signature);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${creds.cloud}/image/upload`, { method: 'POST', body: form });
  if (!res.ok) throw Object.assign(new Error('Image upload failed'), { status: 502 });
  const data = await res.json();
  return { url: data.secure_url, storage: 'cloudinary' };
}

export async function saveImage(file) {
  const creds = config.cloudinaryUrl ? parseCloudinary(config.cloudinaryUrl) : null;
  if (creds) return toCloudinary(file, creds);
  await fs.mkdir(config.uploadDir, { recursive: true });
  const name = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${EXT[file.mimetype]}`;
  await fs.writeFile(path.join(config.uploadDir, name), file.buffer);
  return { url: `/uploads/${name}`, storage: 'disk' };
}
