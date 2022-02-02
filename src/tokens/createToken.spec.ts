import Chance from 'chance';
import Hapi, { Server, ServerInjectOptions } from '@hapi/hapi';
import createJwt from './createJwt';
import createToken from './createToken';

const chance = new Chance();

jest.mock('./createJwt', () => jest.fn());

describe('Create Token', () => {
    let server: Server;
    let request: ServerInjectOptions;
    let publicKey: string;
    let tokenResponse: TokenResponse;

    beforeEach(() => {
        publicKey = chance.string();
        server = new Hapi.Server();

        tokenResponse = {
            access_token: chance.string(),
            token_type: 'Bearer',
            expires_in: chance.natural()
        };
        (createJwt as jest.Mock).mockResolvedValue(tokenResponse);

        server.route(createToken);

        request = {
            method: 'POST',
            url: '/tokens',
            payload: JSON.stringify({
                publicKey
            })
        };
    });

    it('should create the token', async () => {
        await server.inject(request);

        expect(createJwt).toHaveBeenCalledWith(publicKey);
    });

    it('should return the JWT to the caller', async () => {
        const response = await server.inject(request);

        expect(response.statusCode).toEqual(200);
        expect(response.result).toEqual(tokenResponse);
    });
});
