import Chance from 'chance';
import tokenRequestSchema from './tokenRequestSchema';

const chance = new Chance();

describe('Token Request Schema', () => {
    let tokenRequest: any;

    beforeEach(() => {
        tokenRequest = {
            publicKey: chance.string()
        };
    });

    it('should not error if the public key is a string', async () => {
        const result = await tokenRequestSchema.validateAsync(tokenRequest);

        expect(result.errors).toBeUndefined();
    });

    it('should error if unknown fields are present', async () => {
        tokenRequest.foo = chance.string();

        await expect(tokenRequestSchema.validateAsync(tokenRequest)).rejects.toBeTruthy();
    });

    it('should error if public key is a non string type', async () => {
        tokenRequest.publicKey = chance.bool();

        await expect(tokenRequestSchema.validateAsync(tokenRequest)).rejects.toBeTruthy();
    });

    it('should error if public key is empty', async () => {
        tokenRequest.publicKey = '';

        await expect(tokenRequestSchema.validateAsync(tokenRequest)).rejects.toBeTruthy();
    });
});
