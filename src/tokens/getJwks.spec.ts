import Hapi, { Server, ServerInjectOptions } from '@hapi/hapi';
import getKeys from '../util/keys/getKeys';
import { producePublicKeySet } from '../testUtils';
import getJwks from './getJwks';

jest.mock('../util/keys/getKeys', () => jest.fn());

describe('Get Jwks', () => {
    let server: Server;
    let request: ServerInjectOptions;
    let keySet: PublicJwks;

    beforeEach(() => {
        server = new Hapi.Server();

        keySet = producePublicKeySet();
        (getKeys as jest.Mock).mockResolvedValue(keySet);

        server.route(getJwks);

        request = {
            method: 'GET',
            url: '/.well-known/jwks.json'
        };
    });

    it('should call to get the keys with no refresh and only get the public JWKS', async () => {
        await server.inject(request);

        expect(getKeys).toHaveBeenCalledWith(false, true);
    });

    it('should return the key set', async () => {
        const response = await server.inject(request);

        expect(response.statusCode).toEqual(200);
        expect(response.result).toEqual(keySet);
    });
});
