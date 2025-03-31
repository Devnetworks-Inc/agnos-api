import { Request, Response } from "express";
import resp from "objectify-response";
import prisma from "../prisma";
import { IdParam } from "../id/schema";
import { AuthRequest } from "../auth.schema";
import { Prisma } from "@prisma/client";

export const hotelServiceGetAllController = async (req: Request & AuthRequest, res: Response) => {
  const { role, currentHotelId } = req.auth!
  const where: Prisma.hotel_serviceWhereInput = {}

  if (role !== 'agnos_admin') {
    if (!currentHotelId){
      return resp(res, 'Unauthorized', 401)
    }
    where.hotelId = currentHotelId
    // let count = await prisma.hotel_service.count({ where: { hotelId: currentHotelId } })
    // if (!count) {
    //   const services = await prisma.service.findMany({})
    //   services.length && await prisma.hotel_service.createMany({
    //     data: services.map((v) => ({
    //       serviceId: v.id,
    //       hotelId: currentHotelId,
    //       serviceRate: 0
    //     }))
    //   })
    // }
  }
  const services = await prisma.hotel_service.findMany({ where });
  return resp(res, services)
}

export const hotelServiceGetByIdController = async (req: Request<IdParam> & AuthRequest, res: Response) => {
  const id = +req.params.id
  const hotelService = await prisma.hotel_service.findUnique({
    where: { id }
  });
  if (!hotelService) {
    return resp(res, 'Service Entry not found', 404)
  }

  resp(res, hotelService)
}