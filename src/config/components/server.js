import Joi from 'joi';

const envVarsSchema = Joi.object({
  BASE_URL: Joi.string().required(),
  PORT: Joi.number().default(3000),
  GRACEFUL_SHUTDOWN_TIMEOUT: Joi.number().default(30000),
})
  .unknown()
  .required();

const { error, value: envVars } = Joi.validate(process.env, envVarsSchema);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const config = {
  server: {
    baseUrl: envVars.BASE_URL,
    port: envVars.PORT,
    gracefulShutdownTimeout: envVars.GRACEFUL_SHUTDOWN_TIMEOUT,
  },
};

module.exports = config;
