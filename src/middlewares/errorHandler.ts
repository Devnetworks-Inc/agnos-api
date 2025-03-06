import { Response, Request, NextFunction } from "express";
import resp from 'objectify-response';
import path from "path";
import winston from 'winston';

const { combine, timestamp, json } = winston.format;
const isProduction = process.env.NODE_ENV === 'production'

const logger = winston.createLogger({
  level: 'info',
  format: combine(timestamp(), json())
});

logger.add(new winston.transports.Console({
  format: winston.format.prettyPrint(),
}));

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err.name === "UnauthorizedError") {
    return resp(res, "Invalid token", 401)
  }

  if (isProduction) {
    const epoch = new Date().valueOf()
    const transports = new winston.transports.File({ 
      filename: path.join(__dirname, `../../logs/${epoch}.log`),
      level: 'error' 
    })

    logger.add(transports)
    logger.on('finish', function () {
      logger.remove(transports)
    });
  }
  logger.error(req.route)
  logger.error(err.message)
  logger.error(err)
  logger.error(err.stack)

  resp( res, isProduction ? 'Internal server error' : err, 500 );
};
