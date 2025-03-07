import { NextFunction, Response } from "express";
import resp from "objectify-response";
import { EmployeeUpdateRequest } from "./schema";
import prisma from "../prisma";
import { Prisma } from "@prisma/client";

export const employeeUpdateController = async (req: EmployeeUpdateRequest, res: Response, next: NextFunction) => {
  const { id } = req.body

  prisma.employee.update({
    where: { id },
    data: req.body,
  })
  .then((employee) => {
    resp(res, employee)
  })
  .catch(e => {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2025') {
        return resp(
          res,
          'Record to update does not exist.',
          400
        )
      }
    }
    next(e)
  })
}