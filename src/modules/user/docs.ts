import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { requestBody, successJsonResponse } from "src/utils/docsHelper";
import { z } from "zod";
import { LoginBody, User, UserCreateBody, UserUpdateBody } from "./schema";
import { IdParam } from "../id/schema";
import { userBaseUrl } from "src/router";

const tags = ["User"]

export function registerUserRoutes(registry: OpenAPIRegistry) {
  const UserSchema = registry.register("User", User);

  registry.registerPath({
    method: "post",
    path: userBaseUrl+"/login",
    summary: "login user",
    tags,
    request: {
      body: requestBody(LoginBody),
    },

    responses: {
      200: successJsonResponse("Authorization token", z.string()),
    },
  });

  registry.registerPath({
    method: "post",
    path: userBaseUrl,
    summary: "create user",
    tags,
    request: {
      body: requestBody(UserCreateBody),
    },
    security: [{ BearerAuth: []}],

    responses: {
      200: successJsonResponse("User", User.omit({ password: true })),
    },
  });

  registry.registerPath({
    method: "get",
    path: userBaseUrl,
    summary: "get users",
    tags,
    security: [{ BearerAuth: []}],

    responses: {
      200: successJsonResponse("Users", z.array(UserSchema)),
    },
  });

  registry.registerPath({
    method: "patch",
    path: userBaseUrl,
    summary: "update user",
    tags,
    request: {
      body: requestBody(UserUpdateBody),
    },
    security: [{ BearerAuth: []}],

    responses: {
      200: successJsonResponse("User", UserSchema),
    },
  });

  registry.registerPath({
    method: "delete",
    path: userBaseUrl+"/{id}",
    summary: "delete user",
    tags,
    request: {
      params: IdParam,
    },
    security: [{ BearerAuth: []}],

    responses: {
      200: successJsonResponse("Success Message", z.literal('User has been deleted')),
    },
  });

  return registry;
}
