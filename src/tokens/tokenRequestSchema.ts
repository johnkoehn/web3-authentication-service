import Joi from 'joi';

const tokenRequestSchema = Joi.object().keys({
    publicKey: Joi.string()
        .required()
        .min(1)
}).unknown(false);

export default tokenRequestSchema;
