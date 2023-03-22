import { User } from "@prisma/client";
import { NextFunction, Response, Request } from "express";
import { Session, SessionData } from 'express-session';

declare module 'express' {
  export interface Request {
    session: Session & Partial<SessionData> & { user?: User };
  }
}

export async function sessionChecker( req: Request, res: Response, next: NextFunction) {
  return req.session.user ? next() : res.redirect('/login');
}