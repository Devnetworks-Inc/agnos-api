import { Router } from "express";
import { authorizeRoles } from "src/middlewares/authorization";
import validateRequest from "src/middlewares/validateRequest";
import { validateToken } from "src/middlewares/validateToken";
import { timesheetGetDailyController } from "./ctrl.get";
import { TimesheetGetDaily } from "./schema";

const timesheetRouter = Router()

timesheetRouter
  .use(validateToken)
  .get(
    '/daily',
    authorizeRoles(['agnos_admin', 'hsk_manager', 'hotel_manager', 'gouvernante']),
    validateRequest(TimesheetGetDaily),
    timesheetGetDailyController
  )

export default timesheetRouter