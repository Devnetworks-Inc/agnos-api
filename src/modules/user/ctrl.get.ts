import { Request, Response } from "express";
import resp from "objectify-response";
import prisma from "../prisma";

export const userGetAllController = async (req: Request, res: Response) => {
  const users = await prisma.user.findMany({ omit: { password: true } });
  return resp(res, users)
}