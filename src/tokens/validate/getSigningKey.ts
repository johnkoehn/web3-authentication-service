import { JwtHeader } from 'jsonwebtoken';
import jose from 'node-jose';
import getKeys from '../../util/keys/getKeys';

const getSigningKey = async (header: JwtHeader, callback: Function): Promise<void> => {
    const jwks: PublicJwks = await getKeys(false, true);
    const keyStore: jose.JWK.KeyStore = await jose.JWK.asKeyStore(jwks);

    const key = (keyStore.all({ use: 'sig' }).find((x) => x.kid === header.kid) as unknown as jose.JWK.Key);

    if (!key) {
        const error = new Error('Failed to find kid');
        callback(error, null);
        return;
    }

    callback(null, key.toPEM(false));
};

export default getSigningKey;
