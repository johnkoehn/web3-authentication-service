import Chance from 'chance';
import jose from 'node-jose';
import mockDate from 'mockdate';
import getKeys from '../util/keys/getKeys';
import { produceKeySet, createRandomObject } from '../testUtils';
import createJwt from './createJwt';

const chance = new Chance();

jest.mock('node-jose', () => {
    return {
        JWK: {
            asKeyStore: jest.fn()
        },
        JWS: {
            createSign: jest.fn()
        }
    };
});

jest.mock('../util/keys/getKeys', () => jest.fn());

const MOCKED_TIME = 1643562274;
const TWELEVE_HOURS = 43200;
mockDate.set(MOCKED_TIME);

describe('Create JWT', () => {
    let keySet: Jwks;
    let publicKey: string;
    let keyStore: any;
    let keyOne: any;
    let keyTwo: any;
    let mockUpdate: jest.Mock;
    let mockFinal: jest.Mock;
    let token: string;

    beforeEach(() => {
        keySet = produceKeySet();
        (getKeys as jest.Mock).mockResolvedValue(keySet);

        keyStore = {
            all: jest.fn()
        };
        (jose.JWK.asKeyStore as jest.Mock).mockResolvedValue(keyStore);

        keyOne = createRandomObject();
        keyTwo = createRandomObject();
        keyStore.all.mockReturnValue([keyOne, keyTwo]);

        publicKey = chance.string();

        token = chance.string();
        mockUpdate = jest.fn();
        mockFinal = jest.fn();
        mockFinal.mockResolvedValue(token);
        mockUpdate.mockReturnValue({
            final: mockFinal
        });
        (jose.JWS.createSign as jest.Mock).mockReturnValue({
            update: mockUpdate
        });

        process.env.ISSUER = chance.url();
    });

    it('should call to the JWKS keys', async () => {
        await createJwt(publicKey);

        expect(getKeys).toHaveBeenCalledWith(false, false);
    });

    it('should create the key store using the jwks', async () => {
        await createJwt(publicKey);

        expect(jose.JWK.asKeyStore).toHaveBeenCalledWith(keySet);
    });

    it('shuld get the keys in the jose key store', async () => {
        await createJwt(publicKey);

        expect(keyStore.all).toHaveBeenCalledWith({ use: 'sig' });
    });

    it('should create the signed JWT with the first JWK in the set', async () => {
        const expectedPayload = JSON.stringify({
            sub: publicKey,
            exp: MOCKED_TIME + TWELEVE_HOURS,
            iat: MOCKED_TIME,
            iss: process.env.ISSUER
        });

        await createJwt(publicKey);

        expect(jose.JWS.createSign).toHaveBeenCalledWith({
            compact: true,
            jwt: keyOne,
            fields: {
                typ: 'jwt'
            }
        }, keyOne);
        expect(mockUpdate).toHaveBeenCalledWith(expectedPayload);
        expect(mockFinal).toHaveBeenCalled();
    });

    it('should return the token response', async () => {
        const response = await createJwt(publicKey);

        expect(response).toEqual({
            access_token: token,
            token_type: 'Bearer',
            expires_in: TWELEVE_HOURS
        });
    });
});
