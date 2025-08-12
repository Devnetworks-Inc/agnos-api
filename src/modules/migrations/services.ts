import prisma from "../prisma"
const db = process.env.DATABASE_NAME

export const updateEmployeeWorkLogsPosition = async () => {
  await prisma.$queryRawUnsafe(`SET SQL_SAFE_UPDATES = 0;`)

  return prisma.$executeRaw
    `UPDATE employee_work_log AS ewl, position AS p
    SET ewl.positionId = p.id, ewl.role = p.role
    WHERE ewl.employeeId = p.employeeId;`
}