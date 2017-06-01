// import { AmazonCognitoIdentity as Cognito } from 'amazon-cognito-identity-js'
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');

// may need a refactor to pass config in one of these days...
const config = {
    UserPoolId: 'us-east-1_EalHLGVGQ',
    ClientId: '2fa0nriojtuv84oj3dm4oa17qo'
};

const userPool = new AmazonCognitoIdentity.CognitoUserPool(config);

export function call(action, attributes, params) {
    return new Promise(_call);

    function _call (resolve, reject) {
        let attributeList = [];
        console.log(attributes);
        attributes.forEach((attribute) => {
            console.log(attribute);
            attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute(attribute));
        });

        return userPool[action](params[0], params[1], attributeList, null, (err, result) => {
            return err ? reject(err) : resolve(result);
        });
    }
}
