import Hapi, { Server, ServerInjectOptions } from '@hapi/hapi';
import Chance from 'chance';
import catchAll from './catchAll';
import health from './health';

const chance = new Chance();

describe('Catch All', () => {
    let server: Server;
    let request: ServerInjectOptions;

    beforeEach(() => {
        server = new Hapi.Server();

        server.route(catchAll);

        request = {
            method: 'POST',
            url: `/${chance.word()}`,
            payload: JSON.stringify({
                [chance.word()]: chance.string()
            })
        };
    });

    it('should return a 404 for urls that do not have an endpoint', async () => {
        const response = await server.inject(request);

        expect(response.statusCode).toEqual(404);
        expect(response.result).toEqual({
            statusCode: 404,
            message: `No handler for path [${request.url}] and method [${request.method && request.method.toLowerCase()}]`,
            error: 'Not Found'
        });
    });

    it('should not return a 404 when a valid endpoint is called', async () => {
        server.route(health);

        delete request.payload;
        request.method = 'GET';
        request.url = '/health';

        const response = await server.inject(request);

        expect(response.statusCode).toEqual(200);
    });
});
