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

export const dailyHousekeepingRecordBaseUrl = '/daily-housekeeping-records'

dailyHousekeepingRecordRouter.use(validateToken)
dailyHousekeepingRecordRouter.post(dailyHousekeepingRecordBaseUrl, validateRequest(DailyHousekeepingRecordCreate), dailyHousekeepingRecordCreateController)
dailyHousekeepingRecordRouter.get(dailyHousekeepingRecordBaseUrl+'/:id', validateRequest(IdParamRequest), dailyHousekeepingRecordGetByIdController)
dailyHousekeepingRecordRouter.get(dailyHousekeepingRecordBaseUrl, validateRequest(DailyHousekeepingRecordGet), dailyHousekeepingRecordGetController)
dailyHousekeepingRecordRouter.patch(dailyHousekeepingRecordBaseUrl,  validateRequest(DailyHousekeepingRecordUpdate), dailyHousekeepingRecordUpdateController)
dailyHousekeepingRecordRouter.delete(dailyHousekeepingRecordBaseUrl+'/:id',  validateRequest(IdParamRequest), dailyHousekeepingRecordDeleteController)

export default dailyHousekeepingRecordRouter