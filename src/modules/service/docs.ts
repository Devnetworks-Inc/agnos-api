import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { requestBody, successJsonResponse } from "src/utils/docsHelper";
import { z } from "zod";
import { Service, ServiceCreateBody, ServiceUpdateBody } from "./schema";
import { IdParam } from "../id/schema";
import { serviceBaseUrl } from "src/router";

const tags = ["Service"]

export function registerServiceRoutes(registry: OpenAPIRegistry) {
  const ServiceSchema = registry.register("Service", Service);

  registry.registerPath({
    method: "post",
    path: serviceBaseUrl,
    summary: "create service",
    tags,
    request: {
      body: requestBody(ServiceCreateBody),
    },
    security: [{ BearerAuth: []}],

    responses: {
      200: successJsonResponse("Service", Service),
    },
  });

  registry.registerPath({
    method: "get",
    path: serviceBaseUrl,
    summary: "get service",
    tags,
    security: [{ BearerAuth: []}],

    responses: {
      200: successJsonResponse("Services", z.array(ServiceSchema)),
    },
  });

  registry.registerPath({
    method: "get",
    path: `${serviceBaseUrl}/{id}`,
    summary: "get service by id",
    tags,
    request: {
      params: IdParam
    },
    security: [{ BearerAuth: []}],

    responses: {
      200: successJsonResponse("Service", ServiceSchema),
    },
  });

  registry.registerPath({
    method: "patch",
    path: serviceBaseUrl,
    summary: "update service",
    tags,
    request: {
      body: requestBody(ServiceUpdateBody),
    },
    security: [{ BearerAuth: []}],

    responses: {
      200: successJsonResponse("Service", ServiceSchema),
    },
  });

  registry.registerPath({
    method: "delete",
    path: serviceBaseUrl+"/{id}",
    summary: "delete service",
    tags,
    request: {
      params: IdParam,
    },
    security: [{ BearerAuth: []}],

    responses: {
      200: successJsonResponse("Success Message", z.literal('Service Entry has been deleted')),
    },
  });

  return registry;
}
