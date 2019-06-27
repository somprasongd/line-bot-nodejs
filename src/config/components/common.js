import Joi from 'joi';

const envVarsSchema = Joi.object({
  NODE_ENV: Joi.string().default('development'),
  APPNAME_RELEASE: Joi.string().default('0.0.1'),
})
  .unknown()
  .when(Joi.object({ NODE_ENV: Joi.exist() }), {
    then: Joi.object({ NODE_ENV: Joi.valid(['development', 'production', 'test', 'provision']) }),
  })
  .required();
const { error, value: envVars } = Joi.validate(process.env, envVarsSchema);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const config = {
  env: envVars.NODE_ENV,
  release: envVars.APPNAME_RELEASE,
};

export default config;
