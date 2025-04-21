import { Request, Response } from "express";
import resp from "objectify-response";
import prisma from "../prisma";
import { IdParam } from "../id/schema";
import { AuthRequest } from "../auth.schema";
import { DailyHousekeepingRecordGetRequest, MonthlyHousekeepingRecordGetRequest } from "./schema";
import { addMonths, differenceInMonths, subMonths } from "date-fns";
import { format } from "date-fns";

export const dailyHousekeepingRecordGetController = async (req: DailyHousekeepingRecordGetRequest, res: Response) => {
  const { startDate, endDate } = req.query
  const s = startDate?.split('-')
  const e = endDate?.split('-')

  const dailyHousekeepingRecords = await prisma.daily_housekeeping_record.findMany({
    where: { date: {
      gte: s && new Date(Date.UTC(+s[0],+s[1]-1,+s[2])),
      lte: e && new Date(Date.UTC(+e[0],+e[1]-1,+e[2])),
    }},
    include: { hotel: { select: { name: true } } }
  })

  return resp(res, dailyHousekeepingRecords)
}

export const dailyHousekeepingRecordGetByIdController = async (req: Request<IdParam> & AuthRequest, res: Response) => {
  const id = +req.params.id
  const dailyHousekeepingRecord = await prisma.daily_housekeeping_record.findUnique({
    where: { id },
    include: { hotel: { select: { name: true } } }
  });
  if (!dailyHousekeepingRecord) {
    return resp(res, 'Record not found', 404)
  }

  resp(res, dailyHousekeepingRecord)
}

export const monthlyHousekeepingRecordGetController = async (req: MonthlyHousekeepingRecordGetRequest, res: Response) => {
  const { role, currentHotelId } = req.auth!
  let hotelId = req.query.hotelId ? +req.query.hotelId : undefined
  const { startDate: s, endDate: e } = req.query
  const today = new Date()
  const startDate = s ? new Date(s) : subMonths(today, 12)
  const endDate = e ? new Date(e) : today

  if (role !== 'agnos_admin') {
    if (!currentHotelId) {
      return resp(res, 'Unauthorized', 401)
    }
    hotelId = currentHotelId
  } else if (role === 'agnos_admin' && !hotelId) {
    return resp(res, 'Hotel is required', 400)
  }

  if (startDate > endDate) {
    return resp(res, 'Start date must be lesser than End date')
  }

  const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } })
  if (!hotel) {
    return resp(res, 'Hotel not found', 404)
  }
  const monthLength = differenceInMonths(endDate, startDate) + 1

  const data: any = []

  const [record, workLog, employees] = await prisma.$transaction([
    prisma.daily_housekeeping_record.groupBy({
      by: ['year', 'month', 'hotelId'],
      where: { hotelId, date: { gte: startDate, lte: endDate } },
      _avg: { occupancyPercentage: true },
      _sum: {
        numberOfRoomNights: true,
        departureRooms: true,
        stayOverRooms: true,
        dirtyRoomsLastDay: true,
        dayUseRooms: true,
        extraCleaningRooms: true,
        noServiceRooms: true,
        lateCheckoutRooms: true,
        refreshRooms: true,
        roomsCarryOver: true,
        totalCleanedRooms: true,
        totalRefreshRooms: true,
        totalHousekeepingManagerCost: true,
        totalHousekeepingCleanerCost: true,
        totalCleanedRoomsCost: true,
        totalRefreshRoomsCost: true
      },
      orderBy: [{ year: 'asc' }, { month: 'asc' }]
    }),
    prisma.employee_work_log.groupBy({
      by: ['year', 'month', 'employeeId'],
      where: {
        employee: { hotelId },
        date: { gte: startDate, lte: endDate }
      },
      _sum: { totalSeconds: true },
      orderBy: [{ year: 'asc' }, { month: 'asc' }]
    }),
    prisma.employee.findMany({
      where: { hotelId }
    })
  ])

  const recordMap = new Map<string, typeof record[0]>()
  const workLogMap = new Map<string, typeof workLog[0]>()

  record.forEach(v => recordMap.set(`${v.year}-${String(v.month).padStart(2, '0')}`, v))
  workLog.forEach(v => workLogMap.set(`${v.year}-${String(v.month).padStart(2, '0')}-${v.employeeId}`, v))

  let d = startDate
  do {
    let yearMonth = format(d, 'yyyy-MM')
    data.push({
      year: format(d, 'yyyy'),
      month: format(d, 'MM'),
      hotelId: hotel.id,
      hotelName: hotel.name,
      occupancyPercentage: recordMap.get(yearMonth)?._avg?.occupancyPercentage,
      numberOfRoomNights: recordMap.get(yearMonth)?._sum?.numberOfRoomNights,
      departureRooms: recordMap.get(yearMonth)?._sum?.departureRooms,
      stayOverRooms: recordMap.get(yearMonth)?._sum?.stayOverRooms,
      dirtyRoomsLastDay: recordMap.get(yearMonth)?._sum?.dirtyRoomsLastDay,
      dayUseRooms: recordMap.get(yearMonth)?._sum?.dayUseRooms,
      extraCleaningRooms: recordMap.get(yearMonth)?._sum?.extraCleaningRooms,
      noServiceRooms: recordMap.get(yearMonth)?._sum?.noServiceRooms,
      lateCheckoutRooms: recordMap.get(yearMonth)?._sum?.lateCheckoutRooms,
      refreshRooms: recordMap.get(yearMonth)?._sum?.refreshRooms,
      roomsCarryOver: recordMap.get(yearMonth)?._sum?.roomsCarryOver,
      totalCleanedRooms:  recordMap.get(yearMonth)?._sum?.totalCleanedRooms,
      totalRefreshRooms:  recordMap.get(yearMonth)?._sum?.totalRefreshRooms,
      totalHousekeepingManagerCost:  recordMap.get(yearMonth)?._sum?.totalHousekeepingManagerCost,
      totalHousekeepingCleanerCost:  recordMap.get(yearMonth)?._sum?.totalHousekeepingCleanerCost,
      totalCleanedRoomsCost:  recordMap.get(yearMonth)?._sum?.totalCleanedRoomsCost,
      totalRefreshRoomsCost:  recordMap.get(yearMonth)?._sum?.totalRefreshRoomsCost,
      employeesWorkLog: employees.map(({ id, firstName, middleName, lastName }) => ({
        employeeId: id,
        firstName, middleName, lastName,
        hoursWork: ((workLogMap.get(`${yearMonth}-${id}`)?._sum?.totalSeconds || 0) / 3600).toFixed(2),
        totalSeconds: workLogMap.get(`${yearMonth}-${id}`)?._sum?.totalSeconds
      }))
    })
    d = addMonths(d, 1)
  } while (data.length < monthLength)


  resp(res, data)
}