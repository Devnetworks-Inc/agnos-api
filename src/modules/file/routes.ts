import { Router } from "express"
import { validateToken } from "src/middlewares/validateToken"
import { fileUploadController } from "./ctrl.post"
import { upload } from "src/middlewares/upload"

const fileRouter = Router()

fileRouter.use(validateToken)
fileRouter.post('/upload', upload.single('file'), fileUploadController)

export default fileRouter