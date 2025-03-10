import resp from "objectify-response";
import { NextFunction, Response } from "express";
import prisma from "../prisma";
import { ServiceEntryCreateRequest } from "./schema";

export const serviceEntryCreateController = async (req: ServiceEntryCreateRequest, res: Response, next: NextFunction) => {
  const serviceEntry = await prisma.service_entry.create({
    data: req.body,
  })

  resp(res, serviceEntry)
};