import { Router } from "express"
import validateRequest from "src/middlewares/validateRequest"
import { validateToken } from "src/middlewares/validateToken"
import { DailyHousekeepingRecordCreate, DailyHousekeepingRecordGet, DailyHousekeepingRecordTimesheetDaily, DailyHousekeepingRecordUpdate, MonthlyHousekeepingRecordGet } from "./schema"
import { dailyHousekeepingRecordCreateController } from "./ctrl.post"
import { dailyHousekeepingRecordApproveController, dailyHousekeepingRecordUpdateController } from "./ctrl.patch"
import { dailyHousekeepingRecordGetController, dailyHousekeepingRecordGetByIdController, housekeepingRecordGetMonthlyController, dailyHousekeepingRecordTimesheetDailyController } from "./ctrl.get"
import { IdParamRequest } from "../id/schema"
import { dailyHousekeepingRecordDeleteController } from "./ctrl.delete"
import { authorizeRoles } from "src/middlewares/authorization"

const dailyHousekeepingRecordRouter = Router()

dailyHousekeepingRecordRouter
  .use('/', validateToken)
  .post('/', validateRequest(DailyHousekeepingRecordCreate), dailyHousekeepingRecordCreateController)
  .get('/monthly', validateRequest(MonthlyHousekeepingRecordGet), housekeepingRecordGetMonthlyController)
  .get('/timesheet-daily', validateRequest(DailyHousekeepingRecordTimesheetDaily), dailyHousekeepingRecordTimesheetDailyController)
  .get('/:id', validateRequest(IdParamRequest), dailyHousekeepingRecordGetByIdController)
  .get('/', validateRequest(DailyHousekeepingRecordGet), dailyHousekeepingRecordGetController)

  .patch(
    '/approve/:id',
    authorizeRoles(['hotel_manager', 'hsk_manager']),
    validateRequest(IdParamRequest),
    dailyHousekeepingRecordApproveController
  )

  .patch('/',  validateRequest(DailyHousekeepingRecordUpdate), dailyHousekeepingRecordUpdateController)
  .delete('/:id',  validateRequest(IdParamRequest), dailyHousekeepingRecordDeleteController)

export default dailyHousekeepingRecordRouter