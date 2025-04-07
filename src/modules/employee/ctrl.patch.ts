import { NextFunction, Response } from "express";
import resp from "objectify-response";
import { EmployeeBreakStartEndRequest, EmployeeCheckInOutRequest, EmployeeUpdateRequest, EmployeeUrlSubmitRequest } from "./schema";
import prisma from "../prisma";
import { Prisma } from "@prisma/client";
import { differenceInSeconds } from "date-fns";

export const employeeUpdateController = async (req: EmployeeUpdateRequest, res: Response, next: NextFunction) => {
  const { id } = req.body

  prisma.employee.update({
    where: { id },
    data: {
      ...req.body,
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

export const employeeCheckInOutController = async (req: EmployeeCheckInOutRequest, res: Response) => {
  const { currentHotelId } = req.auth!
  const { id, status } = req.body
  const date = new Date(req.body.date)

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
          checkInDate: date,
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
      select: { id: true, breaks: true, checkInDate: true },
      take: 1,
      orderBy: { checkInDate: 'desc' }
    })

    if (!log) {
      return resp(res, 'No check-in in work log found', 404)
    }

    if (date < log.checkInDate) {
      return resp(res, 'Date must be greater than work log check in date')
    }

    const breakTotalSeconds = log.breaks.reduce((acc, val) => 
      acc + (val.totalSeconds ?? 0)
    , 0)

    const totalSeconds = differenceInSeconds(date, log.checkInDate) - breakTotalSeconds

    const [ workLog ] = await prisma.$transaction([
      prisma.employee_work_log.update({
        where: { id: log.id },
        data: {
          checkOutDate: date,
          totalSeconds
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

export const employeeUrlSubmitController = async (req: EmployeeUrlSubmitRequest, res: Response) => {
  const { shareableUrl, ...rest } = req.body

  const employee =  await prisma.employee.findUnique({
    where: { shareableUrl }
  })

  if (!employee || !employee.urlExpiryDate) {
    return resp(res, 'Invalid Link', 400)
  }

  if (employee.urlExpiryDate < new Date()) {
    return resp(res, 'Link already expired')
  }

  const updatedEmployee = await prisma.employee.update({
    where: { shareableUrl },
    data: {
      ...rest,
      shareableUrl: null,
      urlExpiryDate: null
    }
  })
  
  resp(res, updatedEmployee)
}

export const employeeBreakStartEndController = async (req: EmployeeBreakStartEndRequest, res: Response) => {
  const { currentHotelId } = req.auth!
  const { id, status } = req.body
  const date = new Date(req.body.date)

  if (!currentHotelId) {
    return resp(res, 'Unauthorized', 401)
  }

  const employee = await prisma.employee.findUnique({
    where: { id, hotelId: currentHotelId },
    select: { 
      status: true, workLog: {  where: { checkOutDate: null }, orderBy: { checkInDate: 'desc' }, take: 1  } 
    }
  })

  if (!employee) {
    return resp(res, 'Employee not found', 404)
  }

  if (employee.status === 'check_out') {
    return resp(res, 'Employee already check-out', 400)
  }

  if (employee.status === 'on_break' && status === 'start_break') {
    return resp(res, 'Employee already on break', 400)
  }

  if (employee.status === 'check_in' && status === 'end_break') {
    return resp(res, 'Employee is not on break', 400)
  }

  if (!employee.workLog.length) {
    return resp(res, 'Employee has not check in', 400)
  }

  const workLog = employee.workLog[0]

  if (status === 'start_break') {
    const [breakLog] = await prisma.$transaction([
      prisma.employee_break_log.create({
        data: {
          workLogId: workLog.id,
          breakStartDate: date,
        }
      }),
      prisma.employee.update({
        where: { id },
        data: { status: 'on_break' }
      })
    ]) 

    return resp(res, breakLog)
  }

  if (status === 'end_break') {
    // get latest start break
    const breakLog = await prisma.employee_break_log.findFirst({
      where: { breakEndDate: null, workLogId: workLog.id },
      select: { id: true, breakStartDate: true },
      take: 1,
      orderBy: { breakStartDate: 'desc' }
    })

    if (!breakLog) {
      return resp(res, 'No start break in log found', 404)
    }

    if (date < breakLog.breakStartDate) {
      return resp(res, 'Date must be greater than start-break date')
    }

    const diffInSecs = differenceInSeconds(date, breakLog.breakStartDate)

    const [ updatedBreakLog ] = await prisma.$transaction([
      prisma.employee_break_log.update({
        where: { id: breakLog.id },
        data: {
          breakEndDate: date,
          totalSeconds: diffInSecs
        },
      }),
      prisma.employee.update({
        where: { id },
        data: { status: 'check_in' }
      })
    ])

    return resp(res, updatedBreakLog)
  }
}