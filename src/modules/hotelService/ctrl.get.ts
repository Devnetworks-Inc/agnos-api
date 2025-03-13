import { Request, Response } from "express";
import resp from "objectify-response";
import prisma from "../prisma";
import { IdParam } from "../id/schema";
import { AuthRequest } from "../auth.schema";

export const hotelServiceGetAllController = async (req: Request & AuthRequest, res: Response) => {
  const services = await prisma.hotel_service.findMany({});
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