import { NextFunction, Request, Response } from "express";
import resp from "objectify-response";
import {
  EditWorkLogDetails,
  EmployeeBreakLogCreate,
  EmployeeBreakStartEndRequest,
  EmployeeCheckInOutRequest,
  EmployeeUpdateRequest,
  EmployeeUrlSubmitRequest,
  EmployeeWorkLogCommentRequest,
  EmployeeWorkLogUpdateRequest,
  RateType,
} from "./schema";
import prisma from "../prisma";
import { employee_status, Prisma } from "@prisma/client";
import { differenceInSeconds, isEqual, secondsToHours, secondsToMinutes, startOfYesterday, endOfYesterday, isYesterday } from "date-fns";
import { calculateSalary, getHourlyRate, toDecimalPlaces } from "src/utils/helper";
import { checkoutMidnightQuery, recalculateMonthlyRateWorkLogsSalary, upsertPositions } from "./services";

export const employeeUpdateController = async (
  req: EmployeeUpdateRequest,
  res: Response,
) => {
  const { id, positions, ...data } = req.body;
  const { role, currentHotelId } = req.auth!

  if (role !== 'agnos_admin' && !currentHotelId)
    return resp(res, 'Unauthorized', 401)

  const hotelId = currentHotelId ?? undefined

  const employee = prisma.employee.findUnique({ where: { id } })

  if (!employee) {
    return resp(res, "Employee to update does not exist.", 400);
  }

  if (positions) {
    await upsertPositions(positions, id)
  }

  const updatedEmployee =  await prisma.employee
    .update({
      where: { id, hotelId },
      data,
      include: { positions: true }
    })

  resp(res, updatedEmployee);
};

