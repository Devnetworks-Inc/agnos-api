import { Request, Response } from "express";
import resp from "objectify-response";
import prisma from "../prisma";

export const employeeGetAllController = async (req: Request, res: Response) => {
  const employees = await prisma.employee.findMany({});
  return resp(res, employees)
}