import { Request, Response } from "express";
import resp from "objectify-response";
import prisma from "../prisma";
import {
  EmployeeGetWorkLogsRequest,
  EmployeeGetByUrlRequest,
  EmployeeGetRequest,
  EmployeeGetWorkLogsByIdPaginatedRequest,
  EmployeeGetWorkLogsByHotelIdSummaryDailyRequest,
  EmployeeGetWorkLogEditLogsRequest,
  EmployeeGetWorkLogsByMonthRequest,
} from "./schema";
import { Prisma } from "@prisma/client";
import { IdParam } from "../id/schema";
import { AuthRequest } from "../auth.schema";
import { endOfDay, endOfMonth, format, startOfDay, startOfMonth } from "date-fns";
import { getTotalItemsEmployeeTimesheetQuery, paginatedEmployeeTimesheetQuery } from "./services";

export const employeeGetController = async (
  req: EmployeeGetRequest,
  res: Response
) => {
  const { role, currentHotelId } = req.auth!;
  let { hotelId } = req.query;
  const where: Prisma.employeeWhereInput = {};

  if (role !== "agnos_admin" && role !== "hsk_manager") {
    if (!currentHotelId) {
      return resp(res, "Unauthorized", 401);
    }
    hotelId = currentHotelId;
  }

  if (hotelId) {
    where.hotelId = hotelId;
  }

  const employees = await prisma.employee.findMany({
    where,
    include: {
      hotel: { select: { name: true } },
      workLog: { take: 1, orderBy: { checkInDate: 'desc' } }
    },
  });
  resp(res, employees.map( e => ({
    ...e, status: e.workLog[0]?.status ?? 'Inactive'
  })));
};

export const employeeGetByIdController = async (
  req: Request<IdParam> & AuthRequest,
  res: Response
) => {
  const id = +req.params.id;
  const today = new Date();
  const startDay = startOfDay(today);
  const endDay = endOfDay(today);
  const startMonth = startOfMonth(today);
  const endMonth = endOfMonth(today);

  const [employee, day, month, overall] = await prisma.$transaction([
    prisma.employee.findUnique({
      where: { id },
      include: { workLog: { take: 1, orderBy: { checkInDate: 'desc' } } }
    }),
    prisma.employee_work_log.aggregate({
      where: { checkInDate: { gte: startDay, lte: endDay } },
      _sum: {
        totalSeconds: true,
      },
    }),
    prisma.employee_work_log.aggregate({
      where: {
        checkInDate: { gte: startMonth, lte: endMonth },
        employeeId: id,
      },
      _sum: {
        totalSeconds: true,
      },
    }),
    prisma.employee_work_log.aggregate({
      where: { employeeId: id },
      _sum: {
        totalSeconds: true,
      },
    }),
  ]);

  if (!employee) {
    return resp(res, "Employee not found", 404);
  }

  resp(res, {
    ...employee,
    status: employee.workLog[0]?.status ?? 'Inactive',
    totalHoursToday: ((day._sum.totalSeconds ?? 0) / 3600).toFixed(2),
    totalHoursMonth: ((month._sum.totalSeconds ?? 0) / 3600).toFixed(2),
    totalHoursOverall: ((overall._sum.totalSeconds ?? 0) / 3600).toFixed(2),
  });
};

export const employeeGetByUrlController = async (
  req: EmployeeGetByUrlRequest,
  res: Response
) => {
  const employee = await prisma.employee.findUnique({
    where: { shareableUrl: req.params.url },
  });

  if (!employee) {
    return resp(res, "Invalid link", 400);
  }

  if (employee.urlExpiryDate && employee.urlExpiryDate < new Date()) {
    return resp(res, "Link already expired", 400);
  }

  resp(res, employee);
};

export const employeeGetWorkLogsController = async (
  req: EmployeeGetWorkLogsRequest,
  res: Response
) => {
  const { role, currentHotelId } = req.auth!;
  let { hotelId, startDate, endDate } = req.query;

  if (role !== "agnos_admin" && role !== "hsk_manager") {
    if (!currentHotelId) {
      return resp(res, "Unauthorized", 401);
    }
    hotelId = currentHotelId;
  }

  const employees = await prisma.employee.findMany({
    where: {
      hotelId,
      position: { notIn: ['check_in_assistant', 'agnos_admin'] }
      // OR: [{ user: { role: { notIn: ['check_in_assistant', 'agnos_admin'] } } }, { user: null }],
    },
    select: {
      id: true,
      firstName: true,
      middleName: true,
      lastName: true,
      rate: true,
      // status: true,
      rateType: true,
      position: true,
      hotel: { select: { id: true, name: true } },
      user: { select: { role: true } },
      workLog: {
        where: { checkInDate: { gte: startDate, lte: endDate } },
        include: {
          breaks: true,
          editLogs: { select: { id: true }, orderBy: { date: "desc" } },
        },
        orderBy: { checkInDate: 'asc' }
      },
    },
  });

  // Set status to 'Inactive' if workLog is empty or null
  const employeesFinal = employees.map((emp) => ({
    ...emp,
    status: !emp.workLog || emp.workLog.length === 0 ? "Inactive" : emp.workLog[0].status,
  }));

  resp(res, employeesFinal);
};

