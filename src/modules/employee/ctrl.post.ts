import resp from "objectify-response";
import { NextFunction, Response } from "express";
import prisma from "../prisma";
import { EmployeeCreateRequest, EmployeeCreateShareableUrlRequest } from "./schema";
import { nanoid } from "nanoid";

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

export const employeeCreateShareableUrlController = async (req: EmployeeCreateShareableUrlRequest, res: Response, next: NextFunction) => {
  const { id, expiryDate } = req.body

  const { shareableUrl, urlExpiryDate } = await prisma.employee.update({
    where: { id },
    data: {
      shareableUrl: nanoid(),
      urlExpiryDate: expiryDate
    }
  })

  resp(res, { shareableUrl, urlExpiryDate })
};