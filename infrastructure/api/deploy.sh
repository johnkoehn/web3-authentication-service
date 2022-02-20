#!/bin/bash
set -e

RED='\033[0;31m'
NO_COLOR='\033[0m'

HORIZONTAL_LINE="============================================================"

case "$1" in
    dev)
        ENVIRONMENT=dev
        ;;
    prod)
        ENVIRONMENT=prod
        ;;
    *)
        printf "${RED}USAGE: $0 {dev|prod}${NO_COLOR}\n"
        exit 1
esac

echo -e "\n$HORIZONTAL_LINE"

SERVICE_NAME=web3-authentication-service

echo "Connecting to ECR"
GIT_COMMIT="$(git rev-parse HEAD)"
DOCKER_IMAGE_TAG="web3-authentication-service:${GIT_COMMIT}"
ECR_URL="$(aws ecr describe-repositories --repository-names ${SERVICE_NAME} --query 'repositories[*].repositoryUri' --output text)"
aws ecr get-login-password | docker login --username AWS --password-stdin ${ECR_URL}

echo "Copying contents of .env.${ENVIRONMENT} into .env to build the docker correctly"
cp "./infrastructure/api/.env.${ENVIRONMENT}" .env

echo "Building the docker image"
docker buildx build . -t ${DOCKER_IMAGE_TAG} --platform linux/amd64

echo "Pushing the docker image to ECR"
AWS_DOCKER_IMAGE="${ECR_URL}:${GIT_COMMIT}"
docker tag ${DOCKER_IMAGE_TAG} ${AWS_DOCKER_IMAGE}
docker push ${AWS_DOCKER_IMAGE}

echo "Copying contents of .env.local into .env now that the build completed"
cp "./infrastructure/api/.env.local" .env

echo "Updating infrastructure and server"
aws cloudformation deploy \
    --stack-name=${SERVICE_NAME} \
    --template-file=./infrastructure/api/cloudformation.yaml \
    --capabilities CAPABILITY_NAMED_IAM \
    --no-fail-on-empty-changeset \
    --parameter-overrides $(cat "./infrastructure/api/parameters.${ENVIRONMENT}.properties") DockerImage=${AWS_DOCKER_IMAGE} ServiceName=${SERVICE_NAME}
