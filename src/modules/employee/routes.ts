import { Router } from "express"
import validateRequest from "src/middlewares/validateRequest"
import { validateToken } from "src/middlewares/validateToken"
import { EmployeeCreate, EmployeeUpdate } from "./schema"
import { employeeCreateController } from "./ctrl.post"
import { employeeUpdateController } from "./ctrl.patch"
import { employeeGetAllController } from "./ctrl.get"
import { IdParamRequest } from "../id/schema"
import { employeeDeleteController } from "./ctrl.delete"
import { authorizeRoles } from "src/middlewares/authorization"

const employeeRouter = Router()

employeeRouter.use(validateToken)
employeeRouter.use(authorizeRoles(['agnos_admin', 'hsk_manager']))

employeeRouter.post('/', validateRequest(EmployeeCreate), employeeCreateController)
employeeRouter.get('/', employeeGetAllController)
employeeRouter.patch('/',  validateRequest(EmployeeUpdate), employeeUpdateController)
employeeRouter.delete('/:id',  validateRequest(IdParamRequest), employeeDeleteController)

export default employeeRouter