import jose from 'node-jose';
import { DateTime } from 'luxon';
import getKeys from '../util/keys/getKeys';

const TWELEVE_HOURS = 43200;

const createJwt = async (publicKey: string): Promise<TokenResponse> => {
    const keys: Jwks | PublicJwks = await getKeys(false, false);

    const keyStore: jose.JWK.KeyStore = await jose.JWK.asKeyStore(keys);
    const result: jose.JWK.RawKey[] = keyStore.all({ use: 'sig' });
    const key: jose.JWK.Key = (result[0] as unknown as jose.JWK.Key);

    const options = {
        compact: true,
        jwt: key,
        fields: {
            typ: 'jwt'
        }
    };

    // luxon returing to seconds with seconds being decimals??? https://github.com/moment/luxon/issues/565
    const now = DateTime.now().toUTC();
    const body = {
        sub: publicKey,
        exp: ((now.toSeconds() * 1000) + TWELEVE_HOURS),
        iat: (now.toSeconds() * 1000),
        iss: process.env.ISSUER
    };
    const payload = JSON.stringify(body);
    const token = await jose.JWS.createSign(options, key)
        .update(payload)
        .final();

    return {
        access_token: (token as unknown as string),
        token_type: 'Bearer',
        expires_in: TWELEVE_HOURS
    };
};

export default createJwt;
