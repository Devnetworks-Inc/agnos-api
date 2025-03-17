import resp from "objectify-response";
import { NextFunction, Response } from "express";
import prisma from "../prisma";
import { EmployeeCreateRequest } from "./schema";

export const employeeCreateController = async (req: EmployeeCreateRequest, res: Response, next: NextFunction) => {
  const { hotelId } = req.body

  const employee = await prisma.employee.create({
    data: {
      ...req.body,
      hotelId,
      status: "check_out",
    }
  })

  resp(res, employee)
};