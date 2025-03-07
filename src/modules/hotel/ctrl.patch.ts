import { NextFunction, Response } from "express";
import resp from "objectify-response";
import { HotelUpdateRequest } from "./schema";
import prisma from "../prisma";
import { Prisma } from "@prisma/client";

export const hotelUpdateController = async (req: HotelUpdateRequest, res: Response, next: NextFunction) => {
  const { id } = req.body

  prisma.hotel.update({
    where: { id },
    data: req.body,
  })
  .then((hotel) => {
    resp(res, hotel)
  })
  .catch(e => {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2025') {
        return resp(
          res,
          'Record to update does not exist.',
          400
        )
      }
    }
    next(e)
  })
}