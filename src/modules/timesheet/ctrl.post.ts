import { Response } from "express";
import { TimesheetCreateInactiveLogsRequest } from "./schema";
import { createHourlyTypeMissingDateLogs, createMonthlyTypeMissingDateLogs } from "./services";
import resp from "objectify-response";

export const timesheetCreateInactiveLogs = async (req: TimesheetCreateInactiveLogsRequest, res: Response) => {
  const { startDate, endDate } = req.body
  await createMonthlyTypeMissingDateLogs(startDate, endDate)
  await createHourlyTypeMissingDateLogs(startDate, endDate)
  resp(res, "Missing Work Logs was successfully created")
}