import fs from 'fs';
import path from 'path';

export default function saveBase64Image(base64String, folder = 'uploads') {
  // Extract image type and data
  const matches = base64String.match(/^data:(.+);base64,(.+)$/);
  if (!matches) throw new Error('Invalid base64 string');
  const ext = matches[1].split('/')[1];
  const data = matches[2];
  const buffer = Buffer.from(data, 'base64');
  const filename = `${Date.now()}.${ext}`;
  const filePath = path.join(folder, filename);

  // Ensure uploads folder exists
  if (!fs.existsSync(folder)) fs.mkdirSync(folder);

  fs.writeFileSync(filePath, buffer);
  return filePath;
} 