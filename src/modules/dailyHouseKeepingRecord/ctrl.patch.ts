import { NextFunction, Response } from "express";
import resp from "objectify-response";
import { DailyHousekeepingRecordUpdateRequest } from "./schema";
import prisma from "../prisma";
import { Prisma } from "@prisma/client";

export const dailyHousekeepingRecordUpdateController = async (req: DailyHousekeepingRecordUpdateRequest, res: Response, next: NextFunction) => {
  const { id } = req.body

  prisma.daily_housekeeping_record.update({
    where: { id },
    data: req.body,
  })
  .then((dailyHousekeepingRecord) => {
    resp(res, dailyHousekeepingRecord)
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
      if (e.code === "P2003" && e.meta?.["field_name"] === "hotelId") {
        return resp(res, "Hotel does not exist.", 400);
      }
    }
    next(e)
  })
}