import resp from "objectify-response";
import { NextFunction, Response } from "express";
import prisma from "../prisma";
import { HotelServiceCreateRequest } from "./schema";

export const hotelServiceCreateController = async (
  req: HotelServiceCreateRequest,
  res: Response,
  next: NextFunction
) => {
  prisma.hotel_service
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
