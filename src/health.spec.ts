import Hapi, { Server, ServerInjectOptions } from '@hapi/hapi';
import health from './health';

describe('Health', () => {
    let server: Server;
    let request: ServerInjectOptions;

    beforeEach(() => {
        server = new Hapi.Server();

        server.route(health);

        request = {
            method: 'GET',
            url: '/v1/health'
        };
    });

    it('should return a 200', async () => {
        const response = await server.inject(request);

        expect(response.statusCode).toEqual(200);
        expect(response.result).toEqual({
            status: 'healthy'
        });
    });
});
