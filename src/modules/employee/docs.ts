import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { requestBody, successJsonResponse } from "src/utils/docsHelper";
import { z } from "zod";
import { Employee, EmployeeCreateBody, EmployeeGetQuery, EmployeeUpdateBody } from "./schema";
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
