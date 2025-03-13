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

export const hotelServiceBaseUrl = '/hotel-services'

hotelServiceRouter.use(validateToken)
hotelServiceRouter.post(hotelServiceBaseUrl, validateRequest(HotelServiceCreate), hotelServiceCreateController)
hotelServiceRouter.get(hotelServiceBaseUrl+'/:id', validateRequest(IdParamRequest), hotelServiceGetByIdController)
hotelServiceRouter.get(hotelServiceBaseUrl, hotelServiceGetAllController)
hotelServiceRouter.patch(hotelServiceBaseUrl,  validateRequest(HotelServiceUpdate), hotelServiceUpdateController)
hotelServiceRouter.delete(hotelServiceBaseUrl+'/:id',  validateRequest(IdParamRequest), hotelServiceDeleteController)

export default hotelServiceRouter