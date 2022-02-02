import jose from 'node-jose';
import readSecrets from '../aws/readSecrets';

let keys: Jwks;
let publicKeys: PublicJwks;
const getKeys = async (refresh: boolean, getPublicSet: boolean = true): Promise<Jwks | PublicJwks> => {
    if (keys === undefined || refresh) {
        keys = await readSecrets();
        publicKeys = ((await jose.JWK.asKeyStore(keys)).toJSON(false) as PublicJwks);
    }

    return getPublicSet ? publicKeys : keys;
};

export default getKeys;
