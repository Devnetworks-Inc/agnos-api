import { Request, Response } from "express";
import resp from "objectify-response";
import prisma from "../prisma";
import { EmployeeGetAttendancesRequest, EmployeeGetByUrlRequest, EmployeeGetRequest } from "./schema";
import { Prisma } from "@prisma/client";
import { IdParam } from "../id/schema";
import { AuthRequest } from "../auth.schema";
import { endOfDay, endOfMonth, startOfDay, startOfMonth } from "date-fns";

export const employeeGetController = async (req: EmployeeGetRequest, res: Response) => {
  const { role, currentHotelId } = req.auth!
  let { hotelId } = req.query
  const where: Prisma.employeeWhereInput = {}

  if (role !== 'agnos_admin' && role !== 'hsk_manager') {
    if (!currentHotelId) {
      return resp(res, 'Unauthorized', 401)
    }
    hotelId = currentHotelId
  }

  if (hotelId) {
    where.hotelId = hotelId
  }

  const employees = await prisma.employee.findMany({ where, include: { hotel: {select: { name: true }} } });
  resp(res, employees)
}

export const employeeGetByIdController = async (req: Request<IdParam> & AuthRequest, res: Response) => {
  const id = +req.params.id
  const today = new Date()
  const startDay = startOfDay(today)
  const endDay = endOfDay(today)
  const startMonth = startOfMonth(today)
  const endMonth = endOfMonth(today)

  const [employee, day, month, overall] = await prisma.$transaction([
    prisma.employee.findUnique({ where: { id }}),
    prisma.employee_work_log.aggregate({
      where: { checkInDate: { gte: startDay, lte: endDay } },
      _sum: {
        totalSeconds: true
      }
    }),
    prisma.employee_work_log.aggregate({
      where: { checkInDate: { gte: startMonth, lte: endMonth }, employeeId: id},
      _sum: {
        totalSeconds: true
      }
    }),
    prisma.employee_work_log.aggregate({
      where: {employeeId: id},
      _sum: {
        totalSeconds: true
      }
    }),
  ])

  if (!employee) {
    return resp(res, 'Employee not found', 404)
  }
  
  resp(res, {
    ...employee,
    totalHoursToday: ((day._sum.totalSeconds ?? 0) / 3600).toFixed(2),
    totalHoursMonth: ((month._sum.totalSeconds ?? 0) / 3600).toFixed(2),
    totalHoursOverall: ((overall._sum.totalSeconds ?? 0) / 3600).toFixed(2),
  })
}

export const employeeGetByUrlController = async (req: EmployeeGetByUrlRequest, res: Response) => {
  const employee = await prisma.employee.findUnique({ where: { shareableUrl: req.params.url } })

  if (!employee) {
    return resp(res, 'Invalid link', 400)
  }

  if (employee.urlExpiryDate && employee.urlExpiryDate < new Date()) {
    return resp(res, 'Link already expired', 400)
  }
  
  resp(res, employee)
}

export const employeeGetAttendancesController = async (req: EmployeeGetAttendancesRequest, res: Response) => {
  const { role, currentHotelId } = req.auth!
  let { hotelId, startDate, endDate } = req.query

  if (role !== 'agnos_admin' && role !== 'hsk_manager') {
    if (!currentHotelId) {
      return resp(res, 'Unauthorized', 401)
    }
    hotelId = currentHotelId
  }

  const employees = await prisma.employee.findMany({
    where: { hotelId },
    select: { id: true, firstName: true, middleName: true, lastName: true, rate: true, status: true, position: true, workLog: {
      where: { checkInDate: { gte: startDate, lte: endDate } },
      include: { breaks: true, editLogs: true }
    }},
  })
   
  resp(res, employees)
}
