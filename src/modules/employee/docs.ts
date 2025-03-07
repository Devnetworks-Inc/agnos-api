import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { requestBody, successJsonResponse } from "src/utils/docsHelper";
import { z } from "zod";
import { Employee, EmployeeCreateBody, EmployeeUpdateBody } from "./schema";
import { IdParam } from "../id/schema";

export function registerEmployeeRoutes(registry: OpenAPIRegistry) {
  const EmployeeSchema = registry.register("Employee", Employee);

  registry.registerPath({
    method: "post",
    path: "/employees/",
    summary: "create employee",
    tags: ["Employee"],
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
    path: "/employees",
    summary: "get employees",
    tags: ["Employee"],
    security: [{ BearerAuth: []}],

    responses: {
      200: successJsonResponse("Employees", z.array(EmployeeSchema)),
    },
  });

  registry.registerPath({
    method: "patch",
    path: "/employees",
    summary: "update employee",
    tags: ["Employee"],
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
    path: "/employees/{id}",
    summary: "delete employee",
    tags: ["Employee"],
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
