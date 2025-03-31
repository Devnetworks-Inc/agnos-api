import { Request } from "express";
import { TypeOf, z } from "zod";
import { AuthRequest } from "../auth.schema";

export const HotelService = z.object({
  id: z.number(),
  serviceId: z.number(),
  hotelId: z.number().optional(),
  serviceRate: z.coerce.number().positive().multipleOf(0.01),
})

export const HotelServiceCreateBody = HotelService.omit({ id: true })

export const HotelServiceCreate = z.object({
  body: HotelServiceCreateBody
})

export const HotelServiceUpdateBody = HotelService.pick({ id: true, serviceRate: true })

export const HotelServiceUpdate = z.object({
  body: HotelServiceUpdateBody
})

export type HotelService = TypeOf<typeof HotelService>
export type HotelServiceCreateBody = TypeOf<typeof HotelServiceCreateBody>
export type HotelServiceUpdateBody = TypeOf<typeof HotelServiceUpdateBody>
export type HotelServiceCreateRequest = Request<{}, {}, HotelServiceCreateBody> & AuthRequest
export type HotelServiceUpdateRequest = Request<{}, {}, HotelServiceUpdateBody> & AuthRequest