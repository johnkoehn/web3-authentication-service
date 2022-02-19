import Chance = require('chance');
import { JwtHeader } from 'jsonwebtoken';
import jose from 'node-jose';
import getKeys from '../../util/keys/getKeys';
import getSigningKey from './getSigningKey';
import { producePublicKey } from '../../testUtils';

const chance = new Chance();

jest.mock('node-jose', () => {
    return {
        JWK: {
            asKeyStore: jest.fn()
        }
    };
});

jest.mock('../../util/keys/getKeys', () => jest.fn());

describe('Get Signing Key', () => {
    let callback: Function;
    let header: JwtHeader;
    let jwks: Array<PublicJwk>;
    let jwksWithToPem: Array<jose.JWK.Key>;
    let pem: String;

    let keyStore: any;

    beforeEach(() => {
        callback = jest.fn();

        jwks = [producePublicKey(), producePublicKey()];
        header = {
            typ: 'jwt',
            alg: 'RS256',
            kid: jwks[0].kid
        };

        (getKeys as jest.Mock).mockResolvedValue(jwks);

        keyStore = {
            all: jest.fn()
        };
        (jose.JWK.asKeyStore as jest.Mock).mockResolvedValue(keyStore);

        pem = chance.string();
        jwksWithToPem = jwks.map((x: any) => {
            const withPem = {
                ...x,
                toPEM: jest.fn()
            };

            withPem.toPEM.mockReturnValue(pem);

            return withPem;
        });
        keyStore.all.mockReturnValue(jwksWithToPem);
    });

    it('should get the current keyset', async () => {
        await getSigningKey(header, callback);

        expect(getKeys).toHaveBeenCalledWith(false, true);
    });

    it('should convert the keyset to a key store', async () => {
        await getSigningKey(header, callback);

        expect(jose.JWK.asKeyStore).toHaveBeenCalledWith(jwks);
    });

    it('should get the keys', async () => {
        await getSigningKey(header, callback);

        expect(keyStore.all).toHaveBeenCalledWith({ use: 'sig' });
    });

    it('should get the key with match kid and return it in the call back', async () => {
        await getSigningKey(header, callback);

        expect(jwksWithToPem[0].toPEM).toHaveBeenCalledWith(false);
        expect(jwksWithToPem[1].toPEM).not.toHaveBeenCalled();
        expect(callback).toHaveBeenCalledWith(null, pem);
        expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should return an error if it could not find the key', async () => {
        header = {
            typ: 'jwt',
            alg: 'RS256',
            kid: chance.guid()
        };

        await getSigningKey(header, callback);

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(new Error('Failed to find kid'), null);
    });
});
