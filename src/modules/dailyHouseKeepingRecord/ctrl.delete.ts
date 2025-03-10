import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import resp from "objectify-response";
import prisma from "../prisma";
import { IdParam } from "../id/schema";
import { AuthRequest } from "../auth.schema";

export const dailyHousekeepingRecordDeleteController = (req: Request<IdParam> & AuthRequest, res: Response, next: NextFunction) => {
  prisma.daily_housekeeping_record.delete({ where: { id: +req.params.id }})
  .then(() => {
    resp(res, 'Daily Housekeeping Record has been deleted')
  })
  .catch(e => {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2025') {
        return resp(
          res,
          'Record to delete does not exist.',
          400
        )
      }
    }
    next(e)
  })
}