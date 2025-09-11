import { Router } from "express";
import { authorizeRoles } from "src/middlewares/authorization";
import validateRequest from "src/middlewares/validateRequest";
import { validateToken } from "src/middlewares/validateToken";
import { timesheetGetDailyController } from "./ctrl.get";
import { TimesheetCreateInactiveLogs, TimesheetGetDaily } from "./schema";
import { timesheetCreateInactiveLogs } from "./ctrl.post";

const timesheetRouter = Router()

timesheetRouter
  .use(validateToken)
  .get(
    '/daily',
    authorizeRoles(['agnos_admin', 'hsk_manager', 'hotel_manager', 'gouvernante']),
    validateRequest(TimesheetGetDaily),
    timesheetGetDailyController
  )
  // .get(
  //   '/monthly',
  //   authorizeRoles(['agnos_admin', 'hsk_manager', 'hotel_manager', 'gouvernante']),
  //   validateRequest(TimesheetGetMonthly),
  //   timesheetGetDailyController
  // )
  .post(
    '/missing-dates',
    authorizeRoles(['agnos_admin']),
    validateRequest(TimesheetCreateInactiveLogs),
    timesheetCreateInactiveLogs
  )

export default timesheetRouter