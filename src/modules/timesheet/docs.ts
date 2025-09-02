import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { successJsonResponse } from "src/utils/docsHelper";
import { z } from "zod";
import { TimesheetData, TimesheetGetDailyQuery } from "./schema";

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

  return registry
}