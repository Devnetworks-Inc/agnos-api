import { NextFunction, Response, Request } from "express";
import resp from "objectify-response";
import { DailyHousekeepingRecordUpdateRequest } from "./schema";
import prisma from "../prisma";
import { Prisma } from "@prisma/client";
import { AuthRequest } from "../auth.schema";
import { IdParam } from "../id/schema";
import { toDecimalPlaces } from "src/utils/helper";

export const dailyHousekeepingRecordUpdateController = async (req: DailyHousekeepingRecordUpdateRequest, res: Response, next: NextFunction) => {
  const { id, hotelId, services, date: dt } = req.body


  const record = await prisma.daily_housekeeping_record.findUnique({
    where: { id },
    include: { hotel: { select: { roomsCleaningRate: true, roomsRefreshRate: true, numberOfRooms: true } } }
  })

  if (!record) {
    return resp(res, 'Record to update does not exist.', 400)
  }

  let roomsCleaningRate = record.hotel.roomsCleaningRate
  let roomsRefreshRate = record.hotel.roomsRefreshRate
  let date = dt ? new Date(dt) : record.date

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
      return resp(res, 'Some services does not exist', 404)
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
  const yearMonthDayArr = date.toISOString().split('-')

  const newRecord = await prisma.daily_housekeeping_record.update({
    where: { id },
    data: {
      ...req.body,
      date,
      month: +yearMonthDayArr[1],
      year: +yearMonthDayArr[0],
      totalCleanedRooms,
      ttcPercent: toDecimalPlaces((totalCleanedRooms / record.hotel.numberOfRooms) * 100, 2),
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

export const dailyHousekeepingRecordApproveController = async (req: Request<IdParam> & AuthRequest, res: Response) => {
  const { id, role, currentHotelId } = req.auth!

  if (!currentHotelId) {
    return resp(res, 'Unauthorized', 401)
  }

  const update: Prisma.daily_housekeeping_recordUncheckedUpdateInput = {}
  
  if (role === 'hotel_manager') {
    update.approvedByHotelManagerId = id
    update.hotelManagerApprovedDate = new Date()
  } else if (role === 'hsk_manager') {
    update.approvedByHskManagerId = id
    update.hskManagerApprovedDate = new Date()
  }

  await prisma.daily_housekeeping_record.update({
    where: { id: +req.params.id, hotelId: currentHotelId },
    data: update
  })

  resp (res, update)
}