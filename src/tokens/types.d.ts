interface TokenRequest {
    publicKey: string
}

interface TokenResponse {
    access_token: string,
    token_type: string
    expires_in: number
}

interface JwtVerifyPromise {
    (jwt: string, getKey: function, verifyOptions: VerifyOptions): Promise<JwtPayload>
}
