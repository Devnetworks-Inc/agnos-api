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

serviceEntryRouter.use(validateToken)
serviceEntryRouter.post('/', validateRequest(ServiceEntryCreate), serviceEntryCreateController)
serviceEntryRouter.get('/:id', validateRequest(IdParamRequest), serviceEntryGetByIdController)
serviceEntryRouter.get('/', serviceEntryGetAllController)
serviceEntryRouter.patch('/',  validateRequest(ServiceEntryUpdate), serviceEntryUpdateController)
serviceEntryRouter.delete('/:id',  validateRequest(IdParamRequest), serviceEntryDeleteController)

export default serviceEntryRouter