import resp from "objectify-response";
import { NextFunction, Response } from "express";
import prisma from "../prisma";
import { DailyHousekeepingRecordCreateRequest } from "./schema";
import { Prisma } from "@prisma/client";

export const dailyHousekeepingRecordCreateController = async (
  req: DailyHousekeepingRecordCreateRequest,
  res: Response,
  next: NextFunction
) => {
  const {
    departureRooms: dr,
    stayOverRooms: sor,
    dirtyRoomsLastDay: drld,
    dayUseRooms: dur,
    extraCleaningRooms: ecr,
    refreshRooms,
    hotelId
  } = req.body

  const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } })

  if (!hotel) {
    return resp(res, "Hotel does not exist.", 400);
  }

  const totalCleanedRooms = dr + sor + drld + dur + ecr

  await prisma.daily_housekeeping_record.create({
    data: {
      ...req.body,
      totalCleanedRooms,
      totalRefreshRooms: refreshRooms,
      totalCleanedRoomsCost: new Prisma.Decimal(hotel.roomsCleaningRate).times(totalCleanedRooms),
      totalRefreshRoomsCost: new Prisma.Decimal(refreshRooms).times(refreshRooms)
    }
  })
  .then((dailyHousekeepingRecord) => {
    resp(res, dailyHousekeepingRecord)
  })
  .catch( e => {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2002') {
        return resp(
          res,
          'Record for the day already exist',
          400
        )
      }
    }
    next(e)
  })
};
