import { Response } from "express";
import resp from "objectify-response";
import prisma from "../prisma";
import { EmployeeGetRequest } from "./schema";
import { Prisma } from "@prisma/client";

export const employeeGetController = async (req: EmployeeGetRequest, res: Response) => {
  const { role, currentHotelId } = req.auth!
  let { hotelId } = req.query
  const where: Prisma.employeeWhereInput = {}

  if (role !== 'agnos_admin' && role !== 'hsk_manager') {
    if (!currentHotelId) {
      return resp(res, 'Unauthorized', 401)
    }
    hotelId = currentHotelId
  }

  if (hotelId) {
    where.hotelId = hotelId
  }

  const employees = await prisma.employee.findMany({ where });
  return resp(res, employees)
}