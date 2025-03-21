import { Request, Response } from "express";
import resp from "objectify-response";
import prisma from "../prisma";
import { IdParam } from "../id/schema";
import { AuthRequest } from "../auth.schema";
import { DailyHousekeepingRecordGetRequest } from "./schema";

export const dailyHousekeepingRecordGetController = async (req: DailyHousekeepingRecordGetRequest, res: Response) => {
  const { startDate, endDate } = req.query
  const s = startDate?.split('-')
  const e = endDate?.split('-')

  const dailyHousekeepingRecords = await prisma.daily_housekeeping_record.findMany({
    where: { date: {
      gte: s && new Date(Date.UTC(+s[0],+s[1]-1,+s[2])),
      lte: e && new Date(Date.UTC(+e[0],+e[1]-1,+e[2])),
    }}
  })

  return resp(res, dailyHousekeepingRecords)
}

export const dailyHousekeepingRecordGetByIdController = async (req: Request<IdParam> & AuthRequest, res: Response) => {
  const id = +req.params.id
  const dailyHousekeepingRecord = await prisma.daily_housekeeping_record.findUnique({
    where: { id }
  });
  if (!dailyHousekeepingRecord) {
    return resp(res, 'Record not found', 404)
  }

  resp(res, dailyHousekeepingRecord)
}