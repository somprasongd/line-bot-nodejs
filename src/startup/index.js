import * as logger from '../logger';
import initMiddlewares from './middlewares';
import initRoutes from './routes';

export default app => {
  logger.init(app); // setup winston log
  initMiddlewares(app); // handle middlewares
  initRoutes(app); // handle routes
};
