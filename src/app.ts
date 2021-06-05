import 'reflect-metadata';
import bodyParser from "body-parser";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from 'morgan';
import express, { Request, Response, NextFunction } from "express";
import ApplicationError from "./errors/application-error";
import routes from "./routes";
const cors = require("cors");
import { rateLimiter } from "./middleware/limiter";
import { morganMiddleware } from './middleware/morganMiddleware';
require('./config/database')
import fs from 'fs'
import path from 'path'
import logger from './logger';


const app = express();
const morganFormat = process.env.NODE_ENV !== "production" ? "dev" : "combined";
const accessLogStream = fs.createWriteStream(path.join(__dirname, '../../logs/logfile'), { flags: 'a' })

app.use(morgan('combined', { stream: logger.stream }))

app.use(compression());
app.use(cookieParser());
// initalize passport
app.use(
  cors({
    origin: '*', // allow to server to accept request from different origin
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    optionsSuccessStatus: 200,
    credentials: true // allow session cookie from browser to pass through
  })
);


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(rateLimiter);

app.set("port", process.env.PORT || 3000);

app.use(routes);
app.get("/test", (req, res) =>
  res.status(200).json({ success: true, data: "Hello world!" })
);
// Capture 500 errors
app.use((err,req,res,next) => {
  res.status(500).send('Could not perform the calculation!');
     logger.error(`${err.status || 500} - ${res.statusMessage} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  })
  
  // Capture 404 erors
  app.use((req,res,next) => {
      res.status(404).send("PAGE NOT FOUND");
      logger.error(`400 || ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  })


app.use(function (req, res, next) {
  return res.status(404).send({
    status: "Not Found",
    status_code: 404,
  });
});

app.use(
  (err: ApplicationError, req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
      return next(err);
    }

    const statusCode: number = err.statusCode || 500;

    return res.status(statusCode).json({
      status: err.status,
      statusCode,
      message: err.message,
      error: process.env.NODE_ENV === "development" ? err : undefined,
    });
  }
);

export default app;
