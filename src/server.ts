import dotenv from 'dotenv';
import Hapi, { Request, ResponseToolkit } from '@hapi/hapi';
import joi from 'joi';
import { setTimeout } from 'timers/promises';
import health from './health';
import catchAll from './catchAll';
import assumeTaskRole from './util/aws/assumeTaskRole';
import createToken from './tokens/createToken';
import getKeys from './util/keys/getKeys';
import validate from './tokens/validate/validate';

dotenv.config();

const handleError = (request: Request, h: ResponseToolkit, err: any) => {
    throw err;
};

const init = async () => {
    await assumeTaskRole();

    if (process.env.ENVIRONMENT !== 'local') {
        await getKeys(false, true);
    }

    const server = Hapi.server({
        port: 8000,
        host: '0.0.0.0',
        routes: {
            cors: true,
            validate: {
                failAction: handleError,
                options: {
                    abortEarly: false
                }
            }
        }
    });

    server.validator(joi);

    server.route(createToken);
    server.route(validate);
    server.route(health);
    server.route(catchAll);

    server.ext({
        type: 'onPreResponse',
        method: (request, h) => {
            const response = request.response as any;
            if (response.isBoom && response.isServer) {
                console.log(`ALERT: Server Error: ${response.stack}`);
            }

            return h.continue;
        }
    });

    await server.start();

    process.on('SIGTERM', async () => {
        console.log('Stopping the server...');
        const ONE_MIN_FIFTY_FIVE_SEC_IN_MS = 115000; // 2 mins is the cap
        await setTimeout(ONE_MIN_FIFTY_FIVE_SEC_IN_MS);

        console.log('Done waiting for misc. requests to finish');

        server.stop({ timeout: 50000 }).then(() => {
            console.log('Hapi server stopped');
            process.exit(0);
        }).catch((err) => {
            console.log(`Attempt to stop server failed!! ${err.message}`);
            process.exit(1);
        });
    });
};

init()
    .then(() => console.log('Server started on port 8000'))
    .catch((err) => console.log(err));
