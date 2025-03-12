import { Request } from "express";
import { TypeOf, z } from "zod";
import { AuthRequest } from "../auth.schema";

export const Gender = z.enum(['male', 'female'])

export const Employee = z.object({
  id: z.number(),
  firstName: z.string(),
  middleName: z.string().optional(),
  lastName: z.string(),
  birthdate: z.string().datetime(),
  gender: Gender,
  contactNumber: z.string(),
  email: z.string(),
  address: z.string(),
  hiredDate: z.string().datetime(),
  rateType: z.string().datetime(),
  rate: z.coerce.number().default(0),
})

export const EmployeeCreateBody = Employee.omit({ id: true }).extend({
  hotels: z.array(z.number()).min(1)
})

export const EmployeeCreate = z.object({
  body: EmployeeCreateBody
})

export const EmployeeUpdateBody = EmployeeCreateBody.partial().extend({ id: z.number() })

export const EmployeeUpdate = z.object({
  body: EmployeeUpdateBody
})

export const EmployeeGetQuery = z.object({
  hotelId: z.coerce.number().optional(),
})

export const EmployeeGet = z.object({
  query: EmployeeGetQuery
})

export type Employee = TypeOf<typeof Employee>
export type EmployeeCreateBody = TypeOf<typeof EmployeeCreateBody>
export type EmployeeUpdateBody = TypeOf<typeof EmployeeUpdateBody>
export type EmployeeGetQuery = TypeOf<typeof EmployeeGetQuery>
export type EmployeeCreateRequest = Request<{}, {}, EmployeeCreateBody> & AuthRequest
export type EmployeeUpdateRequest = Request<{}, {}, EmployeeUpdateBody> & AuthRequest
export type EmployeeGetRequest = Request<{}, {}, {}, EmployeeGetQuery> & AuthRequest