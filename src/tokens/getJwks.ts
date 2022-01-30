import { Request, ResponseToolkit, ResponseObject } from '@hapi/hapi';
import getKeys from '../util/keys/getKeys';

const handler = async (request: Request, h: ResponseToolkit): Promise<ResponseObject> => {
    const jwks: PublicJwks = await getKeys(false, true);
    return h.response(jwks).code(200);
};

export default {
    method: 'GET',
    path: '/.well-known/jwks.json',
    handler
};
