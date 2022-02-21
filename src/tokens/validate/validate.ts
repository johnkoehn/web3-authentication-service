import { Request, ResponseObject, ResponseToolkit } from '@hapi/hapi';
import Boom from '@hapi/boom';
import nacl from 'tweetnacl';
import { verify, JwtPayload } from 'jsonwebtoken';
import { TextEncoder, promisify } from 'util';
import bs58 from 'bs58';
import getSigningKey from './getSigningKey';

const encoder = new TextEncoder();

const jwtVerifyPromise: JwtVerifyPromise = promisify(verify);

const validateJwt = async (baseToken: string): Promise<JwtPayload> => {
    try {
        const jwtPayload: JwtPayload = await jwtVerifyPromise(baseToken, getSigningKey, {
            algorithms: ['RS256'],
            issuer: process.env.ISSUER
        });

        return jwtPayload;
    } catch (err: any) {
        throw Boom.unauthorized(err.message);
    }
};

const handler = async (request: Request, h: ResponseToolkit): Promise<ResponseObject> => {
    const authorizationHeader = request.headers.authorization;

    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
        throw Boom.badRequest('Pass the signed JWT in the Authorization header. Bearer <SignedJWT>');
    }

    const signedToken: string = authorizationHeader.split('Bearer ')[1];
    const baseToken: string = request.headers['base-token'];

    if (!baseToken) {
        throw Boom.badRequest('Pass the JWT in the Base-Token header');
    }

    // validate the JWT
    const jwtPayload: JwtPayload = await validateJwt(baseToken);
    const publicKey = jwtPayload.sub as string;

    // validate the signed token
    let isValid;
    try {
        isValid = nacl.sign.detached.verify(encoder.encode(baseToken), Uint8Array.from(bs58.decode(signedToken)), Uint8Array.from(bs58.decode(publicKey)));
    } catch (err: any) {
        throw Boom.unauthorized(err.message);
    }

    if (!isValid) {
        throw Boom.unauthorized();
    }

    return h
        .response({ isValid })
        .code(200);
};

export default {
    method: 'post',
    path: '/tokens/validate',
    handler
};
