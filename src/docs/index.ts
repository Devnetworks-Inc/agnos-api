import { OpenAPIRegistry, OpenApiGeneratorV31 } from "@asteasolutions/zod-to-openapi";
import registerAuth from "./auth";
import { registerUserRoutes } from "src/modules/user/docs";
import { registerEmployeeRoutes } from "src/modules/employee/docs";
import { registerHotelRoutes } from "src/modules/hotel/docs";
import { registerDailyHousekeepingRecordRoutes } from "src/modules/dailyHouseKeepingRecord/docs";


let registry = new OpenAPIRegistry()

registerAuth(registry)
registerUserRoutes(registry)
registerDailyHousekeepingRecordRoutes(registry)
registerEmployeeRoutes(registry)
registerHotelRoutes(registry)

function getOpenApiDocumentation() {
  const generator = new OpenApiGeneratorV31(registry.definitions);

  return generator.generateDocument({
    openapi: '3.0.1',
    info: {
      version: '1.0.0',
      title: 'Agnos Housekeeping Sytem',
      description: 'Agnos Housekeeping Sytem API',
    },
    servers: [
      { url: 'http://localhost:3000/api/v1' },
      { url: 'https://agnos-api.onrender.com/api/v1' }
    ],
  });
}

export default getOpenApiDocumentation