import { isMatch } from "date-fns";
import { Request } from "express";
import { TypeOf, z } from "zod";
import { AuthRequest } from "../auth.schema";
import { Id } from "../id/schema";

export const DateOnlyString = z.string().refine((val) => isMatch(val, 'yyyy-MM-dd'), {
  message: "Date format must be ''yyyy-MM-dd'",
}).openapi({ example: '2025-03-01' })

export const DailyHousekeepingRecord = z.object({
  id: z.number(),
  hotelId: z.number(),
  date: z.string().refine(
    (v) => isMatch(v, 'yyyy-MM-dd'),
    { message: 'Date format must be "yyyy-MM-dd"' }
  ).openapi({ example: '2025-05-01' }),
  month: z.number().gte(1).lte(12),
  year: z.number(),
  occupancyPercentage: z.coerce.number().gte(0).multipleOf(0.01),
  numberOfRoomNights: z.coerce.number().gte(0).multipleOf(1),

  departureRooms: z.coerce.number().gte(0).multipleOf(1),
  stayOverRooms: z.coerce.number().gte(0).multipleOf(1),
  dirtyRoomsLastDay: z.coerce.number().gte(0).multipleOf(1),
  dayUseRooms: z.coerce.number().gte(0).multipleOf(1),
  extraCleaningRooms: z.coerce.number().gte(0).multipleOf(1),
  noServiceRooms: z.coerce.number().gte(0).multipleOf(1),
  lateCheckoutRooms: z.coerce.number().gte(0).multipleOf(1),
  refreshRooms: z.coerce.number().gte(0).multipleOf(1),
  roomsCarryOver: z.coerce.number().gte(0).multipleOf(1),
  services: z.array(z.number()),

  // Auto Calculated Fields
  totalCleanedRooms: z.number().default(0),
  totalRefreshRooms: z.number().default(0),
  totalHousekeepingManagerCost: z.number().default(0),
  totalHousekeepingCleanerCost: z.number().default(0),

  approvedByHskManagerId: z.number().optional(),
  approvedByHotelManagerId: z.number().optional(),
  hskManagerApprovedDate: z.string().datetime().optional(),
  hotelManagerApprovedDate: z.string().datetime().optional(),
})

export const DailyHousekeepingRecordCreateBody = DailyHousekeepingRecord.omit({
  id: true,
  month: true,
  year: true,
  totalCleanedRooms: true,
  totalRefreshRooms: true,
  totalHousekeepingManagerCost: true,
  totalHousekeepingCleanerCost: true,
  approvedByHotelManagerId: true,
  approvedByHskManagerId: true,
  hskManagerApprovedDate: true,
  hotelManagerApprovedDate: true
})

export const DailyHousekeepingRecordCreate = z.object({
  body: DailyHousekeepingRecordCreateBody
})

export const DailyHousekeepingRecordUpdateBody = DailyHousekeepingRecordCreateBody.partial().extend({ id: z.number() })

export const DailyHousekeepingRecordUpdate = z.object({
  body: DailyHousekeepingRecordUpdateBody
})

export const DailyHousekeepingRecordGetQuery = z.object({
  startDate: z.string().refine((val) => isMatch(val, 'yyyy-MM-dd'), {
    message: "Date format must be ''yyyy-MM-dd'",
  }).openapi({ example: '2025-03-01' }).optional(),
  endDate: z.string().refine((val) => isMatch(val, 'yyyy-MM-dd'), {
    message: "Date format must be ''yyyy-MM-dd'",
  }).openapi({ example: '2025-03-01' }).optional(),
})

export const DailyHousekeepingRecordGet = z.object({
  query: DailyHousekeepingRecordGetQuery
})

export const MonthlyHousekeepingRecordGetQuery = z.object({
  startDate: DateOnlyString.optional(),
  endDate: DateOnlyString.optional(),
})

export const MonthlyHousekeepingRecordGet = z.object({
  query: MonthlyHousekeepingRecordGetQuery
})

export type DailyHousekeepingRecord = TypeOf<typeof DailyHousekeepingRecord>
export type DailyHousekeepingRecordCreateBody = TypeOf<typeof DailyHousekeepingRecordCreateBody>
export type DailyHousekeepingRecordUpdateBody = TypeOf<typeof DailyHousekeepingRecordUpdateBody>
export type DailyHousekeepingRecordGetQuery = TypeOf<typeof DailyHousekeepingRecordGetQuery>
export type MonthlyHousekeepingRecordGetQuery = TypeOf<typeof MonthlyHousekeepingRecordGetQuery>
export type DailyHousekeepingRecordCreateRequest = Request<{}, {}, DailyHousekeepingRecordCreateBody> & AuthRequest
export type DailyHousekeepingRecordUpdateRequest = Request<{}, {}, DailyHousekeepingRecordUpdateBody> & AuthRequest
export type DailyHousekeepingRecordGetRequest = Request<{}, {}, {}, DailyHousekeepingRecordGetQuery> & AuthRequest
export type MonthlyHousekeepingRecordGetRequest = Request<{}, {}, {}, MonthlyHousekeepingRecordGetQuery> & AuthRequest