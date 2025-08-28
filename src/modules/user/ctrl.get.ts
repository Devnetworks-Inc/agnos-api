import { Request, Response } from "express";
import resp from "objectify-response";
import prisma from "../prisma";

export const userGetAllController = async (req: Request, res: Response) => {
  const users = await prisma.user.findMany({ 
    omit: { password: true },
    include: { 
      employee: { 
        select: { firstName: true, middleName: true, lastName: true }
      },
      position: true
    } 
  })

  return resp(res, users.map(({ employee: e, ...rest }) => ({
    ...rest,
    ...e,
    fullName: e && `${e.firstName} ${e.middleName ? `${e.middleName} `: ''}${e.lastName}`
  })))
}