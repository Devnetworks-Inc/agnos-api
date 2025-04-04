import { Router } from "express"
import validateRequest from "src/middlewares/validateRequest"
import { validateToken } from "src/middlewares/validateToken"
import { HotelServiceCreate, HotelServiceUpdate } from "./schema"
import { hotelServiceCreateController } from "./ctrl.post"
import { hotelServiceUpdateController } from "./ctrl.patch"
import { hotelServiceGetAllController, hotelServiceGetByIdController } from "./ctrl.get"
import { IdParamRequest } from "../id/schema"
import { hotelServiceDeleteController } from "./ctrl.delete"

const hotelServiceRouter = Router()

hotelServiceRouter.use(validateToken)
hotelServiceRouter.post('/', validateRequest(HotelServiceCreate), hotelServiceCreateController)
hotelServiceRouter.get('/:id', validateRequest(IdParamRequest), hotelServiceGetByIdController)
hotelServiceRouter.get('/', hotelServiceGetAllController)
hotelServiceRouter.patch('/',  validateRequest(HotelServiceUpdate), hotelServiceUpdateController)
hotelServiceRouter.delete('/:id',  validateRequest(IdParamRequest), hotelServiceDeleteController)

export default hotelServiceRouter