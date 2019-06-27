import logger from '../../logger';
import { exceptionHandler } from '../../helpers/exceptionHandler';
import { handleEvent } from './service';

export const webhookController = (req, res) => {
  const { destination, events } = req.body;

  if (destination) {
    logger.log(`Destination User ID: ${destination}`);
  }

  if (!Array.isArray(events)) {
    return exceptionHandler('req.body.events should be an array of events');
  }

  // handle events separately
  Promise.all(events.map(handleEvent))
    .then(() => res.end())
    .catch(err => exceptionHandler(err));
};
