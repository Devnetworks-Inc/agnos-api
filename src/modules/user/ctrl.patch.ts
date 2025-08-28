import { position, Prisma } from "@prisma/client";
import { NextFunction, Response } from "express";
import resp from "objectify-response";
import { encrypt } from "src/utils/crypter";
import { UserUpdateRequest } from "./schema";
import prisma from "../prisma";

export const userUpdateController = async (req: UserUpdateRequest, res: Response, next: NextFunction) => {
  let { password, id, positionId, username } = req.body

  if (password) {
    password = encrypt(password)
  }

  let position: position | undefined | null

  if (positionId) {
    position = await prisma.position.findUnique({ where: { id: positionId } })
    if (!position) {
      return resp(res, 'Employee position does not exist', 404)
    }
  }
  
  prisma.user.update({
    where: { id },
    data: {
      username,
      password,
      employeeId: position?.employeeId ?? undefined,
      role: position?.role ?? undefined,
      position: { connect: { id: positionId } }
    },
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