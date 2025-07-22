import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { requestBody, successJsonResponse } from "src/utils/docsHelper";
import { z } from "zod";
import { DailyHousekeepingRecord, DailyHousekeepingRecordCreateBody, DailyHousekeepingRecordGetQuery, DailyHousekeepingRecordTimesheetDailyQuery, DailyHousekeepingRecordTimesheetMonthlyQuery, DailyHousekeepingRecordUpdateBody, HousekeepingRecordGetMonthlyQuery } from "./schema";
import { IdParam } from "../id/schema";
import { dailyHousekeepingRecordBaseUrl } from "src/router";

const tags = ["DailyHousekeepingRecord"]

export function registerDailyHousekeepingRecordRoutes(registry: OpenAPIRegistry) {
  const DailyHousekeepingRecordSchema = registry.register("DailyHousekeepingRecord", DailyHousekeepingRecord);

  registry.registerPath({
    method: "post",
    path: dailyHousekeepingRecordBaseUrl,
    summary: "create daily housekeeping record",
    tags,
    request: {
      body: requestBody(DailyHousekeepingRecordCreateBody),
    },
    security: [{ BearerAuth: []}],

    responses: {
      200: successJsonResponse("Daily Housekeeping Record", DailyHousekeepingRecord),
    },
  });

  registry.registerPath({
    method: "get",
    path: dailyHousekeepingRecordBaseUrl,
    summary: "get daily housekeeping records",
    tags,
    request: {
      query: DailyHousekeepingRecordGetQuery
    },
    security: [{ BearerAuth: []}],

    responses: {
      200: successJsonResponse("Daily Housekeeping Records", z.array(DailyHousekeepingRecordSchema)),
    },
  });

  registry.registerPath({
    method: "get",
    path: dailyHousekeepingRecordBaseUrl+"/{id}",
    summary: "get daily housekeeping record by id",
    tags,
    request: {
      params: IdParam
    },
    security: [{ BearerAuth: []}],

    responses: {
      200: successJsonResponse("Daily Housekeeping Record", DailyHousekeepingRecordSchema),
    },
  });

  registry.registerPath({
    method: "get",
    path: dailyHousekeepingRecordBaseUrl+"/monthly",
    summary: "get monthly housekeeping record",
    tags,
    request: {
      query: DailyHousekeepingRecordGetQuery
    },
    security: [{ BearerAuth: []}],

    responses: {
      200: successJsonResponse("Monthly Housekeeping Record", z.array(DailyHousekeepingRecordSchema)),
    },
  });

  registry.registerPath({
    method: "get",
    path: dailyHousekeepingRecordBaseUrl+"/timesheet-daily",
    summary: "get ATR, ACR, RPE for timesheet daily",
    tags,
    request: {
      query: DailyHousekeepingRecordTimesheetDailyQuery
    },
    security: [{ BearerAuth: []}],

    responses: {
      200: successJsonResponse("Success", z.object({
        ATR: z.number(),
        ACR: z.number(),
        RPE: z.number(),
      })),
    },
  });

  registry.registerPath({
    method: "get",
    path: dailyHousekeepingRecordBaseUrl+"/timesheet-monthly",
    summary: "get ATR, ACR, RPE for timesheet monthly",
    tags,
    request: {
      query: DailyHousekeepingRecordTimesheetMonthlyQuery
    },
    security: [{ BearerAuth: []}],

    responses: {
      200: successJsonResponse("Success", z.object({
        ATR: z.number(),
        ACR: z.number(),
        RPE: z.number(),
      })),
    },
  });

  registry.registerPath({
    method: "patch",
    path: dailyHousekeepingRecordBaseUrl,
    summary: "update daily housekeeping record",
    tags,
    request: {
      body: requestBody(DailyHousekeepingRecordUpdateBody),
    },
    security: [{ BearerAuth: []}],

    responses: {
      200: successJsonResponse("Daily Housekeeping Record", DailyHousekeepingRecordSchema),
    },
  });

  registry.registerPath({
    method: "patch",
    path: dailyHousekeepingRecordBaseUrl+'/approve/{id}',
    summary: "approve daily housekeeping record",
    tags,
    request: {
      params: IdParam,
    },
    security: [{ BearerAuth: []}],

    responses: {
      200: successJsonResponse("DailyHousekeepingRecord", z.object({
        approvedByHskManagerId: z.number().optional(),
        approvedByHotelManagerId: z.number().optional(),
        hskManagerApprovedDate: z.string().datetime().optional(),
        hotelManagerApprovedDate: z.string().datetime().optional(),
      })),
    },
  });

  registry.registerPath({
    method: "delete",
    path: dailyHousekeepingRecordBaseUrl+"/{id}",
    summary: "delete daily housekeeping record",
    tags,
    request: {
      params: IdParam,
    },
    security: [{ BearerAuth: []}],

    responses: {
      200: successJsonResponse("Success Message", z.literal('DailyHousekeepingRecord has been deleted')),
    },
  });

  return registry;
}
