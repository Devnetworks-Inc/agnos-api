import { isoStringRemoveTime } from "src/utils/helper";
import prisma from "../prisma";
const db = process.env.DATABASE_NAME

export const getEmployeeWorkLogGroupByMonthYearHotel = async (startDate: Date, endDate: Date, hotelId?: number | null) => {
  const sd = isoStringRemoveTime(startDate.toISOString())
  const ed = isoStringRemoveTime(endDate.toISOString())

  const result = await prisma.$queryRawUnsafe(
    `SELECT
      e.id, e.firstName, e.middleName, e.lastName, e.rate, e.hotelId, ewl.month, ewl.year, sum(ewl.totalSeconds) as totalSeconds
    FROM ${db}.employee as e
    LEFT JOIN ${db}.employee_work_log as ewl ON e.id = ewl.employeeId
    WHERE date BETWEEN '${sd}' AND '${ed}'${hotelId ? ` AND hotelId=${hotelId}` : ''}
    GROUP BY e.id, e.firstName, e.middleName, e.lastName, e.rate, e.hotelId, ewl.month, ewl.year
    ORDER BY year ASC, month ASC;`
  );
  return result
}