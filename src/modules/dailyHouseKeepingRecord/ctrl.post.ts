import resp from "objectify-response";
import { NextFunction, Response } from "express";
import prisma from "../prisma";
import { DailyHousekeepingRecordCreateRequest } from "./schema";

export const dailyHousekeepingRecordCreateController = async (req: DailyHousekeepingRecordCreateRequest, res: Response, next: NextFunction) => {
  const dailyHousekeepingRecord = await prisma.daily_housekeeping_record.create({
    data: req.body,
  })

  resp(res, dailyHousekeepingRecord)
};