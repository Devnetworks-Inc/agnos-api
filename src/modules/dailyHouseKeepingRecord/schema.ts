import { Request } from "express";
import { TypeOf, z } from "zod";

export const DailyHousekeepingRecord = z.object({
  id: z.number(),
  hotelId: z.number(),
  date: z.string().datetime(),
  occupancyPercentage: z.number(),
  numberOfRoomNights: z.number(),

  departureRooms: z.number(),
  stayOverRooms: z.number(),
  dirtyRoomsLastDay: z.number(),
  dayUseRooms: z.number(),
  extraCleaningRooms: z.number(),
  noServiceRooms: z.number(),
  lateCheckoutRooms: z.number(),
  refreshRooms: z.number(),
  roomsCarryOver: z.number(),

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

export type DailyHousekeepingRecord = TypeOf<typeof DailyHousekeepingRecord>
export type DailyHousekeepingRecordCreateBody = TypeOf<typeof DailyHousekeepingRecordCreateBody>
export type DailyHousekeepingRecordUpdateBody = TypeOf<typeof DailyHousekeepingRecordUpdateBody>
export type DailyHousekeepingRecordCreateRequest = Request<{}, {}, DailyHousekeepingRecordCreateBody>
export type DailyHousekeepingRecordUpdateRequest = Request<{}, {}, DailyHousekeepingRecordUpdateBody>