import resp from "objectify-response";
import { NextFunction, Response } from "express";
import prisma from "../prisma";
import { EmployeeBreakLogCreate, EmployeeCreateRequest, EmployeeCreateShareableUrlRequest, EmployeeWorkLogCreateRequest, RateType } from "./schema";
import { nanoid } from "nanoid";
import { employee_status, Prisma } from "@prisma/client";
import { differenceInSeconds } from "date-fns";
import { calculateSalary, getHourlyRate } from "src/utils/helper";

export const employeeCreateController = async (req: EmployeeCreateRequest, res: Response, next: NextFunction) => {
  const { hotelId } = req.body

  const employee = await prisma.employee.create({
    data: {
      ...req.body,
      hotelId,
      status: "checked_out",
    }
  })

  resp(res, employee)
};

export const employeeCreateShareableUrlController = async (req: EmployeeCreateShareableUrlRequest, res: Response, next: NextFunction) => {
  const { id, expiryDate } = req.body

  const { shareableUrl, urlExpiryDate } = await prisma.employee.update({
    where: { id },
    data: {
      shareableUrl: nanoid(),
      urlExpiryDate: expiryDate
    }
  })

  resp(res, { shareableUrl, urlExpiryDate })
};

export const employeeCreateWorkLogController = async (
  req: EmployeeWorkLogCreateRequest,
  res: Response,
  next: NextFunction
) => {
  const { id: userId } = req.auth!
  let { breaks = [], employeeId, comment } = req.body;
  let status: employee_status = 'checked_in'

  const date = req.body.date+"T00:00:00.000Z"
  const checkInDate = new Date(req.body.checkInDate)
  const checkOutDate = req.body.checkOutDate && new Date(req.body.checkOutDate)
  const newBreaks: (EmployeeBreakLogCreate & { totalSeconds?: number })[] = []

  const employee = await prisma.employee.findUnique({ where: { id: employeeId }, select: {
    rate: true,
    rateType: true,

  }})

  if (!employee) {
    return resp(res, 'Employee not found', 404)
  }

  let totalSeconds = 0
  let lastBreak: EmployeeBreakLogCreate | undefined
  let salaryToday: Prisma.Decimal | undefined
  let hourlyRate = getHourlyRate(employee.rateType as RateType, employee.rate)

  if (breaks.length) {
    for (const val of breaks) {
      const breakStartDate = new Date(val.breakStartDate)
      const breakEndDate = val.breakEndDate && new Date(val.breakEndDate)
      const lastEndBreak = lastBreak?.breakEndDate && new Date(lastBreak.breakEndDate)
      

      if (lastBreak && !lastEndBreak) {
        return resp(res, "End-Break are required in previous breaks")
      }
      if (breakStartDate < checkInDate) {
        return resp(res, "Break Start time should be greater than Check-In time", 400)
      }
      if (lastEndBreak && breakStartDate < lastEndBreak) {
        return resp(res, "Start-Break should be greater than previous End-Break")
      }
      if (breakEndDate && breakEndDate < breakStartDate) {
        return resp(res, "End-Break must be greater than Start-Break", 400);
      }
      lastBreak = val
      const seconds = breakEndDate ? differenceInSeconds(breakEndDate, breakStartDate) : 0
      newBreaks.push({ ...val, totalSeconds: seconds})
    }
  }

  if (lastBreak && !lastBreak.breakEndDate) {
    status = 'on_break'
  }

  if (checkOutDate) {
    const { breakEndDate } = lastBreak ?? {}
    if (status === 'on_break') {
      return resp(res, "Cannot check-out if employee is on break", 400);
    }
    if (checkOutDate < checkInDate) {
      return resp(res, "Check-Out date must be greater than Check-In date", 400);
    }
    if (breakEndDate && (new Date(breakEndDate) > checkOutDate)) {
      return resp(res, "Check-Out date must be greater than Break End date", 400);
    }

    const breakTotalSeconds = newBreaks.reduce(
      (acc, val) => acc + (val.totalSeconds ?? 0),
      0
    );

    totalSeconds =
      differenceInSeconds(checkOutDate, checkInDate) - breakTotalSeconds;

    status = 'checked_out'
    salaryToday = calculateSalary(hourlyRate, totalSeconds)    
  }

  const yearMonthDayArr = date.split('-')

  const [workLog, updatedEmployee] = await prisma.$transaction([
    prisma.employee_work_log.create({
      data: {
        employeeId,
        date,
        rate: employee.rate,
        rateType: employee.rateType,
        hourlyRate,
        salaryToday,
        month: +yearMonthDayArr[1],
        year: +yearMonthDayArr[0],
        checkInDate,
        checkOutDate,
        totalSeconds,
        status,
        breaks: newBreaks.length ? {
          create: newBreaks
        } : undefined,
        editLogs: {
          create: {
            editorId: userId,
            date: new Date(),
            comment
          }
        }
      },
      include: { breaks: true }
    }),
    prisma.employee.update({
      where: { id: employeeId },
      data: {
        status,
      },
      select: { id: true, status: true }
    })
  ])

  resp(res, {...updatedEmployee, workLog})  
};
