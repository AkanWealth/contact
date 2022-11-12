import cors from 'cors';
import http from 'http';
import helmet from 'helmet';
import { config } from 'dotenv';
import compression from 'compression';
// import { Server } from 'socket.io';
import * as Sentry from '@sentry/node';
import express, { Request } from 'express';
import * as Tracing from '@sentry/tracing';

import routes from './routes';
import mongoose from 'mongoose';
import { dbConfig } from './database/config/config';
import Logging from './modules/common/Logging';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './modules/common/utils';

config();

const app = express();
// const io = new Server();
const { SENTRY_DSN, NODE_ENV } = process.env;

/** Connect to Mongo */
mongoose
  .connect(dbConfig.mongo.url, { retryWrites: true, w: 'majority' })
  .then(() => {
    Logging.info('Mongo connected successfully.');
    StartServer();
  })
  .catch((error) => Logging.error(error));

const StartServer = () => {
  /** Log the request */
  app.use((req, res, next) => {
    /** Log the req */
    Logging.info(
      `Incomming - METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`
    );

    res.on('finish', () => {
      /** Log the res */
      Logging.info(
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

  app.use(
    cors({
      origin: (_origin, callback) => {
        callback(null, true);
      },
      credentials: true,
    })
  );

  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(express.json({ limit: '10mb' }));
  app.disable('x-powered-by');

  app.use('/', apiLimiter, routes);

  // Error handlers
  app.use(Sentry.Handlers.errorHandler());
  app.use(errorHandler);

  app.use((req, res, next) => {
    const error = new Error('Not found');

    Logging.error(error);

    res.status(404).json({
        message: error.message
    });
});

http.createServer(app).listen(dbConfig.server.port, () => Logging.info(`Server is running on port ${dbConfig.server.port}`));
};
export default app;
