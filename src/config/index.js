// eslint-disable-next-line no-unused-vars
import _ from './components/dotenv';
import line from './components/line';
import common from './components/common';
// import database from './components/database';
import server from './components/server';
import sentry from './components/sentry';

// use Joi in each components
// ['APPNAME_DB_URI', 'APPNAME_JWT_SECRET'].forEach(name => {
//   if (!process.env[name]) {
//     throw new Error(`FATAL ERROR: Environment variable ${name} is missing`);
//   }
// });

const config = {
  ...common,
  // ...database,
  ...server,
  ...sentry,
  ...line,
};

export default config;
