import { Request } from "express";
import { TypeOf, z } from "zod";
import { AuthRequest } from "../auth.schema";
import { isMatch } from "date-fns";
import { Id } from "../id/schema";

export const RateType = z.enum(['hourly', 'daily', 'weekly', '15days', 'monthly'])

export const Position = z.enum(['agnos_admin', 'hsk_manager', 'hsk_staff', 'hotel_manager', 'check_in_assistant', 'gouvernante', 'public_cleaner'])

export const EmployeeWorkLog = z.object({
  id: z.number(),
  date: z.string().refine(
    (v) => isMatch(v, 'yyyy-MM-dd'),
    { message: 'Date format must be "yyyy-MM-dd"' }
  ).openapi({ example: '2025-05-01' }),
  // employeeId: z.number(),
  positionId: z.number(),
  checkInDate: z.string().datetime(),
  checkOutDate: z.string().datetime().nullable().optional(),
  totalSeconds: z.number().optional(),
  totalSecondsBreak: z.number().optional(),
  month: z.number().gte(1).lte(12),
  year: z.number(),
  hourlyRate: z.number(),
  rate: z.number(),
  rateType: RateType,
  comment: z.string().optional()
})

export const EmployeeBreakLog = z.object({
  id: z.number(),
  workLogId: z.number(),
  breakStartDate: z.string().datetime(),
  breakEndDate: z.string().datetime().nullable().optional(),
  totalSeconds: z.number().optional(),
})

export const EmployeeBreakLogCreate = EmployeeBreakLog.omit({
  id: true, workLogId: true, totalSeconds: true
})

export const EmployeeWorkLogCreateBody = EmployeeWorkLog.omit({
  id: true, totalSeconds: true, totalSecondsBreak: true, month: true, year: true, rate: true, rateType: true, hourlyRate: true
}).extend({
  breaks: z.array(EmployeeBreakLogCreate).optional(),
  comment: z.string()
})

export const EmployeeWorkLogUpdateBody = EmployeeWorkLogCreateBody.partial().extend({
  employeeId: z.number(),
  workLogId: z.number(),
  rate: z.number().optional(),
  rateType: RateType.optional(),
  comment: z.string()
}).omit({ date: true, positionId: true })

export const EmployeeWorkLogCreate = z.object({
  body: EmployeeWorkLogCreateBody
})

export const EmployeeWorkLogUpdate = z.object({
  body: EmployeeWorkLogUpdateBody
})

export const Gender = z.enum([
  'male', // männlich
  'female', // weiblich
  'other' // andere
]);

export const EmployeeStatus = z.enum(['checked_in', 'checked_out', 'on_break', 'absent', 'day_off'])

export const EmployeeChildren = z.array(z.object({
  firstName: z.string(),
  middleName: z.string().optional(),
  lastName: z.string(),
  birthDate: z.string().datetime().optional().nullable(),
}))

export const Employee = z.object({
  id: z.number(),
  firstName: z.string(),
  middleName: z.string().optional(),
  lastName: z.string(),
  birthdate: z.string().datetime().optional(),
  gender: Gender.default('other'),
  religion: z.string().optional(),
  civilStatus: z.string().default(''),
  nationality: z.string().optional(),
  children: EmployeeChildren.optional(),
  mobileNumber: z.string().optional(),
  telephoneNumber: z.string().optional(),
  email: z.string().optional(),
  // address: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactNumber: z.string().optional(),
  healthInsurance: z.string().optional(),
  AHVNumber: z.string().optional(),
  bankAccount: z.string().optional(),
  iban: z.string().optional(),
  hiredDate: z.string().datetime().optional(),
  // rateType: RateType,
  employmentType: z.string().optional(),
  // rate: z.coerce.number(),
  // position: Position,
  positions: z.array(z.object({
    id: z.number().optional(),
    userId: z.number().nullable().optional(),
    role: Position,
    rateType: RateType,
    rate: z.coerce.number(),
    minimumWeeklyHours: z.coerce.number().nullable().optional(),
    overtimeRate: z.coerce.number().nullable().optional()
  })).min(1, { message: "Employee must have at least 1 position" }),
  activity: z.string().optional(),
  job: z.string().optional(),
  profession: z.string().optional(),
  language: z.string().optional(),
  workPermit: z.string().optional(),
  workValidUntil: z.string().datetime().nullable().optional(),
  hotelId: z.coerce.number(),  // Single hotel ID
  shareableUrl: z.string().optional(),
  urlExpiryDate: z.string().datetime().optional(),
  // minimumWeeklyHours: z.coerce.number().nullable().optional(),
  // overtimeRate: z.coerce.number().nullable().optional()
});

export const EmployeeCreateBody = Employee.omit({ id: true, shareableUrl: true, urlExpiryDate: true }).extend({
  hotelId: z.coerce.number(),  // Single hotel ID for the employee
});

export const EmployeeCreate = z.object({
  body: EmployeeCreateBody
});

export const EmployeeUpdateBody = EmployeeCreateBody.partial().extend({
  id: z.number(),
});

