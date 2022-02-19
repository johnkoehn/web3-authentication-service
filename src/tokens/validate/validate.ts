import { Request, ResponseObject, ResponseToolkit } from '@hapi/hapi';
import Boom from '@hapi/boom';
import nacl from 'tweetnacl';
import { verify, JwtPayload } from 'jsonwebtoken';
import { TextEncoder, promisify } from 'util';
import bs58 from 'bs58';
import getSigningKey from './getSigningKey';

const encoder = new TextEncoder();

let jwtVerifyPromise: JwtVerifyPromise;
const handler = async (request: Request, h: ResponseToolkit): Promise<ResponseObject> => {
    if (!jwtVerifyPromise) {
        jwtVerifyPromise = promisify(verify);
    }

    const authorizationHeader = request.headers.authorization;

    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
        throw Boom.badRequest('Pass the signed JWT in the Authorization header. Bearer <SignedJWT>');
    }

    const signedToken: string = authorizationHeader.split('Bearer ')[1];
    const baseToken: string = request.headers['base-token'];
    const publicKey: string = request.headers['public-key'];

    if (!baseToken) {
        throw Boom.badRequest('Pass the JWT in the Base-Token header');
    }

    if (!publicKey) {
        throw Boom.badRequest('Pass the public key in the Public-Key header');
    }

    // validate the JWT
    try {
        const jwtPayload: JwtPayload = await jwtVerifyPromise(baseToken, getSigningKey, {
            algorithms: ['RS256'],
            issuer: process.env.ISSUER
        });

        if (jwtPayload.sub !== publicKey) {
            throw new Error('Subject does not matched the public key');
        }
    } catch (err: any) {
        throw Boom.badRequest(err.message);
    }

    // validate the signed token
    let isValid;
    try {
        isValid = nacl.sign.detached.verify(encoder.encode(baseToken), Uint8Array.from(bs58.decode(signedToken)), Uint8Array.from(bs58.decode(publicKey)));
    } catch (err) {
        isValid = false;
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
