import { TypeOf, z } from "zod";
import { Id } from "../id/schema";
import { Request } from "express";

export const FileSchema = z.string().describe('File to upload').openapi({ format: 'binary' })

export const FileEmployeeUploadParam = z.object({
  employeeId: Id
})

export const FileEmployeeUpload = z.object({
  params: FileEmployeeUploadParam
})

export type FileEmployeeUploadParam = TypeOf<typeof FileEmployeeUploadParam>
export type FileEmployeeUploadRequest = Request<FileEmployeeUploadParam>
