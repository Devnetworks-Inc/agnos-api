import { NextFunction, Response } from "express";
import resp from "objectify-response";
import { DailyHousekeepingRecordUpdateRequest } from "./schema";
import prisma from "../prisma";
import { Prisma } from "@prisma/client";

export const dailyHousekeepingRecordUpdateController = async (req: DailyHousekeepingRecordUpdateRequest, res: Response, next: NextFunction) => {
  const { id, hotelId } = req.body

  const record = await prisma.daily_housekeeping_record.findUnique({
    where: { id },
    include: { hotel: { select: { roomsCleaningRate: true, roomsRefreshRate: true } } }
  })

  if (!record) {
    return resp(res, 'Record to update does not exist.', 400)
  }

  let roomsCleaningRate = record.hotel.roomsCleaningRate
  let roomsRefreshRate = record.hotel.roomsRefreshRate

  if (hotelId && hotelId !== record.hotelId) {
    const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } })
    if (!hotel) {
      return resp(res, "Hotel does not exist.", 400);
    }
    roomsCleaningRate = hotel.roomsCleaningRate
    roomsRefreshRate = hotel.roomsRefreshRate
  }

  const {
    departureRooms: dr = record.departureRooms,
    stayOverRooms: sor = record.stayOverRooms,
    dirtyRoomsLastDay: drld = record.dirtyRoomsLastDay,
    dayUseRooms: dur = record.dayUseRooms,
    extraCleaningRooms: ecr = record.extraCleaningRooms,
    refreshRooms = record.refreshRooms
  } = req.body

  const totalCleanedRooms = dr + sor + drld + dur + ecr

  const newRecord = prisma.daily_housekeeping_record.update({
    where: { id },
    data: {
      ...req.body,
      totalCleanedRooms,
      totalRefreshRooms: refreshRooms,
      totalCleanedRoomsCost: new Prisma.Decimal(roomsCleaningRate).times(totalCleanedRooms),
      totalRefreshRoomsCost: new Prisma.Decimal(refreshRooms).times(refreshRooms)
    }
  })

  resp(res, newRecord)
}