import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { successJsonResponse } from "src/utils/docsHelper";
import { z } from "zod";
import { FileEmployeeUploadParam, FileSchema } from "./schema";

const tags = ["File"]
export const fileBaseUrl = '/file'

export function registerFileRoutes(registry: OpenAPIRegistry) {
  registry.registerPath({
    method: "post",
    path: fileBaseUrl+'/employee-profile/{employeeId}',
    summary: "upload employee profile image",
    tags,
    request: {
      params: FileEmployeeUploadParam,
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

  registry.registerPath({
    method: "post",
    path: fileBaseUrl+'/employee-files/{employeeId}',
    summary: "upload employee files",
    tags,
    request: {
      params: FileEmployeeUploadParam,
      body: {
        content: {
          'multipart/form-data': {
            schema: z.object({
              files: z.array(FileSchema),
            }),
          },
        },
      },
    },
    security: [{ BearerAuth: []}],

    responses: {
      200: successJsonResponse("Files", z.string() ),
    },
  });

  return registry;
}
