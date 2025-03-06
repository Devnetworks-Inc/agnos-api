import { ZodTypeAny, z } from "zod";

export const successJsonResponse = <T extends ZodTypeAny>(
  description: string,
  message: T
) => ({
  description,
  content: {
    "application/json": {
      schema: z.object({
        status: z.literal(200),
        message,
        name: z.string(),
      }),
    },
  },
});

export const requestBody = <T extends ZodTypeAny>(schema: T) => ({
  content: {
    "application/json": {
      schema,
    },
  },
});
