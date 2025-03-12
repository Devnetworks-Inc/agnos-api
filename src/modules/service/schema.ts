import { Request } from "express";
import { TypeOf, z } from "zod";
import { AuthRequest } from "../auth.schema";

export const Service = z.object({
  id: z.number(),
  name: z.string(),
})

export const ServiceCreateBody = Service.omit({ id: true })

export const ServiceCreate = z.object({
  body: ServiceCreateBody
})


export const ServiceUpdateBody = ServiceCreateBody.partial().extend({ id: z.number() })

export const ServiceUpdate = z.object({
  body: ServiceUpdateBody
})

export type Service = TypeOf<typeof Service>
export type ServiceCreateBody = TypeOf<typeof ServiceCreateBody>
export type ServiceUpdateBody = TypeOf<typeof ServiceUpdateBody>
export type ServiceCreateRequest = Request<{}, {}, ServiceCreateBody> & AuthRequest
export type ServiceUpdateRequest = Request<{}, {}, ServiceUpdateBody> & AuthRequest