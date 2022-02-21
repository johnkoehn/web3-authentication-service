const AWS = require('aws-sdk');

const getCurrentDockerImage = async () => {
    const stackName = process.argv[2];

    const cloudformation = new AWS.CloudFormation();

    const stackResult = await cloudformation.describeStacks({
        StackName: stackName,
    }).promise();

    const parameters = stackResult.Stacks[0].Parameters;
    const dockerImageTag = parameters.find(({ ParameterKey }) => ParameterKey === 'DockerImage').ParameterValue;

    return dockerImageTag;
};

getCurrentDockerImage()
    .then((result) => console.log(result))
    .catch((err) => console.log(err));