import fs from 'fs';
import path from 'path';
import winston from 'winston';
import Raven from 'raven';
import config from '../config';

const logDirectory = 'logs';

// ensure log directory exists
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}
const FILE_COMBINED = path.join(logDirectory, 'combined.log');
const FILE_ERROR = path.join(logDirectory, 'error.log');
const FILE_EXCEPTIONS = path.join(logDirectory, 'uncaughtExceptions.log');

let logger;
let isSentryEnable = false;

export const init = app => {
  // handle unhandled rejection
  process.on('unhandledRejection', ex => {
    throw ex;
  });

  const isProduction = app.get('env') === 'production';

  logger = winston.createLogger({
    transports: [
      //  Write all logs error or info (and below) to console
      new winston.transports.Console({
        level: isProduction ? 'info' : 'debug',
        handleExceptions: true,
        humanReadableUnhandledException: true,
        format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
      }),
    ],
  });

  logger.exitOnError = false;

  if (isProduction) {
    // Write to all logs with level `info` and below to `combined.log`
    logger.add(
      new winston.transports.File({
        level: 'info',
        filename: FILE_COMBINED,
        handleExceptions: false,
        format: winston.format.prettyPrint(),
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        colorize: false,
      })
    );
    // Write all logs error (and below) to `error.log`.
    logger.add(
      new winston.transports.File({
        level: 'error',
        filename: FILE_ERROR,
        handleExceptions: false,
        format: winston.format.json(),
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        colorize: false,
      })
    );

    // handle uncaught exception to file
    logger.exceptions.handle(
      new winston.transports.File({
        filename: FILE_EXCEPTIONS,
        format: winston.format.json(),
      })
    );
  }

  // Sentry config
  const { dns: sentryDNS } = config.sentry;
  if (sentryDNS) {
    isSentryEnable = true;
    Raven.config(sentryDNS, {
      release: config.release,
      environment: config.env,
    }).install((err, initialErr, eventId) => {
      error(err);
      // process.exit(1);
      isSentryEnable = false;
    });
  }
};

const log = message => info(message);

const logLevel = (level, message) => logger.log(level, message);

const error = ex => {
  logger.error(ex.message);
  if (isSentryEnable) Raven.captureException(ex);
};

const warn = message => logger.warn(message);

const info = message => logger.info(message);

const verbose = message => logger.verbose(message);

const debug = message => logger.debug(message);

const silly = message => logger.silly(message);

export default {
  log,
  logLevel,
  error,
  warn,
  info,
  verbose,
  debug,
  silly,
};
