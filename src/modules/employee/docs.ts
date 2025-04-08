import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { requestBody, successJsonResponse } from "src/utils/docsHelper";
import { z } from "zod";
import { employeeBaseUrl } from "src/router";
import { Employee, EmployeeBreakLog, EmployeeBreakStartEndBody, EmployeeCheckInOutBody, EmployeeCreateBody, EmployeeCreateShareableUrlBody, EmployeeGetByUrlParam, EmployeeGetQuery, EmployeeUpdateBody, EmployeeUrlSubmitBody, EmployeeWorkLog } from "./schema";
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
