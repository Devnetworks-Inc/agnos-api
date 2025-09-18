import resp from "objectify-response";
import { EmployeeGetWorkLogsByMonthRequest, RateType } from "../employee/schema";
import prisma from "../prisma";
import { employee_break_log, employee_status, Prisma, role } from "@prisma/client";
import { TimesheetGetDailyRequest, TimesheetGetMonthlyRequest } from "./schema";
import { Response } from "express";
import { endOfMonth, format, lastDayOfMonth } from "date-fns";
import { LATE_SHIFT_START_HOUR } from "src/utils/constants";

type TimesheetDailyData = {
  workLogId?: number;
  date: Date;
  employeeId?: number | null;
  positionId?: number | null;
  checkInDate?: Date | null;
  checkOutDate?: Date | null;
  totalSeconds?: number | null;
  totalSecondsBreak?: number | null;
  totalHours?: number,
  netHours?: number,
  role: role | null;
  rate: number;
  rateType: RateType;
  cost: number;
  hourlyRate?: number | Prisma.Decimal | null;
  salaryToday?: number | Prisma.Decimal | null;
  overtimeRate?: number | null;
  overtimeSeconds?: number | null;
  status: employee_status;
  year: number;
  month: number;
  comment?: string | null;
  breaks?: employee_break_log[];
  editLogs?: { id: number }[];
  employeeName: string;
  hotelName: string;
  employee?: {
    id: number;
    firstName: string;
    middleName: string;
    lastName: string;
    hotel: { id: number, name: string },
  } | null;
  isLateShift?: boolean;
}

export const timesheetGetDailyController = async (
  req: TimesheetGetDailyRequest,
  res: Response
) => {
  const { role, currentHotelId } = req.auth!;
  let { hotelId, date = format(new Date(), 'yyyy-MM-dd') } = req.query;
  const [year, month, day] = date?.split('-')
  const dateUtc = new Date(Date.UTC(+year, +month - 1, +day))
  const lastOfMonth = lastDayOfMonth(new Date(+year, +month - 1, +day))
  
  const lastDateOfMonth = lastOfMonth.getDate()

  if (role !== "agnos_admin" && role !== "hsk_manager") {
    if (!currentHotelId) {
      return resp(res, "Unauthorized", 401);
    }
    hotelId = currentHotelId;
  }

  const getWorkLogs = prisma.employee_work_log.findMany({
    where: {
      date: dateUtc,
      employee: { hotelId },
      position: { role: { 
        notIn: ['check_in_assistant', 'agnos_admin'] 
      }}
    },
    include: {
      breaks: true,
      editLogs: { select: { id: true }, orderBy: { date: "desc" } },
      position: true,
      employee: { select: {
        id: true,
        firstName: true,
        middleName: true,
        lastName: true,
        hotel: { select: { id: true, name: true } },
      }}
    },
    orderBy: { checkInDate: 'asc' }
  })

  const getPositions = prisma.position.findMany({
    where: {
      role: { notIn: ['check_in_assistant', 'agnos_admin'] },
      employee: { hotelId },
      // isInactive: false,
      OR: [
        { createdAt: { lte: lastOfMonth } },
        { createdAt: null, employee: {  createdAt: { lte: lastOfMonth  } } }
      ]
    },
    include: {
      rateChanges: {
        where: {
          OR: [
            { 
              effectivityStartYear: { lte: +year }, effectivityStartMonth: { lte: +month },
              effectivityEndYear: { gte: +year }, effectivityEndMonth: { gte: +month },
            },
            { 
              effectivityStartYear: { lte: +year }, effectivityStartMonth: { lte: +month },
              effectivityEndDate: null,
            },
          ]
        },
        take: 1, orderBy: { effectivityStartDate: 'desc' }
      },
      employee: { select: {
        id: true,
        firstName: true,
        middleName: true,
        lastName: true,
        hotel: { select: { id: true, name: true } },
      }}
    }
  })

  const [workLogs, positions] = await prisma.$transaction([getWorkLogs, getPositions])

  const positionsMap = new Map<number, typeof positions[0]>()

  positions.forEach(pos => positionsMap.set(pos.id, pos))


  // const positions = await prisma.position.findMany({
  //   where: {
  //     role: { notIn: ['check_in_assistant', 'agnos_admin'] },
  //     employee: { hotelId },
  //   },
  //   include: {
  //     workLogs: {
  //       where: { date: dateUtc },
  //       include: {
  //         breaks: true,
  //         editLogs: { select: { id: true }, orderBy: { date: "desc" } },
  //       },
  //       orderBy: { checkInDate: 'asc' }
  //     }, 
  //     employee: { select: {
  //       id: true,
  //       firstName: true,
  //       middleName: true,
  //       lastName: true,
  //       hotel: { select: { id: true, name: true } },
  //     }}
  //   }
  // })

  const data: TimesheetDailyData[] = []

  for (const log of workLogs) {
    const { totalSeconds, totalSecondsBreak } = log

    const totalHours = +(
      ((totalSeconds ?? 0) + (totalSecondsBreak ?? 0)) / 3600
    ).toFixed(2)

    const netHours = +((totalSeconds ?? 0) / 3600).toFixed(2)

    log.positionId && positionsMap.delete(log.positionId)

    const rate = log.rateType === 'monthly' ? 
        new Prisma.Decimal(log.rate).dividedBy(lastDateOfMonth).toDecimalPlaces(5).toNumber() : log.rate

    data.push({
      ...log,
      totalHours,
      netHours,
      rateType: log.rateType as RateType,
      employeeName: log.employee ? `${log.employee.firstName} ${log.employee.lastName}` : '',
      hotelName: log.employee ? log.employee.hotel.name : '',
      employee: log.employee,
      isLateShift: log.checkInDate ? log.checkInDate.getHours() >= LATE_SHIFT_START_HOUR : false,
      rate,
      cost: log.rateType === 'monthly' ? rate : log.salaryToday.toNumber()
    })
  }

  // add inactive status positions
  for (const [key, value] of positionsMap) {
    const rate = value.rateType === 'monthly' ? 
        new Prisma.Decimal(value.rate).dividedBy(lastDateOfMonth).toDecimalPlaces(5).toNumber() : value.rate

    data.push({
      date: dateUtc,
      employeeId: value.employeeId,
      positionId: value.id,
      role: value.role,
      rateType: value.rateType as RateType,
      status: 'inactive',
      year: +year,
      month: +month,
      employeeName: `${value.employee.firstName} ${value.employee.lastName}`,
      hotelName: value.employee.hotel.name,
      employee: value.employee,
      rate,
      cost: value.rateType === 'monthly' ? rate : 0
    })
  }

  // positions.forEach(({ id, rate, rateType, role, employee, workLogs }) => {
  //   if (!workLogs.length) {
  //     data.push({
  //       date: dateUtc,
  //       employeeId: employee.id,
  //       positionId: id,
  //       role,
  //       rate,
  //       rateType: rateType as RateType,
  //       status: 'Inactive',
  //       year: +year,
  //       month: +month,
  //       employeeName: `${employee.firstName} ${employee.lastName}`,
  //       hotelName: employee.hotel.name,
  //       employee
  //     })
  //     return;
  //   }

  //   for (const log of workLogs) {
  //     const { totalSeconds, totalSecondsBreak } = log

  //     const totalHours = +(
  //       ((totalSeconds ?? 0) + (totalSecondsBreak ?? 0)) / 3600
  //     ).toFixed(2)

  //     const netHours = +((totalSeconds ?? 0) / 3600).toFixed(2)

  //     data.push({
  //       ...log,
  //       totalHours,
  //       netHours,
  //       rateType: log.rateType as RateType,
  //       positionId: id,
  //       employeeName: `${employee.firstName} ${employee.lastName}`,
  //       hotelName: employee.hotel.name,
  //       employee,
  //       isLateShift: log.checkInDate ? log.checkInDate.getHours() >= LATE_SHIFT_START_HOUR : false,
  //     })
  //   }
  // })

  resp(res, data);
}