export const EmployeeUpdate = z.object({
  body: EmployeeUpdateBody
});

export const EmployeeGetQuery = z.object({
  hotelId: z.coerce.number().optional(), // Optional filtering by hotelId
});

export const EmployeeGet = z.object({
  query: EmployeeGetQuery
});

export const EmployeeGetByUrlParam = z.object({
  url: z.string(),
});

export const EmployeeGetByUrl = z.object({
  params: EmployeeGetByUrlParam
});

export const EmployeeCheckInOutBody = z.object({
  id: z.number(),
  positionId: z.number().optional(),
  status: z.enum(['check_in', 'check_out']),
  date: z.string().refine(
    (v) => isMatch(v, 'yyyy-MM-dd'),
    { message: 'Date format must be "yyyy-MM-dd"' }
  ).openapi({ example: '2025-05-01' }),
  datetime: z.string().datetime()
});

export const EmployeeCheckInOut = z.object({
  body: EmployeeCheckInOutBody
})

export const EmployeeBreakStartEndBody = z.object({
  id: z.number(),
  status: z.enum(['start_break', 'end_break']),
  date: z.string().datetime(),
});

export const EmployeeBreakStartEnd = z.object({
  body: EmployeeBreakStartEndBody
})

export const EmployeeCreateShareableUrlBody = z.object({
  id: z.number(),
  expiryDate: z.string().datetime()
})

export const EmployeeCreateShareableUrl = z.object({
  body: EmployeeCreateShareableUrlBody
})

export const EmployeeUrlSubmitBody = EmployeeCreateBody.omit({ hotelId: true, positions: true }).extend({
  shareableUrl: z.string(),
})

export const EmployeeUrlSubmit = z.object({
  body: EmployeeUrlSubmitBody
})

export const EmployeeGetWorkLogsQuery = z.object({
  hotelId: z.coerce.number().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional()
})

export const EmployeeGetWorkLogs = z.object({
  query: EmployeeGetWorkLogsQuery
})

export const EmployeeGetWorkLogsByIdPaginatedParams = z.object({
  employeeId: Id
})

export const EmployeeGetWorkLogsByIdPaginatedQuery = z.object({
  pageNumber: z.coerce.number().optional(),
  pageSize: z.coerce.number().optional(),
  startDate: z.string().refine(
    (v) => isMatch(v, 'yyyy-MM-dd'),
    { message: 'Date format must be "yyyy-MM-dd"' }
  ).openapi({ example: '2025-05-01' }).optional(),
  endDate: z.string().refine(
    (v) => isMatch(v, 'yyyy-MM-dd'),
    { message: 'Date format must be "yyyy-MM-dd"' }
  ).openapi({ example: '2025-05-01' }).optional(),
  includeTotalItems: z.enum(['true', 'false']).optional()
})

export const EmployeeGetWorkLogsByIdPaginated = z.object({
  params: EmployeeGetWorkLogsByIdPaginatedParams,
  query: EmployeeGetWorkLogsByIdPaginatedQuery
})

export const EmployeeGetWorkLogsByHotelIdSummaryDailyParam = z.object({
  hotelId: Id
})

export const EmployeeGetWorkLogsByHotelIdSummaryDailyQuery = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional()
})

export const EmployeeGetWorkLogsByHotelIdSummaryDaily = z.object({
  params: EmployeeGetWorkLogsByHotelIdSummaryDailyParam,
  query: EmployeeGetWorkLogsByHotelIdSummaryDailyQuery
})

export const EmployeeWorkLogCommentBody =  z.object({
  workLogId: z.number(),
  comment: z.string()
})

export const EmployeeWorkLogComment =  z.object({
  body: EmployeeWorkLogCommentBody
})

export const EmployeeGetWorkLogEditLogsParam = z.object({
  workLogId: Id
})

export const EmployeeGetWorkLogEditLogs = z.object({
  params: EmployeeGetWorkLogEditLogsParam
})

export const EmployeeGetWorkLogsByMonthQuery = z.object({
  year: z.coerce.number().optional(),
  month: z.coerce.number().optional(),
  hotelId: z.coerce.number().optional(),
})

export const EmployeeGetWorkLogsByMonth = z.object({
  query: EmployeeGetWorkLogsByMonthQuery
})

export const EmployeeGetAsOptionsQuery = z.object({
  includePositionId: z.coerce.number().optional(),
})

export const EmployeeGetAsOptions = z.object({
  query: EmployeeGetAsOptionsQuery
})

