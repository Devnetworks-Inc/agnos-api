import { z, TypeOf } from "zod";
import { UserRole } from "./user/schema";

export const Auth = z.object({
  id: z.number().positive(),
  username: z.string(),
  fullName: z.string(),
  role: UserRole,
  currentBranchId: z.number().nullable().optional()
})

export type Auth = TypeOf<typeof Auth>

export type AuthRequest = {
  auth?: Auth
}
