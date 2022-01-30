import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const readSecrets = async (): Promise<Jwks> => {
    const client: SecretsManagerClient = new SecretsManagerClient({});

    const getSecretValue: GetSecretValueCommand = new GetSecretValueCommand({
        SecretId: process.env.JWKS_SECRETS_MANAGER
    });

    const response = await client.send(getSecretValue);
    const secretString = response.SecretString as string;
    const value: Jwks = JSON.parse(secretString);

    return value;
};

export default readSecrets;
