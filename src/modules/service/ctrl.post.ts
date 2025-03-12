import resp from "objectify-response";
import { NextFunction, Response } from "express";
import prisma from "../prisma";
import { ServiceCreateRequest } from "./schema";

export const serviceCreateController = async (
  req: ServiceCreateRequest,
  res: Response,
  next: NextFunction
) => {
  prisma.service
    .create({
      data: req.body,
    })
    .then((serivice) => {
      resp(res, serivice);
    })
    .catch((e) => {
      next(e);
    });
};
