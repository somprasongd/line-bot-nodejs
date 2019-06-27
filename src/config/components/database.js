import Joi from 'joi';

// connect to db:
// postgres: 'postgres://user:password@host:port/db_name'
// mongo: 'mongodb://user:password@host:port/db_name'
const envVarsSchema = Joi.object({
  APPNAME_DB_URI: Joi.string().required(),
})
  .unknown()
  .required();

const { error, value: envVars } = Joi.validate(process.env, envVarsSchema);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const config = {
  db: {
    uri: envVars.APPNAME_DB_URI,
  },
};

module.exports = config;
