import resp from "objectify-response";
import { NextFunction, Response } from "express";
import prisma from "../prisma";
import { DailyHousekeepingRecordCreateRequest } from "./schema";
import { Prisma } from "@prisma/client";

export const dailyHousekeepingRecordCreateController = (
  req: DailyHousekeepingRecordCreateRequest,
  res: Response,
  next: NextFunction
) => {
  prisma.daily_housekeeping_record
    .create({
      data: req.body,
    })
    .then((dailyHousekeepingRecord) => {
      resp(res, dailyHousekeepingRecord);
    })
    .catch((e) => {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2003" && e.meta?.["field_name"] === "hotelId") {
          return resp(res, "Hotel does not exist.", 400);
        }
      }
      next(e)
    });
};
