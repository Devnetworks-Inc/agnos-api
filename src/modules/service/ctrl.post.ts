import resp from "objectify-response";
import { NextFunction, Response } from "express";
import prisma from "../prisma";
import { ServiceCreateRequest } from "./schema";

export const serviceCreateController = async (
  req: ServiceCreateRequest,
  res: Response,
) => {
  const hotels = await prisma.hotel.findMany()
  const service = await prisma.service.create({
    data: {
      ...req.body,
      hotelServices: {
        createMany: {
          data: hotels.map(v => ({
            hotelId: v.id,
            serviceRate: 0
          }))
        }
      }
    }
  })

  resp(res, service)
};
