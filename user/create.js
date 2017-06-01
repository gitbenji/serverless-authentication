// serverless webpack invoke --function create --path create-event.json

import uuid from 'uuid';
import * as cognitoDbLib from './libs/cognito-lib';
import { success, failure } from './libs/response-lib';

export async function main(event, context, callback) {
    // TODO: insert a uuid
    const data = JSON.parse(event.body); // user
    console.log('data', data);
    const dataEmail = {
        Name: 'email',
        Value: data.email
    };

    try {
        const result = await cognitoDbLib.call('signUp', [dataEmail], [data.username, data.password])
        console.log(result);
        callback(null, success({
            "username": data.username,
            "email": data.email,
            "bio": null,
            "image": null,
            "token": result.user.pool.client.config.credentials.sessionToken,
            "createdAt": Date.now().toString(),
            "updatedAt": Date.now().toString()
        }));
    }
    catch(e) {
        console.log('oops');
        callback(null, failure({error: e}));
    }
};
