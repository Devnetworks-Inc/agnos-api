import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { requestBody, successJsonResponse } from "src/utils/docsHelper";
import { z } from "zod";
import { Hotel, HotelCreateBody, HotelUpdateBody } from "./schema";
import { IdParam } from "../id/schema";

export function registerHotelRoutes(registry: OpenAPIRegistry) {
  const HotelSchema = registry.register("Hotel", Hotel);

  registry.registerPath({
    method: "post",
    path: "/hotels/",
    summary: "create hotel",
    tags: ["Hotel"],
    request: {
      body: requestBody(HotelCreateBody),
    },
    security: [{ BearerAuth: []}],

    responses: {
      200: successJsonResponse("Hotel", Hotel),
    },
  });

  registry.registerPath({
    method: "get",
    path: "/hotels",
    summary: "get hotels",
    tags: ["Hotel"],
    security: [{ BearerAuth: []}],

    responses: {
      200: successJsonResponse("Hotels", z.array(HotelSchema)),
    },
  });

  registry.registerPath({
    method: "get",
    path: "/hotels/{id}",
    summary: "get hotel by id",
    tags: ["Hotel"],
    request: {
      params: IdParam
    },
    security: [{ BearerAuth: []}],

    responses: {
      200: successJsonResponse("Hotel", HotelSchema),
    },
  });

  registry.registerPath({
    method: "patch",
    path: "/hotels",
    summary: "update hotel",
    tags: ["Hotel"],
    request: {
      body: requestBody(HotelUpdateBody),
    },
    security: [{ BearerAuth: []}],

    responses: {
      200: successJsonResponse("Hotel", HotelSchema),
    },
  });

  registry.registerPath({
    method: "delete",
    path: "/hotels/{id}",
    summary: "delete hotel",
    tags: ["Hotel"],
    request: {
      params: IdParam,
    },
    security: [{ BearerAuth: []}],

    responses: {
      200: successJsonResponse("Success Message", z.literal('Hotel has been deleted')),
    },
  });

  return registry;
}
