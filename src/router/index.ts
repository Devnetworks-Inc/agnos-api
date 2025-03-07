import { Router } from "express"
import employeeRouter from "src/modules/employee/routes"
import userRouter from "src/modules/user/routes"

const router = Router()

const path = process.env.MAINPATH
const version = process.env.VERSION
export const base = `/${path}/${version}/`
console.log('Base Url: ' + base)

router.use(`${base}users`, userRouter)
router.use(`${base}employees`, employeeRouter)

export default router