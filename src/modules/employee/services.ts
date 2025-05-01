import { isoStringRemoveTime } from "src/utils/helper";
import prisma from "../prisma";
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