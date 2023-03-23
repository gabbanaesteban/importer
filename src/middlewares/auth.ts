import { User } from "@prisma/client";
import { NextFunction, Response, Request } from "express";
import { Session, SessionData } from 'express-session';
import container from "../IoC/inversify.config";
import { CURRENT_USER } from "../IoC/types";

declare module 'express' {
  export interface Request {
    session: Session & Partial<SessionData> & { user?: User };
  }
}

export async function sessionChecker( req: Request, res: Response, next: NextFunction) {
  if (req.session.user) {
    container.rebind(CURRENT_USER).toConstantValue(req.session.user);
    return next();
  }
  
  return res.redirect('/login');
}