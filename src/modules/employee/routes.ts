import { Router } from "express"
import validateRequest from "src/middlewares/validateRequest"
import { validateToken } from "src/middlewares/validateToken"
import { EmployeeBreakStartEnd, EmployeeCheckInOut, EmployeeCreate, EmployeeCreateShareableUrl, EmployeeGet, EmployeeGetAttendances, EmployeeGetByUrl, EmployeeUpdate, EmployeeUrlSubmit, EmployeeWorkLogUpdate } from "./schema"
import { employeeCreateController, employeeCreateShareableUrlController } from "./ctrl.post"
import { employeeBreakStartEndController, employeeCheckInOutController, employeeUpdateController, employeeUpdateWorkLogController, employeeUrlSubmitController } from "./ctrl.patch"
import { employeeGetAttendancesController, employeeGetByIdController, employeeGetByUrlController, employeeGetController } from "./ctrl.get"
import { IdParamRequest } from "../id/schema"
import { employeeDeleteController } from "./ctrl.delete"
import { authorizeRoles } from "src/middlewares/authorization"

const employeeRouter = Router()

// public route
employeeRouter.patch('/url-submit',  validateRequest(EmployeeUrlSubmit), employeeUrlSubmitController)
employeeRouter.get('/url/:url', validateRequest(EmployeeGetByUrl), employeeGetByUrlController)

// protected routes
employeeRouter.use(validateToken)

employeeRouter.use(authorizeRoles(['agnos_admin', 'hsk_manager', 'hotel_manager']))

employeeRouter.post('/shareable-url', validateRequest(EmployeeCreateShareableUrl), employeeCreateShareableUrlController)
employeeRouter.post('/', validateRequest(EmployeeCreate), employeeCreateController)
employeeRouter.get('/attendances', validateRequest(EmployeeGetAttendances), employeeGetAttendancesController)
employeeRouter.get('/:id', validateRequest(IdParamRequest), employeeGetByIdController)
employeeRouter.get('/', validateRequest(EmployeeGet), employeeGetController)
employeeRouter.patch('/check-in-out/:id',  validateRequest(EmployeeCheckInOut), employeeCheckInOutController)
employeeRouter.patch('/break-start-end/:id',  validateRequest(EmployeeBreakStartEnd), employeeBreakStartEndController)
employeeRouter.patch('/work-log/:workLogId',  validateRequest(EmployeeWorkLogUpdate), employeeUpdateWorkLogController)
employeeRouter.patch('/',  validateRequest(EmployeeUpdate), employeeUpdateController)
employeeRouter.delete('/:id',  validateRequest(IdParamRequest), employeeDeleteController)

export default employeeRouter