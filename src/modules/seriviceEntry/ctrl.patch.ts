import { NextFunction, Response } from "express";
import resp from "objectify-response";
import { ServiceEntryUpdateRequest } from "./schema";
import prisma from "../prisma";
import { Prisma } from "@prisma/client";

export const serviceEntryUpdateController = async (req: ServiceEntryUpdateRequest, res: Response, next: NextFunction) => {
  const { id } = req.body

  prisma.service_entry.update({
    where: { id },
    data: req.body,
  })
  .then((serviceEntry) => {
    resp(res, serviceEntry)
  })
  .catch(e => {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2025') {
        return resp(
          res,
          'Record to update does not exist.',
          400
        )
      }
    }
    next(e)
  })
}