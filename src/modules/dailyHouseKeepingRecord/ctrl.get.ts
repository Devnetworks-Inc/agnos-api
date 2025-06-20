import { Request, Response } from "express";
import resp from "objectify-response";
import prisma from "../prisma";
import { IdParam } from "../id/schema";
import { AuthRequest } from "../auth.schema";
import { DailyHousekeepingRecordGetRequest, HousekeepingRecordGetMonthlyRequest } from "./schema";
import { subMonths, endOfDay, startOfDay  } from "date-fns";
import { getHousekeepingRecordGroupByMonthYearHotel } from "./services";
import { getEmployeesWorkLogGroupByMonthYearHotel } from "../employee/services";

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
