import { Request } from "express";
import { TypeOf, z } from "zod";

export const Hotel = z.object({
  id: z.number(),
  name: z.string(),
  address: z.string(),
  roomsCleaningRate: z.coerce.number().positive().multipleOf(0.01),
  roomsRefreshRate: z.coerce.number().positive().multipleOf(0.01),
})

export const HotelCreateBody = Hotel.omit({ id: true })

export const HotelCreate = z.object({
  body: HotelCreateBody
})

export const HotelUpdateBody = HotelCreateBody.partial().extend({
  id: z.number()
})

export const HotelUpdate = z.object({
  body: HotelUpdateBody
})

export type Hotel = TypeOf<typeof Hotel>
export type HotelCreateBody = TypeOf<typeof HotelCreateBody>
export type HotelUpdateBody = TypeOf<typeof HotelUpdateBody>
export type HotelCreateRequest = Request<{}, {}, HotelCreateBody>
export type HotelUpdateRequest = Request<{}, {}, HotelUpdateBody>