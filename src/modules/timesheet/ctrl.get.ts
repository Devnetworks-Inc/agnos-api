import resp from "objectify-response";
import { RateType } from "../employee/schema";
import prisma from "../prisma";
import { employee_break_log, employee_status, Prisma, role } from "@prisma/client";
import { TimesheetGetDailyRequest } from "./schema";
import { Response } from "express";
import { format } from "date-fns";
import { LATE_SHIFT_START_HOUR } from "src/utils/constants";

type TimesheetData = {
  workLogId?: number;
  date: Date;
  employeeId: number | null;
  positionId: number;
  checkInDate?: Date | null;
  checkOutDate?: Date | null;
  totalSeconds?: number | null;
  totalSecondsBreak?: number | null;
  totalHours?: number,
  netHours?: number,
  role: role | null;
  rate: number;
  rateType: RateType;
  hourlyRate?: number | Prisma.Decimal | null;
  salaryToday?: number | Prisma.Decimal | null;
  overtimeRate?: number | null;
  overtimeSeconds?: number | null;
  status: employee_status | 'Inactive';
  year: number;
  month: number;
  comment?: string | null;
  breaks?: employee_break_log[];
  editLogs?: { id: number }[];
  employeeName: string;
  hotelName: string;
  employee: {
    id: number;
    firstName: string;
    middleName: string;
    lastName: string;
    hotel: { id: number, name: string },
  };
  isLateShift?: boolean;
}

export const timesheetGetDailyController = async (
  req: TimesheetGetDailyRequest,
  res: Response
) => {
  const { role, currentHotelId } = req.auth!;
  let { hotelId, date = format(new Date(), 'yyyy-MM-dd') } = req.query;
  const [year, month, day] = date?.split('-')
  const dateUtc = new Date(Date.UTC(+year, +month - 1, +day ))

  if (role !== "agnos_admin" && role !== "hsk_manager") {
    if (!currentHotelId) {
      return resp(res, "Unauthorized", 401);
    }
    hotelId = currentHotelId;
  }

  const positions = await prisma.position.findMany({
    where: {
      role: { notIn: ['check_in_assistant', 'agnos_admin'] },
      employee: { hotelId },
    },
    include: {
      workLogs: {
        where: { date: dateUtc },
        include: {
          breaks: true,
          editLogs: { select: { id: true }, orderBy: { date: "desc" } },
        },
        orderBy: { checkInDate: 'asc' }
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

  const data: TimesheetData[] = []

  positions.forEach(({ id, rate, rateType, role, employee, workLogs }) => {
    if (!workLogs.length) {
      data.push({
        date: dateUtc,
        employeeId: employee.id,
        positionId: id,
        role,
        rate,
        rateType: rateType as RateType,
        status: 'Inactive',
        year: +year,
        month: +month,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        hotelName: employee.hotel.name,
        employee
      })
      return;
    }

    for (const log of workLogs) {
      const { totalSeconds, totalSecondsBreak } = log

      const totalHours = +(
        ((totalSeconds ?? 0) + (totalSecondsBreak ?? 0)) / 3600
      ).toFixed(2)

      const netHours = +((totalSeconds ?? 0) / 3600).toFixed(2)

      data.push({
        ...log,
        totalHours,
        netHours,
        rateType: log.rateType as RateType,
        positionId: id,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        hotelName: employee.hotel.name,
        employee,
        isLateShift: log.checkInDate ? log.checkInDate.getHours() >= LATE_SHIFT_START_HOUR : false,
      })
    }
  })

  resp(res, data);
}