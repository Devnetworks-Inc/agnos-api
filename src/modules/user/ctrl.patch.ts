import { Prisma } from "@prisma/client";
import { NextFunction, Response } from "express";
import resp from "objectify-response";
import { encrypt } from "src/utils/crypter";
import { UserUpdateRequest } from "./schema";
import prisma from "../prisma";

export const userUpdateController = async (req: UserUpdateRequest, res: Response, next: NextFunction) => {
  const { password, id } = req.body
  const data = {...req.body}
  if (password) {
    data.password = encrypt(password)
  }

  prisma.user.update({
    where: { id },
    data,
    omit: { password: true }
  })
  .then((user) => resp(res, user))
  .catch(e => {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2002') {
        return resp(
          res,
          'Username already exist',
          400
        )
      }
    }
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2025') {
        return resp(
          res,
          'Record to update not found.',
          400
        )
      }
    }
    next(e)
  }) 
}