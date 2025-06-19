import { isoStringRemoveTime, isoStringToDatetime } from "src/utils/helper";
import prisma from "../prisma";
import { PrismaPromise } from "@prisma/client";
const db = process.env.DATABASE_NAME

export const getEmployeesWorkLogGroupByMonthYearHotel = async (startDate: Date, endDate: Date, hotelId?: number | null) => {
  const sd = isoStringRemoveTime(startDate.toISOString())
  const ed = isoStringRemoveTime(endDate.toISOString())

  const result = await prisma.$queryRawUnsafe(
    `SELECT
      e.id, e.firstName, e.middleName, e.lastName, e.rate, e.hotelId, ewl.month, ewl.year, e.position, sum(ewl.totalSeconds) as totalSeconds, sum(ewl.salaryToday) as cost
    FROM ${db}.employee as e
    LEFT JOIN 
      ( SELECT * FROM ${db}.employee_work_log WHERE date BETWEEN '${sd}' AND '${ed}' ) as ewl
    ON e.id = ewl.employeeId
    ${hotelId ? `WHERE e.hotelId=${hotelId}` : ''}
    GROUP BY e.id, e.firstName, e.middleName, e.lastName, e.rate, e.hotelId, ewl.month, ewl.year, e.position
    ORDER BY year ASC, month ASC;`
  );
  return result
}

export const checkoutMidnightQuery = async (yesterdayStartDate: Date, yesterdayEndDate: Date) => {
  const yesterdayStart = isoStringToDatetime(yesterdayStartDate.toISOString())
  const yesterdayEnd = isoStringToDatetime(yesterdayEndDate.toISOString())

  await  prisma.$queryRawUnsafe(`SET SQL_SAFE_UPDATES = 0;`)

  // update breaks that has no end breaks
  await prisma.$queryRawUnsafe(
    `UPDATE ${db}.employee_break_log AS ebl
    SET ebl.breakEndDate = '${yesterdayEnd}',
      ebl.totalSeconds = TIMESTAMPDIFF(SECOND, ebl.breakStartDate, '${yesterdayEnd}')
    WHERE ebl.breakStartDate >= '${yesterdayStart}' and ebl.breakEndDate IS null;`
  )

  // update work-logs that has no checkout date
  const result = await prisma.$queryRawUnsafe(
    `UPDATE ${db}.employee_work_log AS ewl
    SET ewl.checkOutDate = '${yesterdayEnd}',
      ewl.totalSecondsBreak = (
        SELECT sum(ebl.totalSeconds) FROM ${db}.employee_break_log AS ebl WHERE ebl.workLogId = ewl.id
      ),
      ewl.totalSeconds = TIMESTAMPDIFF(SECOND, ewl.checkInDate, '${yesterdayEnd}') - ewl.totalSecondsBreak,
      ewl.status = 'checked_out'
    WHERE ewl.checkOutDate IS null AND ewl.checkInDate >= '${yesterdayStart}';`
  )

  return result as PrismaPromise<any> 
}