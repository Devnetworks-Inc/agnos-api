import resp from "objectify-response";
import { NextFunction, Response } from "express";
import prisma from "../prisma";
import { HotelServiceCreateRequest } from "./schema";
import { Prisma } from "@prisma/client";

export const hotelServiceCreateController = async (
  req: HotelServiceCreateRequest,
  res: Response,
  next: NextFunction
) => {
  const { role, currentHotelId } = req.auth!
  let { hotelId = currentHotelId } = req.body

  if (role !== 'agnos_admin') {
    if (!currentHotelId){
      return resp(res, 'Unauthorized', 401)
    }
    hotelId = currentHotelId
  } else if (!hotelId) {
    return resp(res, 'Hotel is required', 401)
  }

  prisma.hotel_service
    .create({
      data: {
        ...req.body,
        hotelId
      }
    })
    .then((serivice) => {
      resp(res, serivice);
    })
    .catch((e) => {
      next(e);
    });
};
