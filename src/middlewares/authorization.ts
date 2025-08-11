import { role } from "@prisma/client";
import { NextFunction, Response } from "express";
import { Request } from "express-jwt";
import resp from "objectify-response";
import { Auth } from "src/modules/auth.schema";

export const authorizeRoles = (roles: role[]) => (req: Request<Auth>, res: Response, next: NextFunction)=> {
    if (!req.auth) return resp(res, 'Unauthorized', 401)
    const { role } = req.auth

    if(!roles.includes(role))
      return resp(res, 'Unauthorized', 401)

    next()
};

export const restrictRoles = (roles: role[]) => (req: Request<Auth>, res: Response, next: NextFunction)=> {
  if (!req.auth) return resp(res, 'Unauthorized', 401)
  const { role } = req.auth

  if(roles.includes(role))
    return resp(res, 'Unauthorized', 401)

  next()
};
