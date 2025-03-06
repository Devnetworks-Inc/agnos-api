import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { requestBody, successJsonResponse } from "src/utils/docsHelper";
import { z } from "zod";
import { LoginBody, User, UserCreateBody, UserUpdateBody } from "./schema";
import { IdParam } from "../id/schema";

export function registerUserRoutes(registry: OpenAPIRegistry) {
  const UserSchema = registry.register("User", User);

  registry.registerPath({
    method: "post",
    path: "/users/login",
    summary: "login user",
    tags: ["User"],
    request: {
      body: requestBody(LoginBody),
    },

    responses: {
      200: successJsonResponse("Authorization token", z.string()),
    },
  });

  registry.registerPath({
    method: "post",
    path: "/users/",
    summary: "create user",
    tags: ["User"],
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
    path: "/users",
    summary: "get users",
    tags: ["User"],
    security: [{ BearerAuth: []}],

    responses: {
      200: successJsonResponse("Users", z.array(UserSchema)),
    },
  });

  registry.registerPath({
    method: "patch",
    path: "/users",
    summary: "update user",
    tags: ["User"],
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
    path: "/users/{id}",
    summary: "delete user",
    tags: ["User"],
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
