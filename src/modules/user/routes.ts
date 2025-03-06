import { Router } from "express"
import validateRequest from "src/middlewares/validateRequest"
import { validateToken } from "src/middlewares/validateToken"
import { Login, UserCreate, UserUpdate } from "./schema"
import { userCreateController, userLoginController } from "./ctrl.post"
import { userUpdateController } from "./ctrl.patch"
import { userGetAllController } from "./ctrl.get"
import { IdParamRequest } from "../id/schema"
import { userDeleteController } from "./ctrl.delete"

const userRouter = Router()

userRouter.post('/login', validateRequest(Login), userLoginController)

userRouter.use(validateToken)
userRouter.post('/', validateRequest(UserCreate), userCreateController)
userRouter.get('/', userGetAllController)
userRouter.patch('/',  validateRequest(UserUpdate), userUpdateController)
userRouter.delete('/:id',  validateRequest(IdParamRequest), userDeleteController)

export default userRouter