import { NextFunction, Request, Response } from "express"
import { BadRequest } from "http-errors"
import mime from 'mime-types';
import fs from 'fs/promises';


export async function csvGuard(req: Request, res: Response, next: NextFunction) {
  const file = req.file;

  if (!file) {
    throw new BadRequest('No file uploaded');
  }

  if (mime.lookup(file?.originalname ?? '') !== 'text/csv') {
    await fs.unlink(file.path);
    throw new BadRequest('Invalid file type');
  }

  next();
}