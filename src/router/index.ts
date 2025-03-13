import { Router } from "express"
import dailyHousekeepingRecordRouter from "src/modules/dailyHouseKeepingRecord/routes"
import employeeRouter from "src/modules/employee/routes"
import hotelRouter from "src/modules/hotel/routes"
import hotelServiceRouter from "src/modules/hotelService/routes"
import serviceEntryRouter from "src/modules/seriviceEntry/routes"
import serviceRouter from "src/modules/service/routes"
import userRouter from "src/modules/user/routes"

const router = Router()

const path = process.env.MAINPATH
const version = process.env.VERSION
export const base = `/${path}/${version}`
console.log('Base Url: ' + base)

router.use(base, userRouter)
router.use(base, employeeRouter)
router.use(base, hotelRouter)
router.use(base, dailyHousekeepingRecordRouter)
router.use(base, serviceRouter)
router.use(base, serviceEntryRouter)
router.use(base, hotelServiceRouter)

export default router