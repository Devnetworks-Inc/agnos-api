import { NextFunction, Response } from "express";
import resp from "objectify-response";
import { HotelServiceUpdateRequest } from "./schema";
import prisma from "../prisma";
import { Prisma } from "@prisma/client";

export const hotelServiceUpdateController = async (req: HotelServiceUpdateRequest, res: Response, next: NextFunction) => {
  const { id } = req.body
  const { role, currentHotelId } = req.auth!
  const where: Prisma.hotel_serviceWhereUniqueInput = { id }

  if (role !== 'agnos_admin') {
    if (!currentHotelId){
      return resp(res, 'Unauthorized', 401)
    }
    where.hotelId = currentHotelId
  }

  prisma.hotel_service.update({
    where,
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