export const employeeCheckInOutController = async (
  req: EmployeeCheckInOutRequest,
  res: Response
) => {
  const { role: userRole, currentHotelId } = req.auth!;
  const { id, status, date, positionId } = req.body;
  let datetime = new Date(req.body.datetime)

  if (userRole !== "agnos_admin" && !currentHotelId) {
    return resp(res, "Unauthorized", 401);
  }

  const hotelId = currentHotelId ?? undefined;

  // const employee = await prisma.employee.findUnique({
  //   where: { id, hotelId },
  //   select: {
  //     status: true, rate: true, rateType: true,
  //     workLog: { take: 1, orderBy: { checkInDate: 'desc' } }
  //   },
  // });

  const employeePosition = await prisma.position.findFirst({
    where: { employeeId: id, id: positionId, employee: { hotelId } },
    include: {
      employee: {
        select: {
          status: true, // rate: true, rateType: true,
          workLog: { take: 1, orderBy: { checkInDate: 'desc' } }
        },
      }
    },
    orderBy: { id: 'asc' }
  })

  if (!employeePosition) {
    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId }
    });
    return resp(res, `Employee not found in ${hotel?.name}`, 404);
  }

  const employee = employeePosition.employee
  const lastLog = employee.workLog[0]
  const employeeStatus = lastLog?.status

  if (employeeStatus === "on_break") {
    return resp(res, "Employee is On Break", 400);
  }

  if (employeeStatus === "checked_in" && status === "check_in") {
    return resp(res, "Employee already check-in", 400);
  }

  if (employeeStatus === "checked_out" && status === "check_out") {
    return resp(res, "Employee already check-out", 400);
  }

  const { rate, rateType, role } = employeePosition
  const hourlyRate = getHourlyRate(rateType as RateType, rate, datetime)

  if (status === "check_in") {
    const [workLog] = await prisma.$transaction([
      prisma.employee_work_log.create({
        data: {
          positionId: employeePosition.id,
          role,
          rate,
          rateType,
          hourlyRate,
          date: new Date(date),
          employeeId: id,
          checkInDate: datetime,
          month: +date.split('-')[1],
          year: +date.split('-')[0],
          status: 'checked_in',
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
    // const log = await prisma.employee_work_log.findFirst({
    //   where: { checkOutDate: null, employeeId: id },
    //   select: { id: true, breaks: true, checkInDate: true, hourlyRate: true, totalSecondsBreak: true },
    //   take: 1,
    //   orderBy: { checkInDate: "desc" },
    // });

    // if no last log in or last log was already checked-out
    if (!lastLog || lastLog.checkOutDate) {
      return resp(res, "No check-in in work log found", 404);
    }

    if (isYesterday(lastLog.checkInDate)) {
      datetime = endOfYesterday()
    }

    if (datetime < lastLog.checkInDate) {
      return resp(res, "Date must be greater than work log check in date");
    }

    const totalSecondsBreak = lastLog.totalSecondsBreak ?? 0

    const totalSeconds =
      differenceInSeconds(datetime, lastLog.checkInDate) - totalSecondsBreak;

    const [workLog] = await prisma.$transaction([
      prisma.employee_work_log.update({
        where: { id: lastLog.id },
        data: {
          checkOutDate: datetime,
          totalSeconds,
          salaryToday: calculateSalary(hourlyRate, totalSeconds),
          status: 'checked_out',
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

    return resp(res, {
      ...workLog,
      totalHours: secondsToHours(totalSeconds),
      totalBreakMinutes: secondsToMinutes(totalSecondsBreak)
    });
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
  let date = new Date(req.body.date);

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
      firstName: true,
      lastName: true
    },
  });

  if (!employee) {
    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId }
    });
    return resp(res, `Employee not found in ${hotel?.name}`, 404);
  }

  if (!employee.workLog.length) {
    return resp(res, "Employee has not check in", 400);
  }

  const employeeStatus = employee.workLog[0]?.status

  if (employeeStatus === "checked_out") {
    return resp(res, "Employee already check-out", 400);
  }

  if (employeeStatus === "on_break" && status === "start_break") {
    return resp(res, "Employee already on break", 400);
  }

  if (employeeStatus === "checked_in" && status === "end_break") {
    return resp(res, "Employee is not on break", 400);
  }

  const workLog = employee.workLog[0];

  if (status === "start_break") {
    const [breakLog] = await prisma.$transaction([
      prisma.employee_work_log.update({
        where: { id: workLog.id },
        data: {
          status: 'on_break',
          breaks: {
            create: {
              breakStartDate: date,
            }
          }
        }
      }),
      // prisma.employee_break_log.create({
      //   data: {
      //     workLogId: workLog.id,
      //     breakStartDate: date,
      //   },
      // }),
      prisma.employee.update({
        where: { id },
        data: { status: "on_break" },
      }),
    ]);

    return resp(res, {...breakLog, employee});
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

    if (isYesterday(breakLog.breakStartDate)) {
      date = endOfYesterday()
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
          workLog: { update: {
            status: 'checked_in',
            totalSecondsBreak: workLog.totalSecondsBreak !== null ? { increment: diffInSecs } : diffInSecs
          }}
        }
      }),
      prisma.employee.update({
        where: { id },
        data: { status: "checked_in" },
      }),
    ]);

    return resp(res, {...updatedBreakLog, employee});
  }
};

