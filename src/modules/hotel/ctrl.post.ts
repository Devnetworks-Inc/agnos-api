import resp from "objectify-response";
import { NextFunction, Response } from "express";
import prisma from "../prisma";
import { HotelCreateRequest } from "./schema";

export const hotelCreateController = async (req: HotelCreateRequest, res: Response, next: NextFunction) => {
  const hotel = await prisma.hotel.create({
    data: req.body,
  })

  resp(res, hotel)
};