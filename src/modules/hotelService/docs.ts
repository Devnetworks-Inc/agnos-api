import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { requestBody, successJsonResponse } from "src/utils/docsHelper";
import { z } from "zod";
import { HotelService, HotelServiceCreateBody, HotelServiceUpdateBody } from "./schema";
import { IdParam } from "../id/schema";
import { hotelServiceBaseUrl } from "src/router";

const tags = ["HotelService"]

export function registerHotelServiceRoutes(registry: OpenAPIRegistry) {
  const HotelServiceSchema = registry.register("HotelService", HotelService);

  registry.registerPath({
    method: "post",
    path: hotelServiceBaseUrl,
    summary: "create hotel service",
    tags,
    request: {
      body: requestBody(HotelServiceCreateBody),
    },
    security: [{ BearerAuth: []}],

    responses: {
      200: successJsonResponse("HotelService", HotelService),
    },
  });

  registry.registerPath({
    method: "get",
    path: hotelServiceBaseUrl,
    summary: "get hotel services",
    tags,
    security: [{ BearerAuth: []}],

    responses: {
      200: successJsonResponse("HotelServices", z.array(HotelServiceSchema)),
    },
  });

  registry.registerPath({
    method: "get",
    path: `${hotelServiceBaseUrl}/{id}`,
    summary: "get hotel service by id",
    tags,
    request: {
      params: IdParam
    },
    security: [{ BearerAuth: []}],

    responses: {
      200: successJsonResponse("HotelService", HotelServiceSchema),
    },
  });

  registry.registerPath({
    method: "patch",
    path: hotelServiceBaseUrl,
    summary: "update hotel service",
    tags,
    request: {
      body: requestBody(HotelServiceUpdateBody),
    },
    security: [{ BearerAuth: []}],

    responses: {
      200: successJsonResponse("HotelService", HotelServiceSchema),
    },
  });

  registry.registerPath({
    method: "delete",
    path: hotelServiceBaseUrl+"/{id}",
    summary: "delete hotel service",
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
