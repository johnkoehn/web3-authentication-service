import { Request, ResponseToolkit, ResponseObject } from '@hapi/hapi';
import tokenRequestSchema from './tokenRequestSchema';
import readSecrets from '../util/aws/readSecrets';

const handler = async (request: Request, h: ResponseToolkit): Promise<ResponseObject> => {
    const result = await readSecrets();
    console.log(result);

    return h.response({
        status: 'healthy'
    }).code(200);
};

export default {
    method: 'post',
    path: '/tokens',
    handler,
    options: {
        validate: {
            payload: tokenRequestSchema
        }
    }
};
