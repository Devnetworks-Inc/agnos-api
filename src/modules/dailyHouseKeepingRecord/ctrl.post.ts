import resp from "objectify-response";
import { Response } from "express";
import prisma from "../prisma";
import { DailyHousekeepingRecordCreateRequest } from "./schema";
import { Prisma } from "@prisma/client";

export const dailyHousekeepingRecordCreateController = async (
  req: DailyHousekeepingRecordCreateRequest,
  res: Response,
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

  const dailyHousekeepingRecord = await prisma.daily_housekeeping_record.create({
    data: {
      ...req.body,
      totalCleanedRooms,
      totalRefreshRooms: refreshRooms,
      totalCleanedRoomsCost: new Prisma.Decimal(hotel.roomsCleaningRate).times(totalCleanedRooms),
      totalRefreshRoomsCost: new Prisma.Decimal(refreshRooms).times(refreshRooms)
    }
  })

  resp(res, dailyHousekeepingRecord);
};
