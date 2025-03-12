import { Router } from "express"
import validateRequest from "src/middlewares/validateRequest"
import { validateToken } from "src/middlewares/validateToken"
import { ServiceCreate, ServiceUpdate } from "./schema"
import { serviceCreateController } from "./ctrl.post"
import { serviceUpdateController } from "./ctrl.patch"
import { serviceGetAllController, serviceGetByIdController } from "./ctrl.get"
import { IdParamRequest } from "../id/schema"
import { serviceDeleteController } from "./ctrl.delete"

const serviceRouter = Router()

export const serviceBaseUrl = '/services'

serviceRouter.use(validateToken)
serviceRouter.post(serviceBaseUrl, validateRequest(ServiceCreate), serviceCreateController)
serviceRouter.get(serviceBaseUrl+'/:id', validateRequest(IdParamRequest), serviceGetByIdController)
serviceRouter.get(serviceBaseUrl, serviceGetAllController)
serviceRouter.patch(serviceBaseUrl,  validateRequest(ServiceUpdate), serviceUpdateController)
serviceRouter.delete(serviceBaseUrl+'/:id',  validateRequest(IdParamRequest), serviceDeleteController)

export default serviceRouter