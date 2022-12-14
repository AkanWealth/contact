import cors from 'cors';
import http from 'http';
import helmet from 'helmet';
import { config } from 'dotenv';
import compression from 'compression';
// import { Server } from 'socket.io';
import * as Sentry from '@sentry/node';
import express, { Request } from 'express';
import * as Tracing from '@sentry/tracing';
import path from "path";

import routes from './routes';
import mongoose from 'mongoose';
import { dbConfig } from './database/config/config';
import Logging from './modules/common/Logging';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './modules/common/utils';
import multer from 'multer';
import { BulkUpload } from './modules/v1/contact/contact.controller';

config();

const app = express();
// const io = new Server();
const { SENTRY_DSN, NODE_ENV } = process.env;

/** Connect to Mongo */
mongoose
  .connect(dbConfig.mongo.url, { retryWrites: true, w: 'majority' })
  .then(() => {
    console.info('Mongo connected successfully.');
    StartServer();
  })
  .catch((error) => console.error(error));

const StartServer = () => {
  /** Log the request */
  app.use((req, res, next) => {
    /** Log the req */
    console.info(
      `Incomming - METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`
    );

    res.on('finish', () => {
      /** Log the res */
      console.info(
        `Result - METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}] - STATUS: [${res.statusCode}]`
      );
    });

    next();
  });

  const apiLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many request from this IP, please try again after 10 minutes',
  });

  // Middlewares
  app.use(helmet());
  app.use(compression());

  if (SENTRY_DSN) {
    Sentry.init({
      dsn: SENTRY_DSN,
      integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
        new Tracing.Integrations.Express({ app }),
      ],
      environment: NODE_ENV,
      tracesSampleRate: 1.0,
    });

    app.use(Sentry.Handlers.requestHandler());
    app.use(Sentry.Handlers.tracingHandler());
    app.use((req: Request, _res, next) => {
      // @ts-ignore
      if (!req.transaction) {
        // @ts-ignore
        req.transaction = Sentry.startTransaction({
          op: 'test',
          name: 'My First Test Transaction',
        });
      }
      next();
    });
  }

  app.use(cors({ origin: 'https://beamish-bunny-c576a0.netlify.app' }));
  // app.use(
  //   cors({
  //     origin: (_origin, callback) => {
  //       callback(null, true);
  //     },
  //     credentials: true,
  //   }),
  // );

  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  // app.use(express.static(path.join(__dirname, './modules/v1/contact/assets/')));
  app.use(express.static(path.join(__dirname, '/assets/')));
  app.use(express.json({ limit: '10mb' }));
  app.disable('x-powered-by');

  
  // const upload = multer({ dest: 'assets/' });
  // app.use('/upload', upload.single('file'), BulkUpload);
  
  app.use('/', apiLimiter, routes);

  // Error handlers
  app.use(Sentry.Handlers.errorHandler());
  app.use(errorHandler);

//   app.use(function(req,res,next) {
//     req.connection.setNoDelay(true)
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     // res.header("Access-Control-Allow-Credentials", true);
//         res.header("Access-Control-Allow-Origin", "https://beamish-bunny-c576a0.netlify.app"); 

//     res.header('Access-Control-Expose-Headers', 'agreementrequired');
  
//     next()
// })

  app.use((req, res, next) => {
    const error = new Error('Not found');

    console.log(error);

    res.status(404).json({
      message: error.message,
    });
  });

  app.listen(dbConfig.server.port, () =>
    console.log(`Server is running on port ${dbConfig.server.port}`)
  );
};
export default app;
