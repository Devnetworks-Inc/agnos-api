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

hotelRouter.use(validateToken)
hotelRouter.post('/', validateRequest(HotelCreate), hotelCreateController)
hotelRouter.get('/:id', validateRequest(IdParamRequest), hotelGetByIdController)
hotelRouter.get('/', hotelGetAllController)
hotelRouter.patch('/',  validateRequest(HotelUpdate), hotelUpdateController)
hotelRouter.delete('/:id',  validateRequest(IdParamRequest), hotelDeleteController)

export default hotelRouter