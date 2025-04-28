import { Request, Response } from "express";
import resp from "objectify-response";
import prisma from "../prisma";
import { EmployeeGetAttendancesRequest, EmployeeGetByUrlRequest, EmployeeGetRequest } from "./schema";
import { Prisma } from "@prisma/client";
import { IdParam } from "../id/schema";
import { AuthRequest } from "../auth.schema";

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
  const employee = await prisma.employee.findUnique({ where: { id: +req.params.id } })

  if (!employee) {
    return resp(res, 'Employee not found', 404)
  }
  
  resp(res, employee)
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
