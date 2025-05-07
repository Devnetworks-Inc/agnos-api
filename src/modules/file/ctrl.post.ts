import { Request, Response } from "express";
import resp from "objectify-response";

export const fileUploadController = (req: Request, res: Response) => {
  const { file } = req
  if (!file) {
    return resp(res, 'No file uploaded', 400);
  }

  const data = {
    originalName: file.originalname,
    filename: file.filename,
    path: file.path,
    size: file.size,
  };

  resp(res, data);
}