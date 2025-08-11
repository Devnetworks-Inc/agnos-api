import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { successJsonResponse } from "src/utils/docsHelper";

const tags = ["Migration"]

export const migrationBaseUrl = '/migration'

export function registerMigrationRoutes(registry: OpenAPIRegistry) {

  registry.registerPath({
    method: "patch",
    path: migrationBaseUrl+'/',
    summary: "migration update",
    tags,
    security: [{ BearerAuth: []}],

    responses: {
      200: successJsonResponse("Success message", z.string()),
    },
  });

  return registry
}