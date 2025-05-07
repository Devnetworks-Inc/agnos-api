import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { successJsonResponse } from "src/utils/docsHelper";
import { z } from "zod";
import { fileBaseUrl } from "src/router";
import { FileSchema } from "./schema";

const tags = ["File"]

export function registerFileRoutes(registry: OpenAPIRegistry) {
  registry.registerPath({
    method: "post",
    path: fileBaseUrl+'/upload',
    summary: "upload file",
    tags,
    request: {
      body: {
        content: {
          'multipart/form-data': {
            schema: z.object({
              file: FileSchema,
            }),
          },
        },
      },
    },
    security: [{ BearerAuth: []}],

    responses: {
      200: successJsonResponse("File", z.string() ),
    },
  });

  return registry;
}
