import Boom from '@hapi/boom';
import { Request } from '@hapi/hapi';

const handler = (request: Request): Boom.Boom => {
    return Boom.notFound(`No handler for path [${request.url.pathname}] and method [${request.method}]`);
};

export default {
    method: ['*'],
    path: '/{any*}',
    handler
};
