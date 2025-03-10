import { Request } from "express";
import { TypeOf, z } from "zod";

export const ServiceEntry = z.object({
  id: z.number(),
  dailyRecordId: z.number(),
  serviceName: z.string(),
  totalCost: z.coerce.number(),
})

export const ServiceEntryCreateBody = ServiceEntry.omit({ id: true })

export const ServiceEntryCreate = z.object({
  body: ServiceEntryCreateBody
})


export const ServiceEntryUpdateBody = ServiceEntryCreateBody.partial().extend({ id: z.number() })

export const ServiceEntryUpdate = z.object({
  body: ServiceEntryUpdateBody
})

export type ServiceEntry = TypeOf<typeof ServiceEntry>
export type ServiceEntryCreateBody = TypeOf<typeof ServiceEntryCreateBody>
export type ServiceEntryUpdateBody = TypeOf<typeof ServiceEntryUpdateBody>
export type ServiceEntryCreateRequest = Request<{}, {}, ServiceEntryCreateBody>
export type ServiceEntryUpdateRequest = Request<{}, {}, ServiceEntryUpdateBody>