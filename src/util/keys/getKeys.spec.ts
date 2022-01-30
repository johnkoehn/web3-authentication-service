import jose from 'node-jose';
import readSecrets from '../aws/readSecrets';
import { produceKeySet, producePublicKeySet } from '../../testUtils';
import getKeys from './getKeys';

jest.mock('../aws/readSecrets', () => jest.fn());
jest.mock('node-jose', () => {
    return {
        JWK: {
            asKeyStore: jest.fn()
        }
    };
});

describe('Get Keys', () => {
    let keySet: Jwks;
    let publicKeySet: PublicJwks;
    let mockToJson: jest.Mock;

    beforeEach(() => {
        keySet = produceKeySet();
        publicKeySet = producePublicKeySet();

        (readSecrets as jest.Mock).mockResolvedValue(keySet);

        mockToJson = jest.fn();
        (jose.JWK.asKeyStore as jest.Mock).mockResolvedValue({
            toJSON: mockToJson
        });

        mockToJson.mockReturnValue(publicKeySet);
    });

    it('should read the secrets and convert the key set to the public set and only refresh when refresh true', async () => {
        await getKeys(false, true);

        expect(readSecrets).toHaveBeenCalledTimes(1);
        expect(jose.JWK.asKeyStore).toHaveBeenCalledWith(keySet);
        expect(mockToJson).toHaveBeenCalledWith(false);

        await getKeys(false, true);
        expect(readSecrets).toHaveBeenCalledTimes(1);
        expect(jose.JWK.asKeyStore).toHaveBeenCalledTimes(1);
        expect(mockToJson).toHaveBeenCalledTimes(1);

        await getKeys(true, true);
        expect(readSecrets).toHaveBeenCalledTimes(2);
        expect(jose.JWK.asKeyStore).toHaveBeenCalledTimes(2);
        expect(mockToJson).toHaveBeenCalledTimes(2);
    });

    it('should return the full jwks when getPublicSet false', async () => {
        const result = await getKeys(true, false);

        expect(result).toEqual(keySet);
    });

    it('should return the public jwks when getPublicSet true', async () => {
        const result = await getKeys(true, true);

        expect(result).toEqual(publicKeySet);
    });
});
