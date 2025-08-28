import { Request, Response } from "express";
import { AuthRequest } from "../auth.schema";
import prisma from "../prisma";
import { role } from "@prisma/client";
import resp from "objectify-response";
import { updateEmployeeWorkLogsPosition } from "./services";

const ROLE = {
  'Admin': 'agnos_admin',
  'Hotel Manager': 'hotel_manager',
  'HSK Manager': 'hsk_manager',
  'HSK Staff': 'hsk_staff',
  'Gouvernante': 'gouvernante',
  "Public Cleaner": 'public_cleaner'
}

type RoleKey = keyof typeof ROLE

export const migrationUpdateContoller = async (req: Request & AuthRequest, res: Response ) => {
  const employees = await prisma.employee.findMany({
    where: { position: { not: '' } },
    select: {
      id: true,
      position: true,
      rate: true,
      rateType: true,
      user: true,
      minimumWeeklyHours: true,
      overtimeRate: true,
    }
  })

  const positionData: {
    employeeId: number,
    userId?: number,
    role: role,
    rate: number,
    rateType: string,
    minimumWeeklyHours?: number | null,
    overtimeRate?: number | null,
  }[] = []
  
  for (const employee of employees) {
    const { position, id, user, rate, rateType, minimumWeeklyHours, overtimeRate } = employee
    const userId = user.length ? user[0].id : undefined

    if (ROLE[position as RoleKey]) {
      const data = {
        employeeId: id,
        userId,
        role: ROLE[position as RoleKey] as role,
        rate,
        rateType,
        minimumWeeklyHours,
        overtimeRate,
      }
      positionData.push(data)
    }
  }

  const positions = await prisma.position.createMany({
    data: positionData,
    skipDuplicates: true
  })

  const [workLogsCount, totalRowsUpdated] = await Promise.all([
    prisma.employee_work_log.count(),
    updateEmployeeWorkLogsPosition()
  ])

  resp(res, `Created ${positions.count} positions, Updated ${totalRowsUpdated} work logs of ${workLogsCount} total work logs`)
}