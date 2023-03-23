import { Request, Response, NextFunction } from 'express';
import { NotFound } from 'http-errors'

interface IError extends Error {
  statusCode?: number;
}

export function notFound(req: Request, res: Response, next: NextFunction) {
  const error = new NotFound(`Not Found - ${req.originalUrl}`);
  next(error);
}

export function errorHandler(error: IError, req: Request, res: Response, next: NextFunction) {
  const data = {
    message: error.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : error.stack,
    statusCode: error?.statusCode ? error.statusCode : 500,
  }

  res.render('error', { data })
}
