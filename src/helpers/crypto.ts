import crypto from 'crypto';

const key = Buffer.from('ddce8d162b4dc0e812bd172915c3a13968449581e241f089de4d8df929040380', 'hex');
const iv = crypto.randomBytes(16);
const algorithm = 'aes-256-cbc';

export function encrypt(message: string) {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(message, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

export function decrypt(message: string) {
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(message, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}