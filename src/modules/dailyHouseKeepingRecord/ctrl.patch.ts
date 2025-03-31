import { NextFunction, Response } from "express";
import resp from "objectify-response";
import { DailyHousekeepingRecordUpdateRequest } from "./schema";
import prisma from "../prisma";
import { Prisma } from "@prisma/client";

export const dailyHousekeepingRecordUpdateController = async (req: DailyHousekeepingRecordUpdateRequest, res: Response, next: NextFunction) => {
  const { id, hotelId, services } = req.body

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

  let map: Map<number, {
    id: number;
    serviceRate: number;
    service: {
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
    };
  }> | undefined

  if (services) {
    const hotelServices = await prisma.hotel_service.findMany({
      where: { id: { in: services } },
      select: {
        id: true,
        serviceRate: true,
        service: true
      }
    })
    if (services.length > hotelServices.length) {
      return resp(res, 'Some services does not exist', 401)
    }
  
    map = hotelServices.reduce((acc, current) => 
      acc.set(current.id, current),
      new Map<number, typeof hotelServices[0]>()
    )
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

  const newRecord = await prisma.daily_housekeeping_record.update({
    where: { id },
    data: {
      ...req.body,
      totalCleanedRooms,
      totalRefreshRooms: refreshRooms,
      totalCleanedRoomsCost: new Prisma.Decimal(roomsCleaningRate).times(totalCleanedRooms),
      totalRefreshRoomsCost: new Prisma.Decimal(refreshRooms).times(refreshRooms),
      services: map && {
        deleteMany: {},
        createMany: { data: Array.from(map.values(), (v) => ({
          hotelServiceId: v.id,
          serviceName: v.service.name,
          totalCost: v.serviceRate
        }))}
      }
    }
  })

  resp(res, newRecord)
}