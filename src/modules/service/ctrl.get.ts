import { Request, Response } from "express";
import resp from "objectify-response";
import prisma from "../prisma";
import { IdParam } from "../id/schema";
import { AuthRequest } from "../auth.schema";

export const serviceGetAllController = async (req: Request & AuthRequest, res: Response) => {
  const services = await prisma.service_entry.findMany({});
  return resp(res, services)
}

export const serviceGetByIdController = async (req: Request<IdParam> & AuthRequest, res: Response) => {
  const id = +req.params.id
  const service = await prisma.service_entry.findUnique({
    where: { id }
  });
  if (!service) {
    return resp(res, 'Service Entry not found', 404)
  }

  resp(res, service)
}