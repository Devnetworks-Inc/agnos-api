import { NextFunction, Response } from "express";
import { Schema, ZodError } from "zod";
import resp from "objectify-response";
import { Request } from "express-jwt";
import { Auth } from "src/schemas/auth";

const validateRequest = (schema: Schema) => (req: Request<Auth>, res: Response, next: NextFunction) => {
  try {
    const { body, query, params } = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    req.body = body
    req.query = query
    req.params = params
    next();
  } catch (err: any) {
    if (err instanceof ZodError) {
      const errors = err.errors.map(({ path, message }) => ({ path, message }) )
      const { path, message } = errors[0]
      return resp(res, `${message} on property '${path[path.length - 1]}'`, 400)
    }
    next(err)
  }
};

export default validateRequest