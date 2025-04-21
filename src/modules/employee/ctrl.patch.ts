import { NextFunction, Response } from "express";
import resp from "objectify-response";
import {
  EmployeeBreakLogCreate,
  EmployeeBreakStartEndRequest,
  EmployeeCheckInOutRequest,
  EmployeeUpdateRequest,
  EmployeeUrlSubmitRequest,
  EmployeeWorkLogUpdateRequest,
} from "./schema";
import prisma from "../prisma";
import { employee_status, Prisma } from "@prisma/client";
import { differenceInSeconds } from "date-fns";

export const employeeUpdateController = async (
  req: EmployeeUpdateRequest,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.body;

  prisma.employee
    .update({
      where: { id },
      data: {
        ...req.body,
      },
    })
    .then((employee) => {
      resp(res, employee);
    })
    .catch((e) => {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2025") {
          return resp(res, "Record to update does not exist.", 400);
        }
      }
      next(e);
    });
};

export const employeeCheckInOutController = async (
  req: EmployeeCheckInOutRequest,
  res: Response
) => {
  const { role, currentHotelId } = req.auth!;
  const { id, status, date } = req.body;
  const datetime = new Date(req.body.datetime)

  if (role !== "agnos_admin" && !currentHotelId) {
    return resp(res, "Unauthorized", 401);
  }

  const hotelId = currentHotelId ?? undefined;

  const employee = await prisma.employee.findUnique({
    where: { id, hotelId },
    select: { status: true },
  });

  if (!employee) {
    return resp(res, "Employee not found", 404);
  }

  if (employee.status === "on_break") {
    return resp(res, "Employee is On Break", 400);
  }

  if (employee.status === "checked_in" && status === "check_in") {
    return resp(res, "Employee already check-in", 400);
  }

  if (employee.status === "checked_out" && status === "check_out") {
    return resp(res, "Employee already check-out", 400);
  }

  if (status === "check_in") {
    const [workLog] = await prisma.$transaction([
      prisma.employee_work_log.create({
        data: {
          date: new Date(date),
          employeeId: id,
          checkInDate: datetime,
          month: +date.split('-')[1],
          year: +date.split('-')[0],
        },
        include: {
          employee: {
            select: { firstName: true, middleName: true, lastName: true },
          },
        },
      }),
      prisma.employee.update({
        where: { id },
        data: { status: "checked_in" },
      }),
    ]);
    return resp(res, workLog);
  }

  if (status === "check_out") {
    // get latest check in
    const log = await prisma.employee_work_log.findFirst({
      where: { checkOutDate: null, employeeId: id },
      select: { id: true, breaks: true, checkInDate: true },
      take: 1,
      orderBy: { checkInDate: "desc" },
    });

    if (!log) {
      return resp(res, "No check-in in work log found", 404);
    }

    if (datetime < log.checkInDate) {
      return resp(res, "Date must be greater than work log check in date");
    }

    const breakTotalSeconds = log.breaks.reduce(
      (acc, val) => acc + (val.totalSeconds ?? 0),
      0
    );

    const totalSeconds =
      differenceInSeconds(datetime, log.checkInDate) - breakTotalSeconds;

    const [workLog] = await prisma.$transaction([
      prisma.employee_work_log.update({
        where: { id: log.id },
        data: {
          checkOutDate: datetime,
          totalSeconds,
        },
        include: {
          employee: {
            select: { firstName: true, middleName: true, lastName: true },
          },
        },
      }),
      prisma.employee.update({
        where: { id },
        data: { status: "checked_out" },
      }),
    ]);

    return resp(res, workLog);
  }
};

export const employeeUrlSubmitController = async (
  req: EmployeeUrlSubmitRequest,
  res: Response
) => {
  const { shareableUrl, ...rest } = req.body;

  const employee = await prisma.employee.findUnique({
    where: { shareableUrl },
  });

  if (!employee || !employee.urlExpiryDate) {
    return resp(res, "Invalid Link", 400);
  }

  if (employee.urlExpiryDate < new Date()) {
    return resp(res, "Link already expired", 400);
  }

  const updatedEmployee = await prisma.employee.update({
    where: { shareableUrl },
    data: {
      ...rest,
      shareableUrl: null,
      urlExpiryDate: null,
    },
  });

  resp(res, updatedEmployee);
};

