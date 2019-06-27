import 'express-async-errors';
import express from 'express';
import { downloadedPath, staticPath } from '../helpers/publicPath';
import logger from '../logger';
import { notFoundExceptionHandler } from '../helpers/exceptionHandler';
import botRouter from '../features/bot/route';

export default app => {
  // home
  app.get('/', (req, res) => {
    res.send('OK');
  });

  // serve static and downloaded files
  app.use('/static', express.static(staticPath));
  app.use('/downloaded', express.static(downloadedPath));

  // webhook callback
  app.use(botRouter);

  // handle 404
  app.use((req, res, next) => {
    notFoundExceptionHandler('Invalid route');
  });

  // handle error
  app.use((error, req, res, next) => {
    const status = error.status || 500;
    // Log the exception
    const message = `${status} - ${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`;
    logger.error(new Error(message));
    if (status === 500 && app.get('env') === 'development') {
      console.log(error);
    }
    return res.status(status).json({
      error: {
        status,
        message: error.message,
      },
    });
  });
};
