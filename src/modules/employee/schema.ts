import { Request } from "express";
import { TypeOf, z } from "zod";

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

export const EmployeeCreateBody = Employee.omit({ id: true })

export const EmployeeCreate = z.object({
  body: EmployeeCreateBody
})

export const EmployeeUpdate = z.object({
  body: Employee
})

export type Employee = TypeOf<typeof Employee>
export type EmployeeCreateBody = TypeOf<typeof EmployeeCreateBody>
export type EmployeeCreateRequest = Request<{}, {}, EmployeeCreateBody>
export type EmployeeUpdateRequest = Request<{}, {}, Employee>