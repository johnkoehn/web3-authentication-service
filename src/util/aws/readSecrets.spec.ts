import Chance from 'chance';
import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { produceKeySet } from '../../testUtils';
import readSecrets from './readSecrets';

const chance = new Chance();

jest.mock('@aws-sdk/client-secrets-manager', () => {
    return {
        SecretsManagerClient: jest.fn(),
        GetSecretValueCommand: jest.fn()
    };
});

describe('Read Secrets', () => {
    let mockClient: any;
    let getSecretCommand: any;
    let keySet: Jwks;

    beforeEach(() => {
        mockClient = {
            send: jest.fn()
        };

        (SecretsManagerClient as jest.Mock).mockImplementation(() => {
            return mockClient;
        });

        getSecretCommand = {
            [chance.word()]: chance.string()
        };
        (GetSecretValueCommand as jest.Mock).mockReturnValue(getSecretCommand);

        process.env.JWKS_SECRETS_MANAGER = chance.string();

        keySet = produceKeySet();

        mockClient.send.mockResolvedValue({
            SecretString: JSON.stringify(keySet)
        });
    });

    it('should create the command to get the secrets', async () => {
        await readSecrets();

        expect(GetSecretValueCommand).toHaveBeenCalledWith({
            SecretId: process.env.JWKS_SECRETS_MANAGER
        });
    });

    it('should send the command', async () => {
        await readSecrets();

        expect(mockClient.send).toHaveBeenLastCalledWith(getSecretCommand);
    });

    it('should return the Jwks', async () => {
        const result = await readSecrets();

        expect(result).toEqual(keySet);
    });
});
