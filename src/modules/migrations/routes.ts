import { Router } from "express";
import { authorizeRoles } from "src/middlewares/authorization";
import { migrationUpdateContoller } from "./ctrl.patch";
import { validateToken } from "src/middlewares/validateToken";

const migrationRouter = Router()

migrationRouter
  .use(validateToken)
  .patch('/', authorizeRoles(['agnos_admin']), migrationUpdateContoller)

export default migrationRouter