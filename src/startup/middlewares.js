import createGracefulShutdownMiddleware from 'express-graceful-shutdown';
import config from '../config';

export default app => {
  const { gracefulShutdownTimeout } = config.server;
  // use middlewares
  app.use(createGracefulShutdownMiddleware(app.get('server'), { forceTimeout: gracefulShutdownTimeout }));
};
