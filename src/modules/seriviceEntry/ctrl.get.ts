import { Request, Response } from "express";
import resp from "objectify-response";
import prisma from "../prisma";
import { IdParam } from "../id/schema";
import { AuthRequest } from "../auth.schema";

export const serviceEntryGetAllController = async (req: Request & AuthRequest, res: Response) => {
  const serviceEntrys = await prisma.service_entry.findMany({});
  return resp(res, serviceEntrys)
}

export const serviceEntryGetByIdController = async (req: Request<IdParam> & AuthRequest, res: Response) => {
  const id = +req.params.id
  const serviceEntry = await prisma.service_entry.findUnique({
    where: { id }
  });
  if (!serviceEntry) {
    return resp(res, 'Service Entry not found', 404)
  }

  resp(res, serviceEntry)
}