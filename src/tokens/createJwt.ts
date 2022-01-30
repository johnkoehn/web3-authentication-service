import jose from 'node-jose';
import { DateTime } from 'luxon';
import getKeys from '../util/keys/getKeys';

const createJwt = async (publicKey: string) => {
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

    const now = DateTime.now();
    const body = {
        sub: publicKey,
        exp: now.plus({ hours: 12 }).toSeconds(),
        iat: now.toSeconds(),
        iss: 'https://exonerated.io/'
    };
    const payload = JSON.stringify(body);
    const token = await jose.JWS.createSign(options, key)
        .update(payload)
        .final();

    return {
        access_token: token,
        token_type: 'Bearer',
        expires_in: 43200 // 12 hours
    };
};

export default createJwt;
