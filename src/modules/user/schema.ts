import { Request } from "express";
import { TypeOf, z } from "zod";
import { AuthRequest } from "../auth.schema";

export const UserRole = z.enum([
  'agnos_admin',
  'hsk_manager',
  'hsk_staff',
  'hotel_manager',
  'check_in_assistant'
])

export const User = z.object({
  id: z.number(),
  employeeId: z.number().optional(),
  username: z.string(),
  password: z.string(),
  role: UserRole
})

export const LoginBody = z.object({
  username: z.string(),
  password: z.string().min(6),
})

export const Login = z.object({
  body: LoginBody,
});

export const UserCreateBody = User.omit({ id: true })

export const UserCreate = z.object({
  body: UserCreateBody
})

export const UserUpdateBody = UserCreateBody.partial().extend({ id: z.number() })
export const UserUpdate = z.object({
  body: UserUpdateBody
})

export type User = TypeOf<typeof User>
export type UserCreateBody = TypeOf<typeof UserCreateBody>
export type LoginBody = TypeOf<typeof LoginBody>
export type UserUpdateBody = TypeOf<typeof UserUpdateBody>
export type LoginRequest = Request<{}, {}, LoginBody>
export type UserCreateRequest = Request<{}, {}, UserCreateBody> & AuthRequest
export type UserUpdateRequest = Request<{}, {}, UserUpdateBody> & AuthRequest