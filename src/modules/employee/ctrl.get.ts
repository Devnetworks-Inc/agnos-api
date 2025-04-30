import { Request, Response } from "express";
import resp from "objectify-response";
import prisma from "../prisma";
import { EmployeeGetWorkLogsRequest, EmployeeGetByUrlRequest, EmployeeGetRequest, EmployeeGetWorkLogsByIdPaginatedRequest } from "./schema";
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

export const employeeGetWorkLogsController = async (req: EmployeeGetWorkLogsRequest, res: Response) => {
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

export const employeeGetWorkLogsByIdPaginatedController = async (req: EmployeeGetWorkLogsByIdPaginatedRequest, res: Response) => {
  const employeeId = +req.params.employeeId
  const { pageNumber = 1, pageSize = 50, startDate, endDate } = req.query

  const where = {
    employeeId,
    checkInDate: { gte: startDate, lte: endDate }
  }

  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: { hotel: { select: { name: true } } }
  })

  if (!employee) {
    return resp(res, 'Employee not found', 404)
  }

  const [items, totalItems] = await prisma.$transaction([
    prisma.employee_work_log.findMany({
      where,
      include: { breaks: true },
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
      orderBy: { checkInDate: 'desc' }
    }),
    prisma.employee_work_log.count({
      where,
    })
  ])

  resp(res, { employee, items, totalItems, totalPages: Math.ceil(totalItems/pageSize) })
}

export const employeeGetWorkLogsSummaryDaily = () => {

}