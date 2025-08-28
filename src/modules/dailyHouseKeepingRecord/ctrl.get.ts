import { Request, Response } from "express";
import resp from "objectify-response";
import prisma from "../prisma";
import { IdParam } from "../id/schema";
import { AuthRequest } from "../auth.schema";
import { DailyHousekeepingRecordGetRequest, DailyHousekeepingRecordTimesheetDailyRequest, DailyHousekeepingRecordTimesheetMonthlyRequest, HousekeepingRecordGetMonthlyRequest } from "./schema";
import { subMonths, endOfDay, startOfDay, format, addDays  } from "date-fns";
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
        positions: { some: { role: { in: ['hotel_manager', 'hsk_staff'] } } }
        // position: { notIn: ['HSK Manager', 'Gouvernante', 'Public Cleaner'] },
        // OR: [{ user: { role: { notIn: ["check_in_assistant", 'hsk_manager', 'gouvernante', 'public_cleaner', 'agnos_admin'] } } }, { user: null }],
      },
      _count: { id: true }
    }),
    prisma.employee_work_log.findMany({
      where: {
        date: d,
        role: { notIn: ['agnos_admin', 'hsk_manager', 'gouvernante', 'public_cleaner', 'check_in_assistant'] },
        employee: {
          hotelId,
          // position: { notIn: ['HSK Manager', 'Gouvernante', 'Public Cleaner'] },
          // OR: [
          //   { user: { role: { notIn: ["check_in_assistant", 'hsk_manager', 'gouvernante', 'public_cleaner', 'agnos_admin'] } } },
          //   { user: null }
          // ] 
        },
      }
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
  // const staff = employees._count.id ?? 0
  const staff = new Set(workLogs.map(log => log.employeeId)).size;
  const totalCleanedRooms = records._sum.totalCleanedRooms ?? 0
  console.log(`totalCleanedRooms: ${totalCleanedRooms}`);
  
  for (const log of workLogs) {
    const { totalSeconds, salaryToday } = log
    hours = hours.plus((totalSeconds ?? 0) / 3600)
    cost = cost.plus(salaryToday)
    console.log(`total cost: ${cost}, salaryToday: ${salaryToday}`)
  }

  const ATR = totalCleanedRooms ? hours.dividedBy(totalCleanedRooms).times(60).toNumber() : 0
  const ACR = totalCleanedRooms ? (cost.dividedBy(totalCleanedRooms).toDecimalPlaces(2)).toNumber() : 0
  const RPE = totalCleanedRooms ? +(staff / totalCleanedRooms).toFixed(2) : 0

  return resp(res, { ATR, ACR, RPE })
}

export const dailyHousekeepingRecordTimesheetMonthlyController = async (req: DailyHousekeepingRecordTimesheetMonthlyRequest, res: Response) => {
  const { role, currentHotelId } = req.auth!
  let hotelId = currentHotelId ?? undefined

  if (role !== 'agnos_admin') {
    if (!currentHotelId) {
      return resp(res, 'Unauthorized', 401)
    }
  } else {
    hotelId = req.query.hotelId
  }

  const { yearMonth = format(new Date(), 'yyyy-MM')} = req.query
  const [ year, month ] = yearMonth.split('-')

  const [employees, workLogs, records] = await prisma.$transaction([
      prisma.employee.aggregate({
      where: {
        hotelId,
        positions: { some: { role: { in: ['hotel_manager', 'hsk_staff'] } } }
        // position: { notIn: ['HSK Manager', 'Gouvernante', 'Public Cleaner'] },
        // OR: [{ user: { role: { notIn: ["check_in_assistant", 'hsk_manager', 'gouvernante', 'public_cleaner', 'agnos_admin'] } } }, { user: null }],
      },
      _count: { id: true }
    }),
    prisma.employee_work_log.findMany({
      where: {
        year: +year,
        month: +month,
        role: { in: ['hotel_manager', 'hsk_staff'] },
        employee: {
          hotelId,
          // position: { notIn: ['HSK Manager', 'Gouvernante', 'Public Cleaner'] },
          // OR: [
          //   { user: { role: { notIn: ["check_in_assistant", 'hsk_manager', 'gouvernante', 'public_cleaner', 'agnos_admin'] } } },
          //   { user: null }
          // ] 
        },
      },
    }),
    prisma.daily_housekeeping_record.aggregate({
      _sum: { totalCleanedRooms: true }, 
      where: {
        year: +year,
        month: +month,
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
    hours = hours.plus((totalSeconds ?? 0) / 3600)
    cost = cost.plus(salaryToday)
  }

  const ATR = totalCleanedRooms ? hours.dividedBy(totalCleanedRooms).times(60).toNumber() : 0
  const ACR = totalCleanedRooms ? (cost.dividedBy(totalCleanedRooms).toDecimalPlaces(2)).toNumber() : 0
  const RPE = totalCleanedRooms ? +(staff / totalCleanedRooms).toFixed(2) : 0

  return resp(res, { ATR, ACR, RPE })
}

export const houseKeepingRecordGetDailyKPIController = async (req: DailyHousekeepingRecordGetRequest, res: Response) => {
  const { role, currentHotelId } = req.auth!
  let hotelId = currentHotelId ?? undefined

  if (role !== 'agnos_admin') {
    if (!currentHotelId) {
      return resp(res, 'Unauthorized', 401)
    }
  } else {
    hotelId = req.query.hotelId
  }

  const today = new Date()

  let { startDate, endDate } = req.query

  const sDate = startDate ? new Date(startDate) : new Date(format(today, 'yyyy-MM-dd'))
  const eDate = endDate ? new Date(endDate) : new Date(format(today, 'yyyy-MM-dd'))

  const employees = await prisma.employee.findMany({
    where: {
      hotelId,
      positions: { some: { role: { in: ['hotel_manager', 'hsk_staff'] } } },
      // position: { notIn: ['HSK Manager', 'Gouvernante', 'Public Cleaner'] },
      // OR: [{ user: { role: { notIn: ["check_in_assistant", 'hsk_manager', 'gouvernante', 'public_cleaner', 'agnos_admin'] } } }, { user: null }],
    },
  })

  const [workLogs, records] = await prisma.$transaction([
    prisma.employee_work_log.groupBy({
      by: ['date'],
      _sum: { totalSeconds: true, salaryToday: true },
      where: {
        employeeId: { in: employees.map(e => e.id) },
        date: { gte: sDate, lte: eDate }
      },
      orderBy: { date: 'asc' }
    }),
    prisma.daily_housekeeping_record.groupBy({
      by: ['date'],
      _sum: { totalCleanedRooms: true }, 
      where: {
        date: { gte: sDate, lte: eDate },
        hotelId
      },
      orderBy: { date: 'asc' }
    })
  ])

  const workLogsMapByDate = workLogs.reduce(
    (acc, val) => acc.set(val.date.valueOf(), val),
    new Map<number, typeof workLogs[0]>()
  )

  const recordsMapByDate = records.reduce(
    (acc, val) => acc.set(val.date.valueOf(), val),
    new Map<number, typeof records[0]>()
  )

  let dt = sDate
  const dates = [dt]

  // create array of dates up to end date
  while (dt < eDate) {
    dt = addDays(dt, 1)
    dates.push(dt)
  }

  const noOfEmployees = employees.length

  const response = dates.map(date => {
    const [year, month, day] = date.toISOString().split('T')[0].split('-')
    const dateValue = date.valueOf()
    const workLog = workLogsMapByDate.get(dateValue)
    const record = recordsMapByDate.get(dateValue)
  
    let hours = new Prisma.Decimal(workLog?._sum?.totalSeconds ?? 0).dividedBy(3600)
    let cost = workLog?._sum?.salaryToday ?? new Prisma.Decimal(0)
    const totalCleanedRooms = record?._sum?.totalCleanedRooms ?? 0

    const ATR = totalCleanedRooms ? hours.dividedBy(totalCleanedRooms).times(60).toNumber() : 0
    const ACR = totalCleanedRooms ? (cost.dividedBy(totalCleanedRooms).toDecimalPlaces(2)).toNumber() : 0
    const RPE = totalCleanedRooms ? +(noOfEmployees / totalCleanedRooms).toFixed(2) : 0
    
    return { ATR, ACR, RPE, year: +year, month: +month, day: +day }
  })

  resp(res, response)
}
