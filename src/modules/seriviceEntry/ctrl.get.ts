import { Request, Response } from "express";
import resp from "objectify-response";
import prisma from "../prisma";
import { IdParam } from "../id/schema";
import { AuthRequest } from "../auth.schema";

export const dailyHousekeepingRecordGetAllController = async (req: Request & AuthRequest, res: Response) => {
  const dailyHousekeepingRecords = await prisma.daily_housekeeping_record.findMany({});
  return resp(res, dailyHousekeepingRecords)
}

export const dailyHousekeepingRecordGetByIdController = async (req: Request<IdParam> & AuthRequest, res: Response) => {
  const id = +req.params.id
  const dailyHousekeepingRecord = await prisma.daily_housekeeping_record.findUnique({
    where: { id }
  });
  if (!dailyHousekeepingRecord) {
    return resp(res, 'Hotel not found', 404)
  }

  resp(res, dailyHousekeepingRecord)
}