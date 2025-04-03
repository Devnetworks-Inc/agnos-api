import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { requestBody, successJsonResponse } from "src/utils/docsHelper";
import { z } from "zod";
import { Employee, EmployeeCheckInOutBody, EmployeeCreateBody, EmployeeCreateShareableUrlBody, EmployeeGetQuery, EmployeeUpdateBody, EmployeeWorkLog } from "./schema";
import { IdParam } from "../id/schema";
import { employeeBaseUrl } from "./routes";

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
