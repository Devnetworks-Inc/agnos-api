import { Router } from "express"
import validateRequest from "src/middlewares/validateRequest"
import { validateToken } from "src/middlewares/validateToken"
import { EmployeeCheckInOut, EmployeeCreate, EmployeeGet, EmployeeUpdate } from "./schema"
import { employeeCreateController } from "./ctrl.post"
import { employeeCheckInOutController, employeeUpdateController } from "./ctrl.patch"
import { employeeGetController } from "./ctrl.get"
import { IdParamRequest } from "../id/schema"
import { employeeDeleteController } from "./ctrl.delete"
import { authorizeRoles } from "src/middlewares/authorization"

const employeeRouter = Router()

export const employeeBaseUrl = '/employees'

employeeRouter.use(validateToken)

employeeRouter.patch(
  employeeBaseUrl+'/check-in-out/:id',
  authorizeRoles(['hsk_manager', 'hotel_manager']),
  validateRequest(EmployeeCheckInOut), employeeCheckInOutController
)

employeeRouter.use(employeeBaseUrl, authorizeRoles(['agnos_admin', 'hsk_manager', 'hotel_manager']))

employeeRouter.post(employeeBaseUrl, validateRequest(EmployeeCreate), employeeCreateController)
employeeRouter.get(employeeBaseUrl, validateRequest(EmployeeGet), employeeGetController)
employeeRouter.patch(employeeBaseUrl+'/check-in-out/:id',  validateRequest(EmployeeCheckInOut), employeeCheckInOutController)
employeeRouter.patch(employeeBaseUrl,  validateRequest(EmployeeUpdate), employeeUpdateController)
employeeRouter.delete(employeeBaseUrl+'/:id',  validateRequest(IdParamRequest), employeeDeleteController)

export default employeeRouter