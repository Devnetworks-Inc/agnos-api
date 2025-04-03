import { Request } from "express";
import { object, TypeOf, z } from "zod";
import { AuthRequest } from "../auth.schema";

export const EmployeeWorkLog = z.object({
  id: z.number(),
  employeeId: z.number(),
  checkInDate: z.string().datetime(),
  checkOutDate: z.string().datetime().optional()
})

export const Gender = z.enum(['male', 'female']);

export const EmployeeStatus = z.enum(['check_in', 'check_out'])

export const EmployeeChildren = z.array(z.object({
  firstName: z.string(),
  middleName: z.string().optional(),
  lastName: z.string(),
  birthDate: z.string().datetime(),
}))

export const Employee = z.object({
  id: z.number(),
  firstName: z.string(),
  middleName: z.string().optional(),
  lastName: z.string(),
  birthdate: z.string().datetime(),
  gender: Gender,
  religion: z.string(),
  civilStatus: z.string(),
  nationality: z.string(),
  children: EmployeeChildren.optional(),
  mobileNumber: z.string(),
  telephoneNumber: z.string(),
  email: z.string(),
  address: z.string(),
  emergycyContactName: z.string(),
  emergycyContactNumber: z.string(),
  healthInsurance: z.string(),
  AHVNumber: z.string(),
  bankAccount: z.string(),
  iban: z.string(),
  hiredDate: z.string().datetime(),
  rateType: z.string(),
  rate: z.coerce.number().default(0),
  position: z.string(),
  hotelId: z.coerce.number(),  // Single hotel ID
  shareableUrl: z.string().optional(),
  urlExpiryDate: z.string().datetime().optional()
});

export const EmployeeCreateBody = Employee.omit({ id: true, shareableUrl: true, urlExpiryDate: true }).extend({
  hotelId: z.coerce.number(),  // Single hotel ID for the employee
});

export const EmployeeCreate = z.object({
  body: EmployeeCreateBody
});

export const EmployeeUpdateBody = EmployeeCreateBody.partial().extend({
  id: z.number(),
});

export const EmployeeUpdate = z.object({
  body: EmployeeUpdateBody
});

export const EmployeeGetQuery = z.object({
  hotelId: z.coerce.number().optional(), // Optional filtering by hotelId
});

export const EmployeeGet = z.object({
  query: EmployeeGetQuery
});

export const EmployeeCheckInOutBody = z.object({
  id: z.number(),
  status: EmployeeStatus
});

export const EmployeeCheckInOut = z.object({
  body: EmployeeCheckInOutBody
})

export const EmployeeCreateShareableUrlBody = z.object({
  id: z.number(),
  expiryDate: z.string().datetime()
})

export const EmployeeCreateShareableUrl = z.object({
  body: EmployeeCreateShareableUrlBody
})

export type Employee = TypeOf<typeof Employee>;
export type EmployeeCreateBody = TypeOf<typeof EmployeeCreateBody>;
export type EmployeeUpdateBody = TypeOf<typeof EmployeeUpdateBody>;
export type EmployeeGetQuery = TypeOf<typeof EmployeeGetQuery>;
export type EmployeeCheckInOutBody = TypeOf<typeof EmployeeCheckInOutBody>;
export type EmployeeCreateShareableUrlBody = TypeOf<typeof EmployeeCreateShareableUrlBody>;
export type EmployeeCreateRequest = Request<{}, {}, EmployeeCreateBody> & AuthRequest;
export type EmployeeUpdateRequest = Request<{}, {}, EmployeeUpdateBody> & AuthRequest;
export type EmployeeGetRequest = Request<{}, {}, {}, EmployeeGetQuery> & AuthRequest;
export type EmployeeCheckInOutRequest = Request<{}, {}, EmployeeCheckInOutBody> & AuthRequest;
export type EmployeeCreateShareableUrlRequest = Request<{}, {}, EmployeeCreateShareableUrlBody> & AuthRequest;
