import AWS from 'aws-sdk';
import { nanoid } from 'nanoid';

// this makes us assume the same AWS Role when running the server locally
const assumeTaskTole = async () => {
    if (process.env.ENVIRONMENT === 'local') {
        console.log('Local Environment, assuming task definition role');

        const sts = new AWS.STS();
        const result = await sts.assumeRole({
            RoleArn: process.env.TASK_DEFINITION_ROLE_ARN || '',
            RoleSessionName: `type-script-${nanoid()}`
        }).promise();

        AWS.config.update({
            accessKeyId: result.Credentials?.AccessKeyId,
            secretAccessKey: result.Credentials?.SecretAccessKey,
            sessionToken: result.Credentials?.SessionToken
        });
    }
};

export default assumeTaskTole;
