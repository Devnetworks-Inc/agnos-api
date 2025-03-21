import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import resp from "objectify-response";
import prisma from "../prisma";
import { IdParam } from "../id/schema";
import { AuthRequest } from "../auth.schema";

export const hotelServiceDeleteController = (req: Request<IdParam> & AuthRequest, res: Response, next: NextFunction) => {
  const { role, currentHotelId } = req.auth!
  const where: Prisma.hotel_serviceWhereUniqueInput = { id: +req.params.id }

  if (role !== 'agnos_admin') {
    if (!currentHotelId){
      return resp(res, 'Unauthorized', 401)
    }
    where.hotelId = currentHotelId
  }

  prisma.hotel_service.delete({ where })
  .then(() => {
    resp(res, 'Service has been deleted')
  })
  .catch(e => {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2025') {
        return resp(
          res,
          'Record to delete does not exist.',
          400
        )
      }
    }
    next(e)
  })
}