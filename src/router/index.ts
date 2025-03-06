import { Router } from "express"
import userRouter from "src/modules/user/routes"

const router = Router()

const path = process.env.MAINPATH
const version = process.env.VERSION
export const base = `/${path}/${version}/`
console.log('Base Url: ' + base)

router.use(`${base}users`, userRouter)

export default router