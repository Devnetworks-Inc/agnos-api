import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { requestBody, successJsonResponse } from "src/utils/docsHelper";
import { z } from "zod";
import { ServiceEntry, ServiceEntryCreateBody, ServiceEntryUpdateBody } from "./schema";
import { IdParam } from "../id/schema";

export function registerServiceEntryRoutes(registry: OpenAPIRegistry) {
  const ServiceEntrySchema = registry.register("ServiceEntry", ServiceEntry);

  registry.registerPath({
    method: "post",
    path: "/service-entry/",
    summary: "create service entry",
    tags: ["ServiceEntry"],
    request: {
      body: requestBody(ServiceEntryCreateBody),
    },
    security: [{ BearerAuth: []}],

    responses: {
      200: successJsonResponse("ServiceEntry", ServiceEntry),
    },
  });

  registry.registerPath({
    method: "get",
    path: "/service-entry",
    summary: "get service entries",
    tags: ["ServiceEntry"],
    security: [{ BearerAuth: []}],

    responses: {
      200: successJsonResponse("ServiceEntrys", z.array(ServiceEntrySchema)),
    },
  });

  registry.registerPath({
    method: "get",
    path: "/service-entry/{id}",
    summary: "get service entry by id",
    tags: ["ServiceEntry"],
    request: {
      params: IdParam
    },
    security: [{ BearerAuth: []}],

    responses: {
      200: successJsonResponse("ServiceEntry", ServiceEntrySchema),
    },
  });

  registry.registerPath({
    method: "patch",
    path: "/service-entry",
    summary: "update service entry",
    tags: ["ServiceEntry"],
    request: {
      body: requestBody(ServiceEntryUpdateBody),
    },
    security: [{ BearerAuth: []}],

    responses: {
      200: successJsonResponse("ServiceEntry", ServiceEntrySchema),
    },
  });

  registry.registerPath({
    method: "delete",
    path: "/service-entry/{id}",
    summary: "delete service entry",
    tags: ["ServiceEntry"],
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
