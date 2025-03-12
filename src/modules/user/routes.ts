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
export const userBaseUrl = '/users'

userRouter.post(userBaseUrl+'/login', validateRequest(Login), userLoginController)

userRouter.use(validateToken)
userRouter.post(userBaseUrl, validateRequest(UserCreate), userCreateController)
userRouter.get(userBaseUrl, userGetAllController)
userRouter.patch(userBaseUrl,  validateRequest(UserUpdate), userUpdateController)
userRouter.delete(userBaseUrl+'/:id',  validateRequest(IdParamRequest), userDeleteController)

export default userRouter