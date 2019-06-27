import Joi from 'joi';

const envVarsSchema = Joi.object({
  CHANNEL_ACCESS_TOKEN: Joi.string().required(),
  CHANNEL_SECRET: Joi.string().required(),
})
  .unknown()
  .required();

const { error, value: envVars } = Joi.validate(process.env, envVarsSchema);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const config = {
  line: {
    channelAccessToken: envVars.CHANNEL_ACCESS_TOKEN,
    channelSecret: envVars.CHANNEL_SECRET,
  },
};

module.exports = config;
