import { Router } from "express"
import validateRequest from "src/middlewares/validateRequest"
import { validateToken } from "src/middlewares/validateToken"
import { EmployeeCheckInOut, EmployeeCreate, EmployeeCreateShareableUrl, EmployeeGet, EmployeeUpdate, EmployeeUrlSubmit } from "./schema"
import { employeeCreateController, employeeCreateShareableUrlController } from "./ctrl.post"
import { employeeCheckInOutController, employeeUpdateController, employeeUrlSubmitController } from "./ctrl.patch"
import { employeeGetController } from "./ctrl.get"
import { IdParamRequest } from "../id/schema"
import { employeeDeleteController } from "./ctrl.delete"
import { authorizeRoles } from "src/middlewares/authorization"

const employeeRouter = Router()

// public route
employeeRouter.patch('/url-submit',  validateRequest(EmployeeUrlSubmit), employeeUrlSubmitController)

// protected routes
employeeRouter.use(validateToken)

employeeRouter.patch(
  '/check-in-out/:id',
  authorizeRoles(['hsk_manager', 'hotel_manager']),
  validateRequest(EmployeeCheckInOut), employeeCheckInOutController
)

employeeRouter.use(authorizeRoles(['agnos_admin', 'hsk_manager', 'hotel_manager']))

employeeRouter.post('/shareable-url', validateRequest(EmployeeCreateShareableUrl), employeeCreateShareableUrlController)
employeeRouter.post('/', validateRequest(EmployeeCreate), employeeCreateController)
employeeRouter.get('/', validateRequest(EmployeeGet), employeeGetController)
employeeRouter.patch('/check-in-out/:id',  validateRequest(EmployeeCheckInOut), employeeCheckInOutController)
employeeRouter.patch('/',  validateRequest(EmployeeUpdate), employeeUpdateController)
employeeRouter.delete('/:id',  validateRequest(IdParamRequest), employeeDeleteController)

export default employeeRouter