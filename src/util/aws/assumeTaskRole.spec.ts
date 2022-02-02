import Chance from 'chance';
import { STS, config } from 'aws-sdk';
import { nanoid } from 'nanoid';
import assumeTaskTole from './assumeTaskRole';

const chance = new Chance();

jest.mock('aws-sdk', () => {
    return {
        STS: jest.fn(),
        config: {
            update: jest.fn()
        }
    };
});

jest.mock('nanoid', () => {
    return {
        nanoid: jest.fn()
    };
});

const mockAssumeRole = jest.fn();

describe('Assume Task Role', () => {
    let id: any;
    let credentials: any;

    beforeEach(() => {
        process.env.ENVIRONMENT = 'local';
        process.env.TASK_DEFINITION_ROLE_ARN = chance.string();

        id = chance.guid();
        (nanoid as unknown as jest.Mock).mockReturnValue(id);

        credentials = {
            AccessKeyId: chance.string(),
            SecretAccessKey: chance.string(),
            SessionToken: chance.string()
        };

        (STS as unknown as jest.Mock).mockImplementation(() => {
            return {
                assumeRole: mockAssumeRole
            };
        });

        mockAssumeRole.mockReturnValue({
            promise: async () => {
                return {
                    Credentials: credentials
                };
            }
        });
    });

    it('should call assume role', async () => {
        await assumeTaskTole();

        expect(nanoid).toHaveBeenCalledTimes(1);
        expect(mockAssumeRole).toHaveBeenCalledWith({
            RoleArn: process.env.TASK_DEFINITION_ROLE_ARN,
            RoleSessionName: `type-script-${id}`
        });
    });

    it('should update the aws config with the credentials', async () => {
        await assumeTaskTole();

        expect(config.update).toHaveBeenCalledWith({
            accessKeyId: credentials.AccessKeyId,
            secretAccessKey: credentials.SecretAccessKey,
            sessionToken: credentials.SessionToken
        });
    });

    it('should do nothing if the environment is not local', async () => {
        process.env.ENVIRONMENT = chance.string();

        await assumeTaskTole();

        expect(nanoid).not.toHaveBeenCalled();
        expect(mockAssumeRole).not.toHaveBeenCalled();
        expect(config.update).not.toHaveBeenCalled();
    });
});
