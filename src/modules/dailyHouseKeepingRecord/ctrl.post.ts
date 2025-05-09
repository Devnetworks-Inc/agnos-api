import resp from "objectify-response";
import { NextFunction, Response } from "express";
import prisma from "../prisma";
import { DailyHousekeepingRecordCreateRequest } from "./schema";
import { hotel_service, Prisma } from "@prisma/client";
import { toDecimalPlaces } from "src/utils/helper";

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
    hotelId,
    services,
    date
  } = req.body

  const [hotel, hotelServices] = await prisma.$transaction([
    prisma.hotel.findUnique({ where: { id: hotelId } }),
    prisma.hotel_service.findMany({
      where: { id: { in: services } },
      select: {
        id: true,
        serviceRate: true,
        service: true
      }
    })
  ])

  if (!hotel) {
    return resp(res, "Hotel does not exist.", 404);
  }

  if (services.length > hotelServices.length) {
    return resp(res, 'Some services does not exist', 404)
  }

  const map = hotelServices.reduce((acc, current) => 
    acc.set(current.id, current),
    new Map<number, typeof hotelServices[0]>()
  )

  const totalCleanedRooms = dr + sor + drld + dur + ecr
  const yearMonthDayArr = date.split('-')

  const ttcPercent = toDecimalPlaces((totalCleanedRooms / (hotel.numberOfRooms || 1)) * 100, 2)

  await prisma.daily_housekeeping_record.create({
    data: {
      ...req.body,
      date: date+"T00:00:00.000Z",
      month: +yearMonthDayArr[1],
      year: +yearMonthDayArr[0],
      totalCleanedRooms,
      ttcPercent,
      totalRefreshRooms: refreshRooms,
      totalCleanedRoomsCost: new Prisma.Decimal(hotel.roomsCleaningRate).times(totalCleanedRooms),
      totalRefreshRoomsCost: new Prisma.Decimal(refreshRooms).times(refreshRooms),
      services: map.size ? {
        createMany: { data: Array.from(map.values(), (v) => ({
          hotelServiceId: v.id,
          serviceName: v.service.name,
          totalCost: v.serviceRate
        }))}
      } : undefined
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