export const timesheetGetMonthlyController = async (
  req: TimesheetGetMonthlyRequest,
  res: Response
) => {
  const { currentHotelId, role } = req.auth!
  const today = new Date()
  const { year = today.getFullYear(), month = today.getMonth() + 1 } = req.query;
  const lastOfMonth = endOfMonth(new Date(year, month - 1, 1))
  let hotelId: number | undefined

  if (role !== 'agnos_admin') {
    if (!currentHotelId) return resp(res, 'Unauthorized', 401)
    hotelId = currentHotelId
  } else {
    hotelId = req.query.hotelId
  }

  const [workLogs, positions] = await prisma.$transaction([
    prisma.employee_work_log.groupBy({
      by: ["employeeId", "positionId"],
      where: {
        year, month,
        employee: { hotelId },
        position: {
          role: { notIn: ['check_in_assistant', 'agnos_admin'] },
        },
      },
      _sum: { totalSeconds: true, totalSecondsBreak: true, salaryToday: true },
      orderBy: { employeeId: "asc" },
    }),
    prisma.position.findMany({
      where: {
        employee: { hotelId }, role: { notIn: ['check_in_assistant', 'agnos_admin'] },
        OR: [
          { createdAt: { lte: lastOfMonth } },
          { createdAt: null, employee: {  createdAt: { lte: lastOfMonth  } } }
        ]
      },
      select: {
        id: true,
        rate: true,
        rateType: true,
        role: true,
        employee: { select: {
          id: true,
          firstName: true,
          middleName: true,
          lastName: true,
          // rate: true,
          // rateType: true,
          // position: true,
          hotelId: true,
          hotel: { select: { name: true } }
        }},
        rateChanges: {
          where: {
            OR: [
              { 
                effectivityStartYear: { lte: +year }, effectivityStartMonth: { lte: +month },
                effectivityEndYear: { gte: +year }, effectivityEndMonth: { gte: +month },
              },
              { 
                effectivityStartYear: { lte: +year }, effectivityStartMonth: { lte: +month },
                effectivityEndDate: null,
              },
            ]
          },
          take: 1, orderBy: { effectivityStartDate: 'desc' }
        },
      },
    }),
  ]);
  const workLogMap = new Map<string, (typeof workLogs[0])>();
  workLogs.forEach((log) => {
    workLogMap.set(`${log.employeeId}${log.positionId}`, log);
  });

  const employeesWithWorkLog: any[] = []

  positions.forEach((p) => {
    const workLog = workLogMap.get(`${p.employee.id}${p.id}`) as typeof workLogs[0] || {}

    let { rate, rateType, rateChanges } = p
    let isInactive = false

    if (rateChanges.length) {
      rate = rateChanges[0].rate
      rateType = rateChanges[0].rateType
      isInactive = rateType === 'inactive'
    }

    !isInactive && employeesWithWorkLog.push({
      ...p.employee,
      rate: p.rate,
      rateType: p.rateType,
      position: p.role,
      year,
      month,
      hotel: p.employee.hotel.name,
      totalSeconds: workLog._sum?.totalSeconds ?? 0,
      totalSecondsBreak: workLog._sum?.totalSecondsBreak ?? 0,
      totalSalary: p.rateType === 'monthly' ? p.rate : (workLog._sum?.salaryToday?.toNumber() ?? 0)
    })
  });

  resp(res, employeesWithWorkLog)
}