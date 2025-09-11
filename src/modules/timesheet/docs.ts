import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { requestBody, successJsonResponse } from "src/utils/docsHelper";
import { z } from "zod";
import { TimesheetCreateInactiveLogsBody, TimesheetData, TimesheetGetDailyQuery } from "./schema";

const tags = ["Timesheet"]

export const timesheetBaseUrl = "/timesheet"

export function registerTimesheetRoutes(registry: OpenAPIRegistry) {

  registry.registerPath({
    method: "get",
    path: timesheetBaseUrl+"/daily",
    summary: "get daily timesheet",
    tags,
    request: {
      query: TimesheetGetDailyQuery,
    },
    security: [{ BearerAuth: []}],

    responses: {
      200: successJsonResponse("Daiy Timesheet", z.array(TimesheetData)),
    },
  });

    registry.registerPath({
    method: "post",
    path: timesheetBaseUrl+"/missing-dates",
    summary: 'create missing date work logs for monthly rate type employees',
    tags,
    request: {
      body: requestBody(TimesheetCreateInactiveLogsBody),
    },
    security: [{ BearerAuth: []}],

    responses: {
      200: successJsonResponse("Success Response", z.literal("success")),
    },
  });

  return registry
}