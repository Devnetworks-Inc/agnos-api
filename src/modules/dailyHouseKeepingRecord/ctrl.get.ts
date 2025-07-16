import { Request, Response } from "express";
import resp from "objectify-response";
import prisma from "../prisma";
import { IdParam } from "../id/schema";
import { AuthRequest } from "../auth.schema";
import { DailyHousekeepingRecordGetRequest, DailyHousekeepingRecordTimesheetDailyRequest, HousekeepingRecordGetMonthlyRequest } from "./schema";
import { subMonths, endOfDay, startOfDay, format  } from "date-fns";
import { getHousekeepingRecordGroupByMonthYearHotel } from "./services";
import { getEmployeesWorkLogGroupByMonthYearHotel } from "../employee/services";
import { Prisma } from "@prisma/client";

export const dailyHousekeepingRecordGetController = async (req: DailyHousekeepingRecordGetRequest, res: Response) => {
  const { role, currentHotelId } = req.auth!
  let hotelId = currentHotelId ?? undefined

  if (role !== 'agnos_admin') {
    if (!currentHotelId) {
      return resp(res, 'Unauthorized', 401)
    }
  } else {
    hotelId = req.query.hotelId
  }

  const { startDate, endDate } = req.query
  const s = startDate?.split('-')
  const e = endDate?.split('-')

  const dailyHousekeepingRecords = await prisma.daily_housekeeping_record.findMany({
    where: {
      date: {
        gte: s && new Date(Date.UTC(+s[0],+s[1]-1,+s[2])),
        lte: e && new Date(Date.UTC(+e[0],+e[1]-1,+e[2])),
      },
      hotelId
    },
    include: { hotel: { select: { name: true } } }
  })

  // Add totalSalary to each record
  const recordsWithSalaries = await Promise.all(
    dailyHousekeepingRecords.map(async (record) => {

      // const startDay = startOfDay(record.date);
      // const endDay = endOfDay(record.date);

      const totalSalary = await prisma.employee_work_log.aggregate({
        _sum: {
          salaryToday: true,
        },
        where: {
          date: record.date,
          // checkInDate: { gte: startDay, lte: endDay },
          // checkOutDate: { gte: startDay, lte: endDay },
          employee: {
            hotelId: record.hotelId,
          },
        },
      });

      // const workLogsPerDay = await prisma.employee_work_log.findMany({
      //   where: {
      //     checkInDate: { gte: startDay, lte: endDay },
      //     checkOutDate: { gte: startDay, lte: endDay }
      //    }
      // })

      return {
        ...record,
        totalSalary: totalSalary._sum.salaryToday ?? 0
        // workLogsPerDay
      };
    })
  );

  return resp(res, recordsWithSalaries)
}

export const dailyHousekeepingRecordGetByIdController = async (req: Request<IdParam> & AuthRequest, res: Response) => {
  const id = +req.params.id
  const dailyHousekeepingRecord = await prisma.daily_housekeeping_record.findUnique({
    where: { id },
    include: {
      hotel: { select: { name: true, services: { select: { id: true, service: { select: { name: true } } } } } },
      services: true
    }
  });
  if (!dailyHousekeepingRecord) {
    return resp(res, 'Record not found', 404)
  }

  resp(res, dailyHousekeepingRecord)
}

export const housekeepingRecordGetMonthlyController = async (req: HousekeepingRecordGetMonthlyRequest, res: Response) => {
  const { role, currentHotelId } = req.auth!
  const { startDate: s, endDate: e } = req.query
  const today = new Date()
  const startDate = s ? new Date(s) : subMonths(today, 12)
  const endDate = e ? new Date(e) : today
  let hotelId = currentHotelId

  if (role !== 'agnos_admin') {
    if (!currentHotelId) {
      return resp(res, 'Unauthorized', 401)
    }
  } else {
    hotelId = req.query.hotelId
  }

  if (startDate > endDate) {
    return resp(res, 'Start date must be lesser than End date')
  }

  const [record, workLog] = await Promise.all([
    getHousekeepingRecordGroupByMonthYearHotel(startDate, endDate, hotelId),
    getEmployeesWorkLogGroupByMonthYearHotel(startDate, endDate, hotelId)
  ])

  resp(res, { record, workLog })
}

export const dailyHousekeepingRecordTimesheetDailyController = async (req: DailyHousekeepingRecordTimesheetDailyRequest, res: Response) => {
  const { role, currentHotelId } = req.auth!
  let hotelId = currentHotelId ?? undefined

  if (role !== 'agnos_admin') {
    if (!currentHotelId) {
      return resp(res, 'Unauthorized', 401)
    }
  } else {
    hotelId = req.query.hotelId
  }

  const { date = format(new Date(), 'yyyy-MM-dd')} = req.query
  const dateSplit = date.split('-')
  const d = dateSplit && new Date( Date.UTC(+dateSplit[0], +dateSplit[1]-1, +dateSplit[2]) )

  const [employees, workLogs, records] = await prisma.$transaction([
      prisma.employee.aggregate({
      where: {
        hotelId,
        OR: [{ user: { role: { notIn: ["check_in_assistant", 'hsk_manager', 'gouvernante', 'public_cleaner', 'agnos_admin'] } } }, { user: null }],
      },
      _count: { id: true }
    }),
    prisma.employee_work_log.findMany({
      where: {
        date: d,
        employee: {
          hotelId,
          OR: [
            { user: { role: { notIn: ["check_in_assistant", 'hsk_manager', 'gouvernante', 'public_cleaner', 'agnos_admin'] } } },
            { user: null }
          ] 
        },
      },
    }),
    prisma.daily_housekeeping_record.aggregate({
      _sum: { totalCleanedRooms: true }, 
      where: {
        date: d,
        hotelId
      },
    })
  ])

  let hours = new Prisma.Decimal(0)
  let cost = new Prisma.Decimal(0)
  const staff = employees._count.id ?? 0
  const totalCleanedRooms = records._sum.totalCleanedRooms ?? 0

  for (const log of workLogs) {
    const { totalSeconds, salaryToday } = log
    hours = hours.plus((totalSeconds ?? 0) / 3600).toDecimalPlaces(2)
    cost = cost.plus(salaryToday)
  }

  const ATR = totalCleanedRooms ? (hours.dividedBy(totalCleanedRooms * 60).toDecimalPlaces(2)).toNumber() : 0
  const ACR = totalCleanedRooms ? (cost.dividedBy(totalCleanedRooms).toDecimalPlaces(2)).toNumber() : 0
  const RPE = totalCleanedRooms ? +(staff / totalCleanedRooms).toFixed(2) : 0

  return resp(res, { ATR, ACR, RPE })
}
