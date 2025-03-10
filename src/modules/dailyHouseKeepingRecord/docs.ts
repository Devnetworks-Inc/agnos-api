import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { requestBody, successJsonResponse } from "src/utils/docsHelper";
import { z } from "zod";
import { DailyHousekeepingRecord, DailyHousekeepingRecordCreateBody, DailyHousekeepingRecordUpdateBody } from "./schema";
import { IdParam } from "../id/schema";

export function registerDailyHousekeepingRecordRoutes(registry: OpenAPIRegistry) {
  const DailyHousekeepingRecordSchema = registry.register("DailyHousekeepingRecord", DailyHousekeepingRecord);

  registry.registerPath({
    method: "post",
    path: "/daily-housekeeping-records/",
    summary: "create daily-housekeeping-record",
    tags: ["DailyHousekeepingRecord"],
    request: {
      body: requestBody(DailyHousekeepingRecordCreateBody),
    },
    security: [{ BearerAuth: []}],

    responses: {
      200: successJsonResponse("DailyHousekeepingRecord", DailyHousekeepingRecord),
    },
  });

  registry.registerPath({
    method: "get",
    path: "/daily-housekeeping-records",
    summary: "get daily housekeeping records",
    tags: ["DailyHousekeepingRecord"],
    security: [{ BearerAuth: []}],

    responses: {
      200: successJsonResponse("DailyHousekeepingRecords", z.array(DailyHousekeepingRecordSchema)),
    },
  });

  registry.registerPath({
    method: "get",
    path: "/daily-housekeeping-records/{id}",
    summary: "get daily housekeeping record by id",
    tags: ["DailyHousekeepingRecord"],
    request: {
      params: IdParam
    },
    security: [{ BearerAuth: []}],

    responses: {
      200: successJsonResponse("DailyHousekeepingRecord", DailyHousekeepingRecordSchema),
    },
  });

  registry.registerPath({
    method: "patch",
    path: "/daily-housekeeping-records",
    summary: "update daily housekeeping record",
    tags: ["DailyHousekeepingRecord"],
    request: {
      body: requestBody(DailyHousekeepingRecordUpdateBody),
    },
    security: [{ BearerAuth: []}],

    responses: {
      200: successJsonResponse("DailyHousekeepingRecord", DailyHousekeepingRecordSchema),
    },
  });

  registry.registerPath({
    method: "delete",
    path: "/daily-housekeeping-records/{id}",
    summary: "delete daily housekeeping record",
    tags: ["DailyHousekeepingRecord"],
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
