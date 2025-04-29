require('express-async-errors')
require('dotenv').config()
import express from 'express'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
extendZodWithOpenApi(z)
import getOpenApiDocumentation from './docs'
import { errorHandler } from './middlewares/errorHandler'
import router from './router'

process.env.TZ = 'Europe/Berlin'

const app = express()
const docs = getOpenApiDocumentation()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(docs));
app.use(router)
app.use(errorHandler)

const port = process.env.PORT || 3000
export const server = app.listen(port, () => {
  console.log(`Server running at port ${process.env.PORT || 3000}`)
})

export default app