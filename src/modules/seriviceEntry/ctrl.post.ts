import resp from "objectify-response";
import { NextFunction, Response } from "express";
import prisma from "../prisma";
import { ServiceEntryCreateRequest } from "./schema";
import { Prisma } from "@prisma/client";

export const serviceEntryCreateController = async (
  req: ServiceEntryCreateRequest,
  res: Response,
  next: NextFunction
) => {
  prisma.service_entry
    .create({
      data: req.body,
    })
    .then((seriviceEntry) => {
      resp(res, seriviceEntry);
    })
    .catch((e) => {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2003" && e.meta?.["field_name"] === "dailyRecordId") {
          return resp(res, "Daily Record does not exist.", 400);
        }
      }
      next(e);
    });
};
