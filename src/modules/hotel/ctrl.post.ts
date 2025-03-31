import resp from "objectify-response";
import { NextFunction, Response } from "express";
import prisma from "../prisma";
import { HotelCreateRequest } from "./schema";

export const hotelCreateController = async (req: HotelCreateRequest, res: Response, next: NextFunction) => {
  const services = await prisma.service.findMany({})
  const hotel = await prisma.hotel.create({
    data: {
      ...req.body,
      services: {
        createMany: {
          data: services.map(v => ({
            serviceId: v.id,
            serviceRate: 0
          }))
        }
      }
    },
  })

  resp(res, hotel)
};