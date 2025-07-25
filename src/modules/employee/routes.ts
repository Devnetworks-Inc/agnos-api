import { Router } from "express"
import validateRequest from "src/middlewares/validateRequest"
import { validateToken } from "src/middlewares/validateToken"
import { EmployeeBreakStartEnd, EmployeeCheckInOut, EmployeeCreate, EmployeeCreateShareableUrl, EmployeeGet, EmployeeGetWorkLogs, EmployeeGetByUrl, EmployeeUpdate, EmployeeUrlSubmit, EmployeeWorkLogCreate, EmployeeWorkLogUpdate, EmployeeGetWorkLogsByIdPaginated, EmployeeGetWorkLogsByHotelIdSummaryDaily, EmployeeGetWorkLogEditLogs, EmployeeWorkLogComment, EmployeeGetWorkLogsByMonth } from "./schema"
import { employeeCreateController, employeeCreateShareableUrlController, employeeCreateWorkLogController } from "./ctrl.post"
import { employeeBreakStartEndController, employeeCheckInOutController, employeeMidnightCheckoutController, employeeUpdateController, employeeUpdateWorkLogCommentController, employeeUpdateWorkLogController, employeeUrlSubmitController } from "./ctrl.patch"
import { employeeGetWorkLogsController, employeeGetByIdController, employeeGetByUrlController, employeeGetController, employeeGetWorkLogsByIdPaginatedController, employeeGetWorkLogsSummaryDailyController, employeeGetWorkLogEditLogsController, employeeGetWorkLogsByMonthController } from "./ctrl.get"
import { IdParamRequest } from "../id/schema"
import { employeeDeleteController } from "./ctrl.delete"
import { authorizeRoles } from "src/middlewares/authorization"

const employeeRouter = Router()

// public route
employeeRouter.patch('/url-submit',  validateRequest(EmployeeUrlSubmit), employeeUrlSubmitController)
employeeRouter.patch('/midnight-checkout', employeeMidnightCheckoutController)
employeeRouter.get('/url/:url', validateRequest(EmployeeGetByUrl), employeeGetByUrlController)

// protected routes
employeeRouter.use(validateToken)

employeeRouter.post(
  '/work-logs', 
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
  '/work-logs/summary/daily/:hotelId',
  authorizeRoles(['agnos_admin', 'hsk_manager', 'hotel_manager']),
  validateRequest(EmployeeGetWorkLogsByHotelIdSummaryDaily),
  employeeGetWorkLogsSummaryDailyController
)

employeeRouter.get(
  '/work-logs/paginated/:employeeId',
  authorizeRoles(['agnos_admin', 'hsk_manager', 'hotel_manager', 'hsk_staff', 'gouvernante']),
  validateRequest(EmployeeGetWorkLogsByIdPaginated),
  employeeGetWorkLogsByIdPaginatedController
)

employeeRouter.get(
  '/work-logs/edit-logs/:workLogId',
  authorizeRoles(['agnos_admin', 'hsk_manager', 'hotel_manager', 'hsk_staff', 'gouvernante']),
  validateRequest(EmployeeGetWorkLogEditLogs),
  employeeGetWorkLogEditLogsController
)

employeeRouter.get(
  '/work-logs/month',
  authorizeRoles(['agnos_admin', 'hsk_manager', 'hotel_manager']),
  validateRequest(EmployeeGetWorkLogsByMonth),
  employeeGetWorkLogsByMonthController
)


employeeRouter.get(
  '/work-logs',
  authorizeRoles(['agnos_admin', 'hsk_manager', 'hotel_manager', 'gouvernante']),
  validateRequest(EmployeeGetWorkLogs),
  employeeGetWorkLogsController
)

employeeRouter.get(
  '/:id',
  authorizeRoles(['agnos_admin', 'hsk_manager', 'hotel_manager', 'hsk_staff', 'gouvernante']),
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
  authorizeRoles(['hsk_manager', 'hotel_manager', 'check_in_assistant']),
  validateRequest(EmployeeCheckInOut),
  employeeCheckInOutController
)

employeeRouter.patch(
  '/break-start-end/:id',
  authorizeRoles(['hsk_manager', 'hotel_manager', 'check_in_assistant']),
  validateRequest(EmployeeBreakStartEnd),
  employeeBreakStartEndController
)

employeeRouter.patch(
  '/work-logs/comment',
  authorizeRoles(['hsk_staff', 'gouvernante']),
  validateRequest(EmployeeWorkLogComment),
  employeeUpdateWorkLogCommentController
)

employeeRouter.patch(
  '/work-logs',
  authorizeRoles(['agnos_admin', 'hsk_manager', 'hotel_manager']),
  validateRequest(EmployeeWorkLogUpdate),
  employeeUpdateWorkLogController
)

employeeRouter.patch(
  '/',
  authorizeRoles(['agnos_admin', 'hsk_manager', 'hotel_manager', 'hsk_staff', 'gouvernante']),
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