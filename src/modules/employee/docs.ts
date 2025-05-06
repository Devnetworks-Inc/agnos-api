import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { requestBody, successJsonResponse } from "src/utils/docsHelper";
import { z } from "zod";
import { employeeBaseUrl } from "src/router";
import { Employee, EmployeeBreakLog, EmployeeBreakStartEndBody, EmployeeCheckInOutBody, EmployeeCreateBody, EmployeeCreateShareableUrlBody, EmployeeGetWorkLogsQuery, EmployeeGetByUrlParam, EmployeeGetQuery, EmployeeStatus, EmployeeUpdateBody, EmployeeUrlSubmitBody, EmployeeWorkLog, EmployeeWorkLogCreateBody, EmployeeWorkLogUpdateBody, EmployeeGetWorkLogsByIdPaginatedParams, EmployeeGetWorkLogsByIdPaginatedQuery, EmployeeGetWorkLogsByHotelIdSummaryDailyParam, EmployeeGetWorkLogsByHotelIdSummaryDailyQuery, EmployeeWorkLogCommentBody } from "./schema";
import { IdParam } from "../id/schema";

const tags = ["Employee"]

export function registerEmployeeRoutes(registry: OpenAPIRegistry) {
  const EmployeeSchema = registry.register("Employee", Employee);

  registry.registerPath({
    method: "post",
    path: employeeBaseUrl,
    summary: "create employee",
    tags,
    request: {
      body: requestBody(EmployeeCreateBody),
    },
    security: [{ BearerAuth: []}],

    responses: {
      200: successJsonResponse("Employee", Employee),
    },
  });

  registry.registerPath({
    method: "post",
    path: employeeBaseUrl+'/shareable-url',
    summary: "generate employee shareable url",
    tags,
    request: {
      body: requestBody(EmployeeCreateShareableUrlBody),
    },
    security: [{ BearerAuth: []}],

    responses: {
      200: successJsonResponse("Employee Shareable URL", z.object({
        shareableUrl: z.string(),
        urlExpiryDate: z.string().datetime()
      })),
    },
  });

  registry.registerPath({
    method: "post",
    path: employeeBaseUrl+'/work-logs',
    summary: "create work log",
    tags,
    request: {
      body: requestBody(EmployeeWorkLogCreateBody),
    },
    security: [{ BearerAuth: []}],

    responses: {
      200: successJsonResponse("Work Log", z.object({
        id: z.number(),
        status: EmployeeStatus,
        workLog: EmployeeWorkLog
      }),)
    },
  });

  registry.registerPath({
    method: "get",
    path: employeeBaseUrl+'/url/{url}',
    summary: "get employee by shareable url",
    tags,
    request: {
      params: EmployeeGetByUrlParam
    },

    responses: {
      200: successJsonResponse("Employee", EmployeeSchema),
    },
  });

  registry.registerPath({
    method: "get",
    path: employeeBaseUrl,
    summary: "get employees",
    tags,
    request: {
      query: EmployeeGetQuery
    },
    security: [{ BearerAuth: []}],

    responses: {
      200: successJsonResponse("Employees", z.array(EmployeeSchema)),
    },
  });

  registry.registerPath({
    method: "get",
    path: employeeBaseUrl+'/{id}',
    summary: "get employee by id",
    tags,
    request: {
      params: IdParam
    },
    security: [{ BearerAuth: []}],

    responses: {
      200: successJsonResponse("Employee", EmployeeSchema),
    },
  });

  registry.registerPath({
    method: "get",
    path: employeeBaseUrl+'/work-logs/paginated/{employeeId}',
    summary: "get paginated employee work logs by id",
    tags,
    request: {
      params: EmployeeGetWorkLogsByIdPaginatedParams,
      query: EmployeeGetWorkLogsByIdPaginatedQuery
    },
    security: [{ BearerAuth: []}],

    responses: {
      200: successJsonResponse("Employee Work Logs", z.array(EmployeeWorkLog)),
    },
  });

  registry.registerPath({
    method: "get",
    path: employeeBaseUrl+'/work-logs/summary/daily/{hotelId}',
    summary: "get hotel employee work logs daily summary",
    tags,
    request: {
      params: EmployeeGetWorkLogsByHotelIdSummaryDailyParam,
      query: EmployeeGetWorkLogsByHotelIdSummaryDailyQuery
    },
    security: [{ BearerAuth: []}],

    responses: {
      200: successJsonResponse("Hotel Employee Work Logs Summary Daily", z.array(z.object({
        date: z.string().datetime(),
        totalHours: z.number(),
        totalCost: z.number()
      }))),
    },
  });

  registry.registerPath({
    method: "get",
    path: employeeBaseUrl+'/work-logs',
    summary: "get employees work logs",
    tags,
    request: {
      query: EmployeeGetWorkLogsQuery
    },
    security: [{ BearerAuth: []}],

    responses: {
      200: successJsonResponse(
        "Employees Attendances",
        Employee.pick({
          id: true, firstName: true, middleName: true, lastName: true
        }).extend({
          workLog: z.array(EmployeeWorkLog)
        })
      )
    },
  });

  registry.registerPath({
    method: "patch",
    path: employeeBaseUrl+'/check-in-out/{id}',
    summary: "check-in/check-out employee",
    tags,
    request: {
      body: requestBody(EmployeeCheckInOutBody),
    },
    security: [{ BearerAuth: []}],

    responses: {
      200: successJsonResponse("Employee Work Log", EmployeeWorkLog),
    },
  });

  registry.registerPath({
    method: "patch",
    path: employeeBaseUrl+'/break-start-end/{id}',
    summary: "break-start/break-end employee",
    tags,
    request: {
      body: requestBody(EmployeeBreakStartEndBody),
    },
    security: [{ BearerAuth: []}],

    responses: {
      200: successJsonResponse("Employee Break Log", EmployeeBreakLog),
    },
  });

  registry.registerPath({
    method: "patch",
    path: employeeBaseUrl,
    summary: "update employee",
    tags,
    request: {
      body: requestBody(EmployeeUpdateBody),
    },
    security: [{ BearerAuth: []}],

    responses: {
      200: successJsonResponse("Employee", EmployeeSchema),
    },
  });

  registry.registerPath({
    method: "patch",
    path: employeeBaseUrl+'/url-submit',
    summary: "submit employee url",
    tags,
    request: {
      body: requestBody(EmployeeUrlSubmitBody),
    },

    responses: {
      200: successJsonResponse("Employee", EmployeeSchema),
    },
  });

  registry.registerPath({
    method: "patch",
    path: employeeBaseUrl+'/work-logs/comment',
    summary: "set work log comment",
    tags,
    request: {
      body: requestBody(EmployeeWorkLogCommentBody),
    },
    security: [{ BearerAuth: []}],

    responses: {
      200: successJsonResponse("Success message", z.literal('Successfully set a comment'))
    },
  });

  registry.registerPath({
    method: "patch",
    path: employeeBaseUrl+'/work-logs',
    summary: "update work log",
    tags,
    request: {
      body: requestBody(EmployeeWorkLogUpdateBody),
    },
    security: [{ BearerAuth: []}],

    responses: {
      200: successJsonResponse("Work Log", z.object({
        id: z.number(),
        status: EmployeeStatus,
        workLog: EmployeeWorkLog
      }),)
    },
  });

  registry.registerPath({
    method: "delete",
    path: employeeBaseUrl+"/{id}",
    summary: "delete employee",
    tags,
    request: {
      params: IdParam,
    },
    security: [{ BearerAuth: []}],

    responses: {
      200: successJsonResponse("Success Message", z.literal('Employee has been deleted')),
    },
  });

  return registry;
}
