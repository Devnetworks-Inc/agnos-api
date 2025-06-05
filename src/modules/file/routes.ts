import { Router } from "express"
import { validateToken } from "src/middlewares/validateToken"
import { fileUploadEmployeeFilesController, fileUploadProfilePicController } from "./ctrl.post"
import { upload } from "src/middlewares/upload"
import validateRequest from "src/middlewares/validateRequest"
import { FileEmployeeUpload } from "./schema"

const fileRouter = Router()

fileRouter.use(validateToken)

fileRouter.post(
  '/employee-profile/:employeeId',
  validateRequest(FileEmployeeUpload),
  upload.single('file'), fileUploadProfilePicController
)

fileRouter.post(
  '/employee-files/:employeeId',
  validateRequest(FileEmployeeUpload),
  upload.array('files', 10), fileUploadEmployeeFilesController
)

export default fileRouter