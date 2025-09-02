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

export type TimesheetData = TypeOf<typeof TimesheetData>
export type TimesheetGetDailyQuery = TypeOf<typeof TimesheetGetDailyQuery>
export type TimesheetGetDailyRequest = Request<{}, {}, {}, TimesheetGetDailyQuery> & AuthRequest