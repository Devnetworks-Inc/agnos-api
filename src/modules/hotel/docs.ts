import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { requestBody, successJsonResponse } from "src/utils/docsHelper";
import { z } from "zod";
import { Hotel, HotelCreateBody, HotelUpdateBody } from "./schema";
import { IdParam } from "../id/schema";
import { hotelBaseUrl } from "src/router";

const tags = ["Hotel"]

export function registerHotelRoutes(registry: OpenAPIRegistry) {
  const HotelSchema = registry.register("Hotel", Hotel);

  registry.registerPath({
    method: "post",
    path: hotelBaseUrl,
    summary: "create hotel",
    tags,
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
    path: hotelBaseUrl,
    summary: "get hotels",
    tags,
    security: [{ BearerAuth: []}],

    responses: {
      200: successJsonResponse("Hotels", z.array(HotelSchema)),
    },
  });

  registry.registerPath({
    method: "get",
    path: hotelBaseUrl+"/{id}",
    summary: "get hotel by id",
    tags,
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
    path: hotelBaseUrl,
    summary: "update hotel",
    tags,
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
    path: hotelBaseUrl+"/{id}",
    summary: "delete hotel",
    tags,
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
