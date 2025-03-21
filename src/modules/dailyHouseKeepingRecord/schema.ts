import { isMatch } from "date-fns";
import { Request } from "express";
import { TypeOf, z } from "zod";

export const DailyHousekeepingRecord = z.object({
  id: z.number(),
  hotelId: z.number(),
  date: z.string().datetime(),
  occupancyPercentage: z.coerce.number().positive().multipleOf(0.01),
  numberOfRoomNights: z.coerce.number().positive().multipleOf(1),

  departureRooms: z.coerce.number().positive().multipleOf(1),
  stayOverRooms: z.coerce.number().positive().multipleOf(1),
  dirtyRoomsLastDay: z.coerce.number().positive().multipleOf(1),
  dayUseRooms: z.coerce.number().positive().multipleOf(1),
  extraCleaningRooms: z.coerce.number().positive().multipleOf(1),
  noServiceRooms: z.coerce.number().positive().multipleOf(1),
  lateCheckoutRooms: z.coerce.number().positive().multipleOf(1),
  refreshRooms: z.coerce.number().positive().multipleOf(1),
  roomsCarryOver: z.coerce.number().positive().multipleOf(1),

  // Auto Calculated Fields
  totalCleanedRooms: z.number().default(0),
  totalRefreshRooms: z.number().default(0),
  totalHousekeepingManagerCost: z.number().default(0),
  totalHousekeepingCleanerCost: z.number().default(0),
})

export const DailyHousekeepingRecordCreateBody = DailyHousekeepingRecord.omit({
  id: true,
  totalCleanedRooms: true,
  totalRefreshRooms: true,
  totalHousekeepingManagerCost: true,
  totalHousekeepingCleanerCost: true,
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

export type DailyHousekeepingRecord = TypeOf<typeof DailyHousekeepingRecord>
export type DailyHousekeepingRecordCreateBody = TypeOf<typeof DailyHousekeepingRecordCreateBody>
export type DailyHousekeepingRecordUpdateBody = TypeOf<typeof DailyHousekeepingRecordUpdateBody>
export type DailyHousekeepingRecordGetQuery = TypeOf<typeof DailyHousekeepingRecordGetQuery>
export type DailyHousekeepingRecordCreateRequest = Request<{}, {}, DailyHousekeepingRecordCreateBody>
export type DailyHousekeepingRecordUpdateRequest = Request<{}, {}, DailyHousekeepingRecordUpdateBody>
export type DailyHousekeepingRecordGetRequest = Request<{}, {}, {}, DailyHousekeepingRecordGetQuery>