export const employeeUpdateWorkLogController = async (
  req: EmployeeWorkLogUpdateRequest,
  res: Response,
  next: NextFunction
) => {
  const { id: userId } = req.auth!
  let { workLogId: id, breaks, employeeId, comment, rate, rateType, checkInDate: rCheckInDate } = req.body;

  // const workLog = await prisma.employee_work_log.findUnique({
  //   where: { id },
  //   include: { breaks: true, employee: { select: { status: true } } }
  // })

  // const lastLog = prisma.employee_work_log.findFirst({
  //   where: { employeeId },
  //   orderBy: { checkInDate: 'desc' }
  // })

  const [workLog, lastWorkLog] = await prisma.$transaction([
    prisma.employee_work_log.findUnique({
      where: { id },
      include: { breaks: true, employee: { select: { status: true } } }
    }),
    prisma.employee_work_log.findFirst({
      where: { employeeId },
      orderBy: { checkInDate: 'desc' }
    })
  ])

  if (!workLog) {
    return resp(res, "Record to update not found.", 404);
  }
  rate = rate ?? workLog.rate
  rateType = rateType ?? workLog.rateType as RateType
  const checkInDate = rCheckInDate ? new Date(rCheckInDate) : workLog.checkInDate

  let hourlyRate = getHourlyRate(rateType, rate, checkInDate)
  let salaryToday: Prisma.Decimal | undefined
  let status: employee_status = 'checked_in'
  let hasUpdate = false

  const checkOutDate =
    req.body.checkOutDate ? new Date(req.body.checkOutDate) :
    (req.body.checkOutDate === null ? null : workLog.checkOutDate)
  
  const newBreaks: (EmployeeBreakLogCreate & { totalSeconds?: number })[] = []

  const details: EditWorkLogDetails = {
    breaks: [],
    newTotalMinsBreak: 0,
    newTotalHours: 0,
    correction: 0,
    action: 'update'
  }

  if (!isEqual(checkInDate, workLog.checkInDate)) {
    details.newCheckIn = checkInDate.toISOString()
    details.prevCheckIn = workLog.checkInDate.toISOString()
    hasUpdate = true
  }

  let totalSeconds = workLog.totalSeconds
  let lastBreak: EmployeeBreakLogCreate | undefined
  let totalSecondsBreak = workLog.totalSecondsBreak ?? 0
  let newBreakTotalSeconds = totalSecondsBreak

  if (breaks) {
    let index = 0
    for (const val of breaks) {
      const breakStartDate = new Date(val.breakStartDate)
      const breakEndDate = val.breakEndDate ? new Date(val.breakEndDate) : null
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

      const breakDetails: EditWorkLogDetails['breaks'][0] = {
        action: 'create',
        position: index + 1,
      }

      // check changes for breaks
      if (workLog.breaks.length >= (index + 1)) {
        const logBreak = workLog.breaks[index]
        breakDetails.action = 'update'
        let hasBreakUpdate = false

        if (!isEqual(breakStartDate, logBreak.breakStartDate)) {
          breakDetails.prevStartBreak = logBreak.breakStartDate.toISOString()
          breakDetails.newStartBreak = breakStartDate.toISOString()
          hasBreakUpdate = true
        }

        if ( (breakEndDate && !logBreak.breakEndDate) || (logBreak.breakEndDate && !breakEndDate) || (breakEndDate && logBreak.breakEndDate && (!isEqual(breakEndDate, logBreak.breakEndDate))) ) {
          breakDetails.prevEndBreak = logBreak.breakEndDate?.toISOString()
          breakDetails.newEndBreak = breakEndDate?.toISOString()
          hasBreakUpdate = true
        }
        if (hasBreakUpdate) {
          hasUpdate = true
          details.breaks.push(breakDetails)
        }
      } else {
        breakDetails.newStartBreak = breakStartDate.toISOString()
        breakDetails.newEndBreak = breakEndDate?.toISOString()
        details.breaks.push(breakDetails)
        hasUpdate = true
      }

      index++
    }

    newBreakTotalSeconds = newBreaks.reduce(
      (acc, val) => acc + (val.totalSeconds ?? 0),
      0
    );
  }

  // check for breaks deletion
  if (breaks && (breaks.length < workLog.breaks.length)) {
    for (let i = breaks.length; i < workLog.breaks.length; i++) {
      details.breaks.push({
        action: 'delete',
        position: i + 1
      })
    }
    hasUpdate = true
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
    // if (breakEndDate && (new Date(breakEndDate) > checkOutDate)) {
    //   return resp(res, "Check-Out date must be greater than Break End date", 400);
    // }

    if (breakEndDate) {
      const breakEnd = new Date(breakEndDate);
      const checkOut = new Date(checkOutDate);

      const breakEndTime = breakEnd.getHours() * 3600 + breakEnd.getMinutes() * 60 + breakEnd.getSeconds();
      const checkOutTime = checkOut.getHours() * 3600 + checkOut.getMinutes() * 60 + checkOut.getSeconds();

      if (breakEndTime > checkOutTime) {
        return resp(res, "Check-Out time must be greater than Break End time", 400);
      }
    }

    totalSeconds = differenceInSeconds(checkOutDate, checkInDate) - newBreakTotalSeconds
    status = 'checked_out'
    salaryToday = calculateSalary(hourlyRate, totalSeconds)

    if ((workLog.checkOutDate && !isEqual(checkOutDate, workLog.checkOutDate)) || !workLog.checkOutDate) {
      details.newCheckOut = checkOutDate.toISOString(),
      details.prevCheckOut = workLog.checkOutDate?.toISOString()
      hasUpdate = true
    }
    if (totalSeconds !== (workLog.totalSeconds ?? 0)) {
      details.newTotalHours = toDecimalPlaces(totalSeconds / 3600, 2)
      details.prevTotalHours = toDecimalPlaces((workLog.totalSeconds ?? 0) / 3600, 2)
      details.correction = toDecimalPlaces(details.newTotalHours - details.prevTotalHours, 2)
    }
  } else {
    totalSeconds = null
    if (workLog.checkOutDate) {
      details.newTotalHours = 0
      details.prevTotalHours = toDecimalPlaces((workLog.totalSeconds ?? 0) / 3600, 2)
      details.correction = toDecimalPlaces(details.newTotalHours - details.prevTotalHours, 2)
      hasUpdate = true
    }
  }

  if (totalSecondsBreak !== newBreakTotalSeconds) {
    details.newTotalMinsBreak = toDecimalPlaces(newBreakTotalSeconds / 60, 2)
    details.prevTotalMinsBreak = toDecimalPlaces(totalSecondsBreak / 60, 2)
  }

  const transaction: Prisma.PrismaPromise<any>[]  = [
    prisma.employee_work_log.update({
      where: { id },
      data: {
        employeeId,
        checkInDate,
        checkOutDate,
        totalSeconds,
        totalSecondsBreak: newBreakTotalSeconds,
        salaryToday,
        rate,
        rateType,
        hourlyRate,
        status,
        breaks: breaks ? {
          deleteMany: {},
          create: newBreaks
        } : undefined,
        editLogs: hasUpdate ? {
          create: {
            editorId: userId,
            date: new Date(),
            comment,
            details
          }
        } : undefined
      },
      include: { breaks: true },
    }),
  ]

  if (!lastWorkLog || !(checkInDate < lastWorkLog.checkInDate)) {
    transaction.push(
      prisma.employee.update({
        where: { id: employeeId },
        data: {
          status,
        },
        select: { id: true, status: true }
      })
    )
  }

  const [newWorkLog] = await prisma.$transaction(transaction)

  resp(res, newWorkLog)
};

export const employeeUpdateWorkLogCommentController = (req: EmployeeWorkLogCommentRequest, res: Response, next: NextFunction) => {
  const { employeeId } = req.auth!
  const { workLogId, comment } = req.body

  if (!employeeId) {
    return resp(res, 'Unauthorized', 401)
  }

  prisma.employee_work_log.update({
    where: { employeeId, id: workLogId },
    data: {
      comment
    }
  })
  .then(() => {
    resp(res, 'Successfully set a comment')
  })
  .catch(e => {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2025') {
        return resp(
          res,
          'Record to comment does not exist.',
          400
        )
      }
    }
    next(e)
  })
}

export const employeeMidnightCheckoutController = async (req: Request, res: Response) => {
  const yesterdayStart = startOfYesterday()
  const yesterdayEnd = endOfYesterday()

  const result = await checkoutMidnightQuery(yesterdayStart, yesterdayEnd)

  resp(res, `${result.count} employees was checked out`)
}

export const employeeMonthlyRateRecalculateController = async (req: Request, res: Response) => {
  await recalculateMonthlyRateWorkLogsSalary()
  return resp(res, 'Successfully recalculated monthly rate work logs')
}