import { z } from "zod";

export const FileSchema = z.string().describe('File to upload').openapi({ format: 'binary' })