export type RateType = TypeOf<typeof RateType>;
export type Employee = TypeOf<typeof Employee>;
export type EmployeeCreateBody = TypeOf<typeof EmployeeCreateBody>;
export type EmployeeUpdateBody = TypeOf<typeof EmployeeUpdateBody>;
export type EmployeeGetQuery = TypeOf<typeof EmployeeGetQuery>;
export type EmployeeCheckInOutBody = TypeOf<typeof EmployeeCheckInOutBody>;
export type EmployeeCreateShareableUrlBody = TypeOf<typeof EmployeeCreateShareableUrlBody>;
export type EmployeeUrlSubmitBody = TypeOf<typeof EmployeeUrlSubmitBody>;
export type EmployeeBreakStartEndBody = TypeOf<typeof EmployeeBreakStartEndBody>;
export type EmployeeGetByUrlParam = TypeOf<typeof EmployeeGetByUrlParam>;
export type EmployeeGetWorkLogsQuery = TypeOf<typeof EmployeeGetWorkLogsQuery>;
export type EmployeeBreakLogCreate = TypeOf<typeof EmployeeBreakLogCreate>;
export type EmployeeWorkLogCreateBody = TypeOf<typeof EmployeeWorkLogCreateBody>;
export type EmployeeWorkLogUpdateBody = TypeOf<typeof EmployeeWorkLogUpdateBody>;
export type EmployeeGetWorkLogsByHotelIdSummaryDailyParam = TypeOf<typeof EmployeeGetWorkLogsByHotelIdSummaryDailyParam>;
export type EmployeeGetWorkLogsByHotelIdSummaryDailyQuery = TypeOf<typeof EmployeeGetWorkLogsByHotelIdSummaryDailyQuery>;
export type EmployeeGetWorkLogsByHotelIdSummaryDaily = TypeOf<typeof EmployeeGetWorkLogsByHotelIdSummaryDaily>;
export type EmployeeGetWorkLogsByIdPaginatedParams = TypeOf<typeof EmployeeGetWorkLogsByIdPaginatedParams>;
export type EmployeeGetWorkLogsByIdPaginatedQuery = TypeOf<typeof EmployeeGetWorkLogsByIdPaginatedQuery>;
export type EmployeeWorkLogCommentBody = TypeOf<typeof EmployeeWorkLogCommentBody>;
export type EmployeeGetWorkLogEditLogsParam = TypeOf<typeof EmployeeGetWorkLogEditLogsParam>;
export type EmployeeGetWorkLogsByMonthQuery = TypeOf<typeof EmployeeGetWorkLogsByMonthQuery>;
export type EmployeeGetAsOptionsQuery = TypeOf<typeof EmployeeGetAsOptionsQuery>;
export type EmployeeCreateRequest = Request<{}, {}, EmployeeCreateBody> & AuthRequest;
export type EmployeeUpdateRequest = Request<{}, {}, EmployeeUpdateBody> & AuthRequest;
export type EmployeeGetRequest = Request<{}, {}, {}, EmployeeGetQuery> & AuthRequest;
export type EmployeeCheckInOutRequest = Request<{}, {}, EmployeeCheckInOutBody> & AuthRequest;
export type EmployeeCreateShareableUrlRequest = Request<{}, {}, EmployeeCreateShareableUrlBody> & AuthRequest;
export type EmployeeBreakStartEndRequest = Request<{}, {}, EmployeeBreakStartEndBody> & AuthRequest;
export type EmployeeGetWorkLogsRequest = Request<{}, {}, {}, EmployeeGetWorkLogsQuery> & AuthRequest;
export type EmployeeWorkLogCreateRequest = Request<{}, {}, EmployeeWorkLogCreateBody> & AuthRequest;
export type EmployeeWorkLogUpdateRequest = Request<{}, {}, EmployeeWorkLogUpdateBody> & AuthRequest;
export type EmployeeGetWorkLogsByIdPaginatedRequest = Request<EmployeeGetWorkLogsByIdPaginatedParams, {}, {}, EmployeeGetWorkLogsByIdPaginatedQuery> & AuthRequest;
export type EmployeeGetWorkLogsByHotelIdSummaryDailyRequest = Request<EmployeeGetWorkLogsByHotelIdSummaryDailyParam, {}, {}, EmployeeGetWorkLogsByHotelIdSummaryDailyQuery> & AuthRequest;
export type EmployeeWorkLogCommentRequest = Request<{}, {}, EmployeeWorkLogCommentBody> & AuthRequest;
export type EmployeeGetWorkLogEditLogsRequest = Request<EmployeeGetWorkLogEditLogsParam> & AuthRequest;
export type EmployeeGetWorkLogsByMonthRequest = Request<{}, {}, {}, EmployeeGetWorkLogsByMonthQuery> & AuthRequest;
export type EmployeeGetAsOptionsRequest = Request<{}, {}, {}, EmployeeGetAsOptionsQuery> & AuthRequest;

export type EmployeeGetByUrlRequest = Request<EmployeeGetByUrlParam>
export type EmployeeUrlSubmitRequest = Request<{}, {}, EmployeeUrlSubmitBody>;

export type EditWorkLogDetails = {
  prevCheckIn?: string;
  newCheckIn?: string;
  prevCheckOut?: string;
  newCheckOut?: string;
  breaks: {
    prevStartBreak?: string;
    newStartBreak?: string;
    prevEndBreak?: string;
    newEndBreak?: string;
    action: 'create' | 'update' | 'delete';
    position: number;
  }[];
  prevTotalMinsBreak?: number;
  newTotalMinsBreak?: number;
  prevTotalHours?: number;
  newTotalHours?: number;
  correction?: number;
  action: 'create' | 'update'
}