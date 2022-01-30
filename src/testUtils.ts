import Chance from 'chance';

const chance = new Chance();

export const produceKey = (): Jwk => {
    return {
        kty: chance.string(),
        kid: chance.string(),
        use: chance.string(),
        alg: chance.string(),
        e: chance.string(),
        n: chance.string(),
        d: chance.string(),
        p: chance.string(),
        q: chance.string(),
        dp: chance.string(),
        dq: chance.string(),
        qi: chance.string()
    };
};

export const produceKeySet = (): Jwks => {
    return {
        keys: [produceKey(), produceKey()]
    };
};

export const producePublicKey = (): PublicJwk => {
    return {
        kty: chance.string(),
        kid: chance.string(),
        use: chance.string(),
        alg: chance.string(),
        e: chance.string(),
        n: chance.string()
    };
};

export const producePublicKeySet = (): PublicJwks => {
    return {
        keys: [producePublicKey(), producePublicKey()]
    };
};
