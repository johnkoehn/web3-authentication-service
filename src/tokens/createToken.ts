import { Request, ResponseToolkit, ResponseObject } from '@hapi/hapi';
import tokenRequestSchema from './tokenRequestSchema';
import createJwt from './createJwt';

const handler = async (request: Request, h: ResponseToolkit): Promise<ResponseObject> => {
    const tokenRequest = request.payload as TokenRequest;
    const result = await createJwt(tokenRequest.publicKey);

    return h.response(result).code(200);
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
