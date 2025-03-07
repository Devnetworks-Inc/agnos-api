import resp from "objectify-response";
import { NextFunction, Response } from "express";
import prisma from "../prisma";
import { EmployeeCreateRequest } from "./schema";

export const employeeCreateController = async (req: EmployeeCreateRequest, res: Response, next: NextFunction) => {

  const employee = await prisma.employee.create({
    data: req.body
  })

  resp(res, employee)
};