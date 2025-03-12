import { Router } from "express"
import validateRequest from "src/middlewares/validateRequest"
import { validateToken } from "src/middlewares/validateToken"
import { ServiceEntryCreate, ServiceEntryUpdate } from "./schema"
import { serviceEntryCreateController } from "./ctrl.post"
import { serviceEntryUpdateController } from "./ctrl.patch"
import { serviceEntryGetAllController, serviceEntryGetByIdController } from "./ctrl.get"
import { IdParamRequest } from "../id/schema"
import { serviceEntryDeleteController } from "./ctrl.delete"

const serviceEntryRouter = Router()

export const serviceEntryBaseUrl = '/service-entries'

serviceEntryRouter.use(validateToken)
serviceEntryRouter.post(serviceEntryBaseUrl, validateRequest(ServiceEntryCreate), serviceEntryCreateController)
serviceEntryRouter.get(serviceEntryBaseUrl+'/:id', validateRequest(IdParamRequest), serviceEntryGetByIdController)
serviceEntryRouter.get(serviceEntryBaseUrl, serviceEntryGetAllController)
serviceEntryRouter.patch(serviceEntryBaseUrl,  validateRequest(ServiceEntryUpdate), serviceEntryUpdateController)
serviceEntryRouter.delete(serviceEntryBaseUrl+'/:id',  validateRequest(IdParamRequest), serviceEntryDeleteController)

export default serviceEntryRouter