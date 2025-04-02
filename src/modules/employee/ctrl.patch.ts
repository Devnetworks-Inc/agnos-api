import { NextFunction, Response } from "express";
import resp from "objectify-response";
import { EmployeeCheckInOutRequest, EmployeeUpdateRequest } from "./schema";
import prisma from "../prisma";
import { Prisma } from "@prisma/client";

export const employeeUpdateController = async (req: EmployeeUpdateRequest, res: Response, next: NextFunction) => {
  const { id, hotelId } = req.body

  prisma.employee.update({
    where: { id },
    data: {
      ...req.body,
      hotelId
    }
  })
  .then((employee) => {
    resp(res, employee)
  })
  .catch(e => {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2025') {
        return resp(
          res,
          'Record to update does not exist.',
          400
        )
      }
    }
    next(e)
  })
}

export const employeeCheckInOutController = async (req: EmployeeCheckInOutRequest, res: Response, next: NextFunction) => {
  const { currentHotelId } = req.auth!
  const { id, status } = req.body

  if (!currentHotelId) {
    return resp(res, 'Unauthorized', 401)
  }

  const employee = await prisma.employee.findUnique({ where: { id }, select: { status: true } })

  if (!employee) {
    return resp(res, 'Employee not found', 404)
  }

  if (employee.status === 'check_in' && status === 'check_in') {
    return resp(res, 'Employee already check-in', 400)
  }

  if (employee.status === 'check_out' && status === 'check_out') {
    return resp(res, 'Employee already check-out', 400)
  }

  if (status === 'check_in') {
    const [ workLog ] = await prisma.$transaction([
      prisma.employee_work_log.create({
        data: {
          employeeId: id,
          checkInDate: new Date(),
        },
        include: { employee: { select: { firstName: true, middleName: true, lastName: true }} }
      }),
      prisma.employee.update({
        where: { id },
        data: { status: 'check_in' }
      })
    ])
    return resp(res, workLog)
  }

  if (status === 'check_out') {
    // get latest check in
    const log = await prisma.employee_work_log.findFirst({
      where: { checkOutDate: null, employeeId: id },
      select: { id: true },
      take: 1,
      orderBy: { checkInDate: 'desc' }
    })

    if (!log) {
      return resp(res, 'No check-in in work log found', 404)
    }

    const [ workLog ] = await prisma.$transaction([
      prisma.employee_work_log.update({
        where: { id: log.id },
        data: {
          checkOutDate: new Date(),
        },
        include: { employee: { select: { firstName: true, middleName: true, lastName: true }} }
      }),
      prisma.employee.update({
        where: { id },
        data: { status: 'check_out' }
      })
    ])

    return resp(res, workLog)
  }
}