export const employeeBreakStartEndController = async (
  req: EmployeeBreakStartEndRequest,
  res: Response
) => {
  const { role, currentHotelId } = req.auth!;
  const { id, status } = req.body;
  const date = new Date(req.body.date);

  if (role !== "agnos_admin" && !currentHotelId) {
    return resp(res, "Unauthorized", 401);
  }

  const hotelId = currentHotelId ?? undefined;

  const employee = await prisma.employee.findUnique({
    where: { id, hotelId },
    select: {
      status: true,
      workLog: {
        where: { checkOutDate: null },
        orderBy: { checkInDate: "desc" },
        take: 1,
      },
    },
  });

  if (!employee) {
    return resp(res, "Employee not found", 404);
  }

  if (employee.status === "checked_out") {
    return resp(res, "Employee already check-out", 400);
  }

  if (employee.status === "on_break" && status === "start_break") {
    return resp(res, "Employee already on break", 400);
  }

  if (employee.status === "checked_in" && status === "end_break") {
    return resp(res, "Employee is not on break", 400);
  }

  if (!employee.workLog.length) {
    return resp(res, "Employee has not check in", 400);
  }

  const workLog = employee.workLog[0];

  if (status === "start_break") {
    const [breakLog] = await prisma.$transaction([
      prisma.employee_break_log.create({
        data: {
          workLogId: workLog.id,
          breakStartDate: date,
        },
      }),
      prisma.employee.update({
        where: { id },
        data: { status: "on_break" },
      }),
    ]);

    return resp(res, breakLog);
  }

  if (status === "end_break") {
    // get latest start break
    const breakLog = await prisma.employee_break_log.findFirst({
      where: { breakEndDate: null, workLogId: workLog.id },
      select: { id: true, breakStartDate: true },
      take: 1,
      orderBy: { breakStartDate: "desc" },
    });

    if (!breakLog) {
      return resp(res, "No start break in log found", 404);
    }

    if (date < breakLog.breakStartDate) {
      return resp(res, "Date must be greater than start-break date", 400);
    }

    const diffInSecs = differenceInSeconds(date, breakLog.breakStartDate);

    const [updatedBreakLog] = await prisma.$transaction([
      prisma.employee_break_log.update({
        where: { id: breakLog.id },
        data: {
          breakEndDate: date,
          totalSeconds: diffInSecs,
        },
      }),
      prisma.employee.update({
        where: { id },
        data: { status: "checked_in" },
      }),
    ]);

    return resp(res, updatedBreakLog);
  }
};

export const employeeUpdateWorkLogController = async (
  req: EmployeeWorkLogUpdateRequest,
  res: Response,
  next: NextFunction
) => {
  let { workLogId: id, breaks, employeeId } = req.body;
  const workLog = await prisma.employee_work_log.findUnique({ where: { id }, include: { breaks: true, employee: { select: { status: true } } } })
  if (!workLog) {
    return resp(res, "Record to update not found.", 404);
  }

  let status: employee_status = 'checked_in'

  const checkInDate = new Date(req.body.checkInDate)
  const checkOutDate = req.body.checkOutDate && new Date(req.body.checkOutDate)
  const newBreaks: (EmployeeBreakLogCreate & { totalSeconds?: number })[] = []
  let totalSeconds = workLog.totalSeconds
  
  let lastBreak: EmployeeBreakLogCreate | undefined

  if (breaks) {
    for (const val of breaks) {
      const breakStartDate = new Date(val.breakStartDate)
      const breakEndDate = val.breakEndDate && new Date(val.breakEndDate)
      const lastEndBreak = lastBreak?.breakEndDate && new Date(lastBreak.breakEndDate)
      

      if (lastBreak && !lastEndBreak) {
        return resp(res, "Break End time are required in previous breaks", 400)
      }
      if (breakStartDate < checkInDate) {
        return resp(res, "Break Start time should be greater than Check-In time", 400)
      }
      if (lastEndBreak && breakStartDate < lastEndBreak) {
        return resp(res, "Break Start time should be greater than previous Break End time", 400)
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
  } else {
    status = 'checked_in'
  }

  if (checkOutDate) {
    totalSeconds = totalSeconds ?? 0
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

    if (breaks) {
      totalSeconds = differenceInSeconds(checkOutDate, checkInDate) - breakTotalSeconds
    } else {
      const diffSecs =  differenceInSeconds(checkOutDate, checkInDate)
      const breaksTotalSeconds = diffSecs - totalSeconds
      totalSeconds = diffSecs - breaksTotalSeconds
    }

    status = 'checked_out'
  } else {
    totalSeconds = null
  }

  const [newWorkLog, employee] = await prisma.$transaction([
    prisma.employee_work_log.update({
      where: { id },
      data: {
        employeeId,
        checkInDate,
        checkOutDate,
        totalSeconds,
        status,
        breaks: breaks ? {
          deleteMany: {},
          create: newBreaks
        } : undefined,
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

  resp(res, {...employee, workLog: newWorkLog})
};
