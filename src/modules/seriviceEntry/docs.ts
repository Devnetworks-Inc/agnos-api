import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { requestBody, successJsonResponse } from "src/utils/docsHelper";
import { z } from "zod";
import { ServiceEntry, ServiceEntryCreateBody, ServiceEntryUpdateBody } from "./schema";
import { IdParam } from "../id/schema";
import { serviceEntryBaseUrl } from "src/router";

const tags = ["ServiceEntry"]

export function registerServiceEntryRoutes(registry: OpenAPIRegistry) {
  const ServiceEntrySchema = registry.register("ServiceEntry", ServiceEntry);

  registry.registerPath({
    method: "post",
    path: serviceEntryBaseUrl,
    summary: "create service entry",
    tags,
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
    path: serviceEntryBaseUrl,
    summary: "get service entries",
    tags,
    security: [{ BearerAuth: []}],

    responses: {
      200: successJsonResponse("ServiceEntrys", z.array(ServiceEntrySchema)),
    },
  });

  registry.registerPath({
    method: "get",
    path: `${serviceEntryBaseUrl}/{id}`,
    summary: "get service entry by id",
    tags,
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
    path: serviceEntryBaseUrl,
    summary: "update service entry",
    tags,
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
    path: serviceEntryBaseUrl+"/{id}",
    summary: "delete service entry",
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
