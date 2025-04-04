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

serviceRouter.use(validateToken)
serviceRouter.post('/', validateRequest(ServiceCreate), serviceCreateController)
serviceRouter.get('/:id', validateRequest(IdParamRequest), serviceGetByIdController)
serviceRouter.get('/', serviceGetAllController)
serviceRouter.patch('/',  validateRequest(ServiceUpdate), serviceUpdateController)
serviceRouter.delete('/:id',  validateRequest(IdParamRequest), serviceDeleteController)

export default serviceRouter