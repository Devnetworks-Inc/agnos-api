import { Router } from "express"
import validateRequest from "src/middlewares/validateRequest"
import { validateToken } from "src/middlewares/validateToken"
import { DailyHousekeepingRecordCreate, DailyHousekeepingRecordGet, DailyHousekeepingRecordUpdate } from "./schema"
import { dailyHousekeepingRecordCreateController } from "./ctrl.post"
import { dailyHousekeepingRecordUpdateController } from "./ctrl.patch"
import { dailyHousekeepingRecordGetController, dailyHousekeepingRecordGetByIdController } from "./ctrl.get"
import { IdParamRequest } from "../id/schema"
import { dailyHousekeepingRecordDeleteController } from "./ctrl.delete"

const dailyHousekeepingRecordRouter = Router()

dailyHousekeepingRecordRouter.use('/', validateToken)
dailyHousekeepingRecordRouter.post('/', validateRequest(DailyHousekeepingRecordCreate), dailyHousekeepingRecordCreateController)
dailyHousekeepingRecordRouter.get('/:id', validateRequest(IdParamRequest), dailyHousekeepingRecordGetByIdController)
dailyHousekeepingRecordRouter.get('/', validateRequest(DailyHousekeepingRecordGet), dailyHousekeepingRecordGetController)
dailyHousekeepingRecordRouter.patch('/',  validateRequest(DailyHousekeepingRecordUpdate), dailyHousekeepingRecordUpdateController)
dailyHousekeepingRecordRouter.delete('/:id',  validateRequest(IdParamRequest), dailyHousekeepingRecordDeleteController)

export default dailyHousekeepingRecordRouter