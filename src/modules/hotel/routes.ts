import { Router } from "express"
import validateRequest from "src/middlewares/validateRequest"
import { validateToken } from "src/middlewares/validateToken"
import { HotelCreate, HotelUpdate } from "./schema"
import { hotelCreateController } from "./ctrl.post"
import { hotelUpdateController } from "./ctrl.patch"
import { hotelGetAllController, hotelGetByIdController } from "./ctrl.get"
import { IdParamRequest } from "../id/schema"
import { hotelDeleteController } from "./ctrl.delete"

const hotelRouter = Router()

export const hotelBaseUrl = '/hotels'

hotelRouter.use(validateToken)
hotelRouter.post(hotelBaseUrl, validateRequest(HotelCreate), hotelCreateController)
hotelRouter.get(hotelBaseUrl+'/:id', validateRequest(IdParamRequest), hotelGetByIdController)
hotelRouter.get(hotelBaseUrl, hotelGetAllController)
hotelRouter.patch(hotelBaseUrl,  validateRequest(HotelUpdate), hotelUpdateController)
hotelRouter.delete(hotelBaseUrl+'/:id',  validateRequest(IdParamRequest), hotelDeleteController)

export default hotelRouter