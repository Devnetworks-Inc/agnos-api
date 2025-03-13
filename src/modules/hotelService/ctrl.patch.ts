import { NextFunction, Response } from "express";
import resp from "objectify-response";
import { HotelServiceUpdateRequest } from "./schema";
import prisma from "../prisma";
import { Prisma } from "@prisma/client";

export const hotelServiceUpdateController = async (req: HotelServiceUpdateRequest, res: Response, next: NextFunction) => {
  const { id } = req.body

  prisma.hotel_service.update({
    where: { id },
    data: req.body,
  })
  .then((service) => {
    resp(res, service)
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