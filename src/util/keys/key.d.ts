interface Jwk {
    kty: string
    kid: string
    use: string
    alg: string
    e: string
    n: string
    d: string
    p: string
    q: string
    dp: string
    dq: string
    qi: string
}

interface PublicJwk {
    kty: string
    kid: string
    use: string
    alg: string
    e: string
    n: string
}

interface PublicJwks {
    keys: Array<PublicJwk>
}

interface Jwks {
    keys: Array<Jwk>
}
