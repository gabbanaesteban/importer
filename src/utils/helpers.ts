import bcrypt from 'bcrypt';
import { BadRequest } from 'http-errors';
import { z, ZodType, ZodTypeDef } from 'zod';

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hashedPassword: string) {
  return bcrypt.compare(password, hashedPassword);
}

export const validateParams = (data: unknown, schema: ZodType<any, ZodTypeDef, any>): z.infer<typeof schema> => {
  const validation = schema.safeParse(data);

  if (validation.success) {
    return validation.data;
  }

  const [error] = validation.error.issues

  throw new BadRequest(`Validation Error - ${error.path.join('.')}: ${error.message}`);
};

export function parseDate(dateString: string): Date | undefined {
  const onlyNumbers = dateString.replace(/[^0-9]/g, '');

  if (onlyNumbers.length !== 8) {
    return undefined;
  }
  
  const year = Number(onlyNumbers.slice(0, 4));
  const month = Number(onlyNumbers.slice(4, 6)) - 1; // JavaScript months are 0-11
  const day = Number(onlyNumbers.slice(6, 8));
  
  return new Date(year, month, day);
}