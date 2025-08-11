import { Request, Response } from "express";
import { AuthRequest } from "../auth.schema";
import prisma from "../prisma";
import { role } from "@prisma/client";
import resp from "objectify-response";

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
      user: true
    }
  })

  const positionData: {
    employeeId: number,
    userId?: number,
    role: role,
    rate: number,
    rateType: string
  }[] = []
  
  for (const employee of employees) {
    const { position, id, user, rate, rateType } = employee
    const userId = user.length ? user[0].id : undefined

    if (ROLE[position as RoleKey]) {
      const data = {
        employeeId: employee.id,
        userId,
        role: ROLE[position as RoleKey] as role,
        rate,
        rateType
      }
      positionData.push(data)
    }
  }

  const result = await prisma.position.createMany({
    data: positionData,
    skipDuplicates: true
  })

  resp(res, `Updated ${result.count} positions`)
}