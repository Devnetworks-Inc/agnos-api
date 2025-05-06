import { z, TypeOf } from "zod";
import { UserRole } from "./user/schema";

export const Auth = z.object({
  id: z.number().positive(),
  username: z.string(),
  role: UserRole,
  currentHotelId: z.number().nullable().optional(),
  employeeId: z.number().nullable().optional(),
})

export type Auth = TypeOf<typeof Auth>

export type AuthRequest = {
  auth?: Auth
}
