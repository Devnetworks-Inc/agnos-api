import { Router } from "express"
import validateRequest from "src/middlewares/validateRequest"
import { validateToken } from "src/middlewares/validateToken"
import { EmployeeBreakStartEnd, EmployeeCheckInOut, EmployeeCreate, EmployeeCreateShareableUrl, EmployeeGet, EmployeeGetWorkLogs, EmployeeGetByUrl, EmployeeUpdate, EmployeeUrlSubmit, EmployeeWorkLogCreate, EmployeeWorkLogUpdate } from "./schema"
import { employeeCreateController, employeeCreateShareableUrlController, employeeCreateWorkLogController } from "./ctrl.post"
import { employeeBreakStartEndController, employeeCheckInOutController, employeeUpdateController, employeeUpdateWorkLogController, employeeUrlSubmitController } from "./ctrl.patch"
import { employeeGetWorkLogsController, employeeGetByIdController, employeeGetByUrlController, employeeGetController } from "./ctrl.get"
import { IdParamRequest } from "../id/schema"
import { employeeDeleteController } from "./ctrl.delete"
import { authorizeRoles } from "src/middlewares/authorization"

const employeeRouter = Router()

// public route
employeeRouter.patch('/url-submit',  validateRequest(EmployeeUrlSubmit), employeeUrlSubmitController)
employeeRouter.get('/url/:url', validateRequest(EmployeeGetByUrl), employeeGetByUrlController)

// protected routes
employeeRouter.use(validateToken)

// employeeRouter.use(authorizeRoles(['agnos_admin', 'hsk_manager', 'hotel_manager']))

employeeRouter.post(
  '/work-log/', 
  authorizeRoles(['agnos_admin', 'hsk_manager', 'hotel_manager']),
  validateRequest(EmployeeWorkLogCreate), employeeCreateWorkLogController
)

employeeRouter.post(
  '/shareable-url',
  authorizeRoles(['agnos_admin', 'hsk_manager', 'hotel_manager']),
  validateRequest(EmployeeCreateShareableUrl),
  employeeCreateShareableUrlController
)

employeeRouter.post(
  '/',
  authorizeRoles(['agnos_admin', 'hsk_manager', 'hotel_manager']),
  validateRequest(EmployeeCreate), employeeCreateController
)

employeeRouter.get(
  '/work-logs',
  authorizeRoles(['agnos_admin', 'hsk_manager', 'hotel_manager']),
  validateRequest(EmployeeGetWorkLogs),
  employeeGetWorkLogsController
)

employeeRouter.get(
  '/:id',
  authorizeRoles(['agnos_admin', 'hsk_manager', 'hotel_manager']),
  validateRequest(IdParamRequest), employeeGetByIdController
)

employeeRouter.get(
  '/',
  authorizeRoles(['agnos_admin', 'hsk_manager', 'hotel_manager']),
  validateRequest(EmployeeGet),
  employeeGetController
)

employeeRouter.patch(
  '/check-in-out/:id',
  authorizeRoles(['agnos_admin', 'hsk_manager', 'hotel_manager', 'check_in_assistant']),
  validateRequest(EmployeeCheckInOut),
  employeeCheckInOutController
)

employeeRouter.patch(
  '/break-start-end/:id',
  authorizeRoles(['agnos_admin', 'hsk_manager', 'hotel_manager', 'check_in_assistant']),
  validateRequest(EmployeeBreakStartEnd),
  employeeBreakStartEndController
)

employeeRouter.patch(
  '/work-log',
  authorizeRoles(['agnos_admin', 'hsk_manager', 'hotel_manager']),
  validateRequest(EmployeeWorkLogUpdate),
  employeeUpdateWorkLogController
)

employeeRouter.patch(
  '/',
  authorizeRoles(['agnos_admin', 'hsk_manager', 'hotel_manager']),
  validateRequest(EmployeeUpdate),
  employeeUpdateController
)

employeeRouter.delete(
  '/:id',
  authorizeRoles(['agnos_admin', 'hsk_manager', 'hotel_manager']),
  validateRequest(IdParamRequest),
  employeeDeleteController
)

export default employeeRouter