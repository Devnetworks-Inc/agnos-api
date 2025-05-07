import { Router } from "express"
import dailyHousekeepingRecordRouter from "src/modules/dailyHouseKeepingRecord/routes"
import employeeRouter from "src/modules/employee/routes"
import fileRouter from "src/modules/file/routes"
import hotelRouter from "src/modules/hotel/routes"
import hotelServiceRouter from "src/modules/hotelService/routes"
import serviceEntryRouter from "src/modules/seriviceEntry/routes"
import serviceRouter from "src/modules/service/routes"
import userRouter from "src/modules/user/routes"
import webauthnRouter from "src/modules/webAuthn/routes"

const router = Router()

const path = process.env.MAINPATH
const version = process.env.VERSION
export const base = `/${path}/${version}`
console.log('Base Url: ' + base)

export const userBaseUrl = '/users'
router.use(base+userBaseUrl, userRouter)

export const employeeBaseUrl = '/employees'
router.use(base+employeeBaseUrl, employeeRouter)

export const hotelBaseUrl = '/hotels'
router.use(base+hotelBaseUrl, hotelRouter)

export const dailyHousekeepingRecordBaseUrl = '/daily-housekeeping-records'
router.use(base+dailyHousekeepingRecordBaseUrl, dailyHousekeepingRecordRouter)

export const serviceBaseUrl = '/services'
router.use(base+serviceBaseUrl, serviceRouter)

export const serviceEntryBaseUrl = '/service-entries'
router.use(base+serviceBaseUrl, serviceEntryRouter)

export const hotelServiceBaseUrl = '/hotel-services'
router.use(base+hotelServiceBaseUrl, hotelServiceRouter)

export const fileBaseUrl = '/file'
router.use(base+fileBaseUrl, fileRouter)


router.use(base, webauthnRouter)

export default router