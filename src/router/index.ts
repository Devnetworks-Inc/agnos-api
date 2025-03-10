import { Router } from "express"
import dailyHousekeepingRecordRouter from "src/modules/dailyHouseKeepingRecord/routes"
import employeeRouter from "src/modules/employee/routes"
import hotelRouter from "src/modules/hotel/routes"
import serviceEntryRouter from "src/modules/seriviceEntry/routes"
import userRouter from "src/modules/user/routes"

const router = Router()

const path = process.env.MAINPATH
const version = process.env.VERSION
export const base = `/${path}/${version}/`
console.log('Base Url: ' + base)

router.use(`${base}users`, userRouter)
router.use(`${base}employees`, employeeRouter)
router.use(`${base}hotels`, hotelRouter)
router.use(`${base}daily-housekeeping-records`, dailyHousekeepingRecordRouter)
router.use(`${base}service-entry`, serviceEntryRouter)

export default router