export const employeeGetWorkLogsByMonthController = async (
  req: EmployeeGetWorkLogsByMonthRequest,
  res: Response
) => {
  const { currentHotelId, role } = req.auth!
  const today = new Date()
  const { year = today.getFullYear(), month = today.getMonth() + 1 } = req.query;
  let hotelId: number | undefined

  if (role !== 'agnos_admin') {
    if (!currentHotelId) return resp(res, 'Unauthorized', 401)
    hotelId = currentHotelId
  } else {
    hotelId = req.query.hotelId
  }

  const [workLogs, employees] = await prisma.$transaction([
    prisma.employee_work_log.groupBy({
      by: ["employeeId"],
      where: { employee: { hotelId }, year, month },
      _sum: { totalSeconds: true, totalSecondsBreak: true, salaryToday: true },
      orderBy: { employeeId: "asc" },
    }),
    prisma.employee.findMany({
      where: { hotelId },
      select: {
        id: true,
        firstName: true,
        middleName: true,
        lastName: true,
        rate: true,
        rateType: true,
        position: true,
        hotelId: true,
        hotel: { select: { name: true } }
      },
    }),
  ]);
  const workLogMap = new Map<number, (typeof workLogs[0])>();
  workLogs.forEach((log) => {
    workLogMap.set(log.employeeId, log);
  });

  const employeesWithWorkLog = employees.map((e) => {
    const workLog = workLogMap.get(e.id) as typeof workLogs[0] || {}
    return {
      ...e,
      year,
      month,
      hotel: e.hotel.name,
      totalSeconds: workLog._sum?.totalSeconds ?? 0,
      totalSecondsBreak: workLog._sum?.totalSecondsBreak ?? 0,
      totalSalary: workLog._sum?.salaryToday?.toNumber() ?? 0
    };
  });

  resp(res, employeesWithWorkLog)
};

export const employeeGetWorkLogsByIdPaginatedController = async (
  req: EmployeeGetWorkLogsByIdPaginatedRequest,
  res: Response
) => {
  const today = new Date()
  const employeeId = +req.params.employeeId;
  const { pageNumber = 1, pageSize = 50, startDate = format(today, 'yyyy-MM-dd'), endDate = format(today, 'yyyy-MM-dd'), includeTotalItems = 'true'} = req.query;

  let month

  const sMonth = startDate?.split('-')[1]
  const eMonth = endDate?.split('-')[1]
  if (sMonth === eMonth) {
    month = +(sMonth || eMonth) 
  }

  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: { hotel: { select: { name: true } } },
  });

  if (!employee) {
    return resp(res, "Employee not found", 404);
  }

  const [items, totalItems, workLog] = await Promise.all([
    paginatedEmployeeTimesheetQuery(pageNumber, pageSize, employeeId, startDate, endDate),

    includeTotalItems === 'true' ?
      getTotalItemsEmployeeTimesheetQuery(employeeId, startDate, endDate) :
      Promise.resolve(),
      
    month ? prisma.employee_work_log.aggregate({
      _sum: { totalSeconds: true },
      where: { month }
    }) : Promise.resolve(),
  ]);

  const secondsPerHour = 3600
  const noOvertimeHour = 168
  const noOvertimeSeconds = noOvertimeHour * secondsPerHour
  const secondsWork = (workLog?._sum.totalSeconds ?? 0)
  let overtimeSeconds = 0

  if (secondsWork > noOvertimeSeconds) {
    overtimeSeconds = secondsWork - overtimeSeconds
  }

  resp(res, {
    employee,
    overtimeHour: +(overtimeSeconds / secondsPerHour).toFixed(2),
    items,
    totalItems,
    totalPages: totalItems && Math.ceil(totalItems / pageSize),
  });
};

export const employeeGetWorkLogsSummaryDailyController = async (
  req: EmployeeGetWorkLogsByHotelIdSummaryDailyRequest,
  res: Response
) => {
  const hotelId = +req.params.hotelId;
  const { startDate, endDate } = req.query;

  const data = await prisma.employee_work_log.groupBy({
    by: ["date"],
    where: {
      employee: { hotelId },
      checkInDate: { gte: startDate, lte: endDate },
    },
    _sum: { totalSeconds: true, salaryToday: true },
  });

  resp(
    res,
    data.map((v) => ({
      date: v.date,
      totalHours: +((v._sum.totalSeconds ?? 0) / 3600).toFixed(2),
      totalCost: +(v._sum.salaryToday ?? 0),
    }))
  );
};

export const employeeGetWorkLogEditLogsController = async (
  req: EmployeeGetWorkLogEditLogsRequest,
  res: Response
) => {
  const { role, employeeId } = req.auth!;
  const workLogId = +req.params.workLogId;

  const where: Prisma.employee_work_edit_logWhereInput = {
    workLogId,
  };

  if (role !== "agnos_admin") {
    if (!employeeId) return resp(res, "Unauthorized", 401);
    where.workLog = {
      employeeId,
    };
  }

  const logs = await prisma.employee_work_edit_log.findMany({
    where,
    include: {
      editor: {
        select: {
          username: true,
          employee: { select: { firstName: true, middleName: true, id: true } },
        },
      },
    },
    orderBy: { date: "desc" },
  });
  resp(res, logs);
};
