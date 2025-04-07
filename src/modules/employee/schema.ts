import { Request } from "express";
import { TypeOf, z } from "zod";
import { AuthRequest } from "../auth.schema";

export const EmployeeWorkLog = z.object({
  id: z.number(),
  employeeId: z.number(),
  checkInDate: z.string().datetime(),
  checkOutDate: z.string().datetime().optional(),
  totalSeconds: z.number().optional(),
})

export const EmployeeBreakLog = z.object({
  id: z.number(),
  workLogId: z.number(),
  breakStartDate: z.string().datetime(),
  breakEndDate: z.string().datetime().optional(),
  totalSeconds: z.number().optional(),
})

export const Gender = z.enum(['male', 'female']);

export const EmployeeStatus = z.enum(['check_in', 'check_out', 'on_break'])

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
  religion: z.string().optional(),
  civilStatus: z.string().default(''),
  nationality: z.string().optional(),
  children: EmployeeChildren.optional(),
  mobileNumber: z.string().optional(),
  telephoneNumber: z.string().optional(),
  email: z.string().optional(),
  address: z.string(),
  emergencyContactName: z.string().optional(),
  emergencyContactNumber: z.string().optional(),
  healthInsurance: z.string().optional(),
  AHVNumber: z.string().optional(),
  bankAccount: z.string().optional(),
  iban: z.string().optional(),
  hiredDate: z.string().datetime().optional(),
  rateType: z.string().optional(),
  rate: z.coerce.number().default(0),
  position: z.string().optional(),
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
  status: z.enum(['check_in', 'check_out']),
  date: z.string().datetime(),
});

export const EmployeeCheckInOut = z.object({
  body: EmployeeCheckInOutBody
})

export const EmployeeBreakStartEndBody = z.object({
  id: z.number(),
  status: z.enum(['start_break', 'end_break']),
  date: z.string().datetime(),
});

export const EmployeeBreakStartEnd = z.object({
  body: EmployeeBreakStartEndBody
})

export const EmployeeCreateShareableUrlBody = z.object({
  id: z.number(),
  expiryDate: z.string().datetime()
})

export const EmployeeCreateShareableUrl = z.object({
  body: EmployeeCreateShareableUrlBody
})

export const EmployeeUrlSubmitBody = EmployeeCreateBody.omit({ hotelId: true }).extend({
  shareableUrl: z.string()  
})

export const EmployeeUrlSubmit = z.object({
  body: EmployeeUrlSubmitBody
})

export type Employee = TypeOf<typeof Employee>;
export type EmployeeCreateBody = TypeOf<typeof EmployeeCreateBody>;
export type EmployeeUpdateBody = TypeOf<typeof EmployeeUpdateBody>;
export type EmployeeGetQuery = TypeOf<typeof EmployeeGetQuery>;
export type EmployeeCheckInOutBody = TypeOf<typeof EmployeeCheckInOutBody>;
export type EmployeeCreateShareableUrlBody = TypeOf<typeof EmployeeCreateShareableUrlBody>;
export type EmployeeUrlSubmitBody = TypeOf<typeof EmployeeUrlSubmitBody>;
export type EmployeeBreakStartEndBody = TypeOf<typeof EmployeeBreakStartEndBody>;
export type EmployeeCreateRequest = Request<{}, {}, EmployeeCreateBody> & AuthRequest;
export type EmployeeUpdateRequest = Request<{}, {}, EmployeeUpdateBody> & AuthRequest;
export type EmployeeGetRequest = Request<{}, {}, {}, EmployeeGetQuery> & AuthRequest;
export type EmployeeCheckInOutRequest = Request<{}, {}, EmployeeCheckInOutBody> & AuthRequest;
export type EmployeeCreateShareableUrlRequest = Request<{}, {}, EmployeeCreateShareableUrlBody> & AuthRequest;
export type EmployeeBreakStartEndRequest = Request<{}, {}, EmployeeBreakStartEndBody> & AuthRequest;
export type EmployeeUrlSubmitRequest = Request<{}, {}, EmployeeUrlSubmitBody>;
