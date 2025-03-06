import { expressjwt } from "express-jwt";

const jwtSecret = process.env.JWT_SECRET || ''
export const validateToken = expressjwt({ secret: jwtSecret, algorithms: ["HS256"] })