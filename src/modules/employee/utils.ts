import { position, role } from "@prisma/client";
import { Employee, EmployeeCreateBody } from "./schema";
import { TypeOf } from "zod";

type Positions = Employee['positions']

export const checkPositionsChanges = (oldPositions: position[], newPositions: Positions) => {
  const updates: Positions = []
  let creates: Positions = []
  const deletes: role[] = []
  const newRoles = new Map<string, Positions[0]>()

  for (const p of newPositions) {
    newRoles.set(p.role, p)
  }

  for (const p of oldPositions) {
    if (newRoles.has(p.role)) {
      updates.push(newRoles.get(p.role)!)
      newRoles.delete(p.role)
    } else {
      deletes.push(p.role)
    }
  }
  creates = Array.from(newRoles.values())

  return {
    updates, creates, deletes
  }
}