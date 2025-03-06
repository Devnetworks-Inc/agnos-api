import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

export default function registerAuth(registry: OpenAPIRegistry) {
  registry.registerComponent('securitySchemes', 'BearerAuth', {
    type: 'http',
    scheme: 'bearer',
  })
  return registry
}
