import prisma from "../prisma"

const db = process.env.DATABASE_NAME

export const createMonthlyTypeMissingDateLogs = async (startDateString: string, endDateString: string) => {
  const result = await prisma.$queryRawUnsafe(
    `INSERT INTO
      ${db}.employee_work_log ( date, positionId, employeeId, role, rate, rateType, overtimeRate, hourlyRate, status, salaryToday, month, year )

    WITH RECURSIVE date_range AS (
      SELECT date('${startDateString}') AS date, p.id AS positionId, p.employeeId, p.role, p.rate, p.rateType, p.overtimeRate, e.createdAt,
        ROUND(p.rate / (DAY(LAST_DAY(DATE('${startDateString}'))) * 8.4), 2) AS hourlyRate
      FROM ${db}.position AS p
      LEFT JOIN ${db}.employee AS e ON e.id = p.employeeId
      WHERE p.rateType = 'monthly' and p.role != 'agnos_admin' and p.role != 'check_in_assistant'

      UNION ALL

      SELECT DATE_ADD(date, INTERVAL 1 DAY), positionId, employeeId, role, rate, rateType, overtimeRate, createdAt,
        ROUND(rate / (DAY(LAST_DAY( DATE_ADD(date, INTERVAL 1 DAY) )) * 8.4), 2) AS hourlyRate
      FROM date_range
      WHERE date < '${endDateString}'
    )

    SELECT d.date, d.positionId, d.employeeId, d.role, d.rate, d.rateType, d.overtimeRate, d.hourlyRate, 'inactive' as status,
      ROUND(d.hourlyRate * 8.4, 2) AS salaryToday, MONTH(d.date) AS month, YEAR(d.date) AS year
    FROM date_range d
    LEFT JOIN 
      ${db}.employee_work_log AS w
      ON 
      w.date = d.date AND d.positionId = w.positionId
    WHERE w.id is null AND d.createdAt <= d.date;`
  )

  return result
}

export const createHourlyTypeMissingDateLogs = async (startDateString: string, endDateString: string) => {
  const result = await prisma.$queryRawUnsafe(
    `INSERT INTO
      ${db}.employee_work_log ( date, positionId, employeeId, role, rate, rateType, overtimeRate, hourlyRate, status, month, year )

    WITH RECURSIVE date_range AS (
      SELECT date('${startDateString}') AS date, p.id AS positionId, p.employeeId, p.role, p.rate, p.rateType, p.overtimeRate, e.createdAt,
        p.rate AS hourlyRate
      FROM ${db}.position AS p
      LEFT JOIN ${db}.employee AS e ON e.id = p.employeeId
      WHERE p.rateType = 'hourly' and p.role != 'agnos_admin' and p.role != 'check_in_assistant'

      UNION ALL

      SELECT DATE_ADD(date, INTERVAL 1 DAY), positionId, employeeId, role, rate, rateType, overtimeRate, createdAt, hourlyRate
      FROM date_range
      WHERE date < '${endDateString}'
    )

    SELECT d.date, d.positionId, d.employeeId, d.role, d.rate, d.rateType, d.overtimeRate, d.hourlyRate, 'inactive' as status,
      MONTH(d.date) AS month, YEAR(d.date) AS year
    FROM date_range d
    LEFT JOIN 
      ${db}.employee_work_log AS w
      ON 
      w.date = d.date AND d.positionId = w.positionId
    WHERE w.id is null AND d.createdAt <= d.date;`
  )

  return result
}