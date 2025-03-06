import { Request } from "express";
import { TypeOf, z } from "zod";

export const Id = z.string().refine(
  (v) => !isNaN(v as unknown as number),
  { message: 'Param must be a number' }
).openapi({ example: '1212121' })

export const IdParam = z.object({
  id: Id
})

export const IdParamRequest = z.object({
  params: IdParam
})

export type IdParam = TypeOf<typeof IdParam>
export type IdParamRequest = Request<IdParam>
