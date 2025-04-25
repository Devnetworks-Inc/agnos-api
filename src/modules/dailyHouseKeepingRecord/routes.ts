import { Router } from "express"
import validateRequest from "src/middlewares/validateRequest"
import { validateToken } from "src/middlewares/validateToken"
import { DailyHousekeepingRecordCreate, DailyHousekeepingRecordGet, DailyHousekeepingRecordUpdate, MonthlyHousekeepingRecordGet } from "./schema"
import { dailyHousekeepingRecordCreateController } from "./ctrl.post"
import { dailyHousekeepingRecordApproveController, dailyHousekeepingRecordUpdateController } from "./ctrl.patch"
import { dailyHousekeepingRecordGetController, dailyHousekeepingRecordGetByIdController, housekeepingRecordGetMonthlyController } from "./ctrl.get"
import { IdParamRequest } from "../id/schema"
import { dailyHousekeepingRecordDeleteController } from "./ctrl.delete"
import { authorizeRoles } from "src/middlewares/authorization"

const dailyHousekeepingRecordRouter = Router()

dailyHousekeepingRecordRouter.use('/', validateToken)
dailyHousekeepingRecordRouter.post('/', validateRequest(DailyHousekeepingRecordCreate), dailyHousekeepingRecordCreateController)
dailyHousekeepingRecordRouter.get('/monthly', validateRequest(MonthlyHousekeepingRecordGet), housekeepingRecordGetMonthlyController)
dailyHousekeepingRecordRouter.get('/:id', validateRequest(IdParamRequest), dailyHousekeepingRecordGetByIdController)
dailyHousekeepingRecordRouter.get('/', validateRequest(DailyHousekeepingRecordGet), dailyHousekeepingRecordGetController)

dailyHousekeepingRecordRouter.patch(
  '/approve/:id',
  authorizeRoles(['hotel_manager', 'hsk_manager']),
  validateRequest(IdParamRequest),
  dailyHousekeepingRecordApproveController
)

dailyHousekeepingRecordRouter.patch('/',  validateRequest(DailyHousekeepingRecordUpdate), dailyHousekeepingRecordUpdateController)
dailyHousekeepingRecordRouter.delete('/:id',  validateRequest(IdParamRequest), dailyHousekeepingRecordDeleteController)

export default dailyHousekeepingRecordRouter