import { isMatch } from "date-fns";
import { TypeOf, z } from "zod";
import { RateType } from "../employee/schema";
import { Request } from "express";
import { AuthRequest } from "../auth.schema";

export const TimesheetData = z.object({
  workLogId: z.number().optional(),
  date: z.string().refine(
    (v) => isMatch(v, 'yyyy-MM-dd'),
    { message: 'Date format must be "yyyy-MM-dd"' }
  ).openapi({ example: '2025-05-01' }),
  employeeId: z.number(),
  positionId: z.number(),
  checkInDate: z.string().datetime().nullable().optional(),
  checkOutDate: z.string().datetime().nullable().optional(),
  totalSeconds: z.number().nullable().optional(),
  totalSecondsBreak: z.number().nullable().optional(),
  month: z.number().gte(1).lte(12),
  year: z.number(),
  hourlyRate: z.number().nullable().optional(),
  rate: z.number(),
  rateType: RateType,
  comment: z.string().nullable().optional(),
})

export const TimesheetGetDailyQuery = z.object({
  hotelId: z.coerce.number().optional(),
  date: z.string().refine(
    (v) => isMatch(v, 'yyyy-MM-dd'),
    { message: 'Date format must be "yyyy-MM-dd"' }
  ).openapi({ example: '2025-05-01' }).optional(),
})

export const TimesheetGetDaily = z.object({
  query: TimesheetGetDailyQuery
})

export const TimesheetGetMonthlyQuery = z.object({
  year: z.coerce.number().optional(),
  month: z.coerce.number().optional(),
  hotelId: z.coerce.number().optional(),
})

export const TimesheetGetMonthly = z.object({
  query: TimesheetGetMonthlyQuery
})

export const TimesheetCreateInactiveLogsBody = z.object({
  startDate: z.string().refine(
    (v) => isMatch(v, 'yyyy-MM-dd'),
    { message: 'Date format must be "yyyy-MM-dd"' }
  ).openapi({ example: '2025-05-01' }),
  endDate: z.string().refine(
    (v) => isMatch(v, 'yyyy-MM-dd'),
    { message: 'Date format must be "yyyy-MM-dd"' }
  ).openapi({ example: '2025-05-01' }),
})

export const TimesheetCreateInactiveLogs = z.object({
  body: TimesheetCreateInactiveLogsBody
})

export type TimesheetData = TypeOf<typeof TimesheetData>
export type TimesheetGetDailyQuery = TypeOf<typeof TimesheetGetDailyQuery>
export type TimesheetGetMonthlyQuery = TypeOf<typeof TimesheetGetMonthlyQuery>
export type TimesheetCreateInactiveLogsBody = TypeOf<typeof TimesheetCreateInactiveLogsBody>
export type TimesheetGetMonthlyRequest = Request<{}, {}, {}, TimesheetGetMonthlyQuery> & AuthRequest
export type TimesheetGetDailyRequest = Request<{}, {}, {}, TimesheetGetDailyQuery> & AuthRequest
export type TimesheetCreateInactiveLogsRequest = Request<{}, {}, TimesheetCreateInactiveLogsBody> & AuthRequest