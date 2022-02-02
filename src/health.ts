import { Request, ResponseToolkit, ResponseObject } from '@hapi/hapi';

const handler = (request: Request, h: ResponseToolkit): ResponseObject => {
    return h.response({
        status: 'healthy'
    }).code(200);
};

export default {
    method: 'GET',
    path: '/health',
    handler
};
