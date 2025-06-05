import { Response } from "express";
import resp from "objectify-response";
import prisma from "../prisma";
import { FileEmployeeUploadRequest } from "./schema";

export const fileUploadProfilePicController = async (req: FileEmployeeUploadRequest, res: Response) => {
  const employeeId = +req.params.employeeId
  const { file } = req
  if (!file) {
    return resp(res, 'No file uploaded', 400);
  }

  const {
    filename,
    originalname: originalName,
    mimetype,
    size,
    path: filePath,
    destination: folderPath
  } = file

  const newFile = await prisma.employee.update({
    where: { id: employeeId },
    data: {
      profilePic: {
        create: {
          employeeId,
          filename,
          originalName,
          mimetype,
          size,
          filePath,
          folderPath,
          fileFor: 'employee_profile_pic',
        }
      }
    },
    select: { profilePicId: true }
  }).profilePic()

  resp(res, newFile);
}

export const fileUploadEmployeeFilesController = async (req: FileEmployeeUploadRequest, res: Response) => {
  const employeeId = +req.params.employeeId
  const files = req.files as Express.Multer.File[]
  console.log(files)
  if (!files || !files.length) {
    return resp(res, 'No files uploaded', 400);
  }

  const count = await prisma.file.createMany({
    data: files.map(f => ({
        employeeId,
          filename: f.fieldname,
          originalName: f.originalname,
          mimetype: f.mimetype,
          size: f.size,
          filePath: f.path,
          folderPath: f.destination,
          fileFor: 'employee_file'
    }))
  })
  console.log(count)

  resp(res, 'Successfully upload employee files');
}