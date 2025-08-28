import { Request, Response } from "express";
import resp from "objectify-response";
import prisma from "../prisma";
import { IdParam } from "../id/schema";
import { AuthRequest } from "../auth.schema";
import { HotelIdParam } from "./schema";

export const hotelGetAllController = async (req: Request & AuthRequest, res: Response) => {
  const hotels = await prisma.hotel.findMany({});
  return resp(res, hotels)
}

export const hotelGetByIdController = async (req: Request<IdParam> & AuthRequest, res: Response) => {
  const id = +req.params.id
  const hotel = await prisma.hotel.findUnique({
    where: { id },
    include: {
      services: {
        include: { service: { select: { name: true } } }
      }
    }
  });
  if (!hotel) {
    return resp(res, 'Hotel not found', 404)
  }

  resp(res, hotel)
}

export const hotelGetEmployeesAsOptionsController = async (req: Request<HotelIdParam> & AuthRequest, res: Response) => {
  const hotelId = +req.params.hotelId

  const options = await prisma.employee.findMany({
    where: { positions: { some: { userId: null } }, hotelId },
    select: {
      id: true,
      firstName: true, middleName: true, lastName: true,
      positions: { where: { userId: null } }
    }
  })

  return resp(res, options)
}