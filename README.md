Steps modelled from [serverless-stack.com](http://serverless-stack.com).

## Setup New Serverless Service
#### In a new directory:
Create new serverless service
```
$ serverless create --template aws-nodejs
```
Initialize npm for building the project
```
$ npm init -y
```
Install aws tools and uuid (for security)
```
$ npm install aws-sdk --save-dev && npm install uuid --save
```
To allow use of ES6/7, we will need build tools
```
$ npm install --save-dev \
    babel-core \
    babel-loader \
    babel-plugin-transform-runtime \
    babel-preset-react-app \
    serverless-webpack \
    glob \
    webpack \
    webpack-node-externals \
    && npm install --save babel-runtime
```
Now your packages are set up.

#### Configure webpack and serverless
Create a file: `webpack.config.js` with the following:
```javascript
var glob = require('glob');
var path = require('path');
var nodeExternals = require('webpack-node-externals');

process.env.NODE_ENV = 'production';

module.exports = {
  // Use all js files in service root (except
  // the webpack config) as an entry
  entry: globEntries('!(webpack.config).js'),
  target: 'node',
  // Since 'aws-sdk' is not compatible with webpack,
  // we exclude all node dependencies
  externals: [nodeExternals()],
  // Run babel on all .js files and skip those in node_modules
  module: {
    loaders: [{
      test: /\.js$/,
      loaders: ['babel'],
      include: __dirname,
      exclude: /node_modules/,
    }]
  },
  // For multiple APIs we are going to create a js file, we need this output block
  output: {
    libraryTarget: 'commonjs',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js'
  },
};

function globEntries(globPath) {
  var files = glob.sync(globPath);
  var entries = {};

  for (var i = 0; i < files.length; i++) {
    var entry = files[i];
    entries[path.basename(entry, path.extname(entry))] = './' + entry;
  }

  return entries;
}
```

Edit serverless.yml:
```yaml
service: [SERVICE_NAME] # e.g. user-service

plugins:
  - serverless-webpack

custom:
  webpackIncludeModules: true

provider:
  name: aws
  runtime: nodejs6.10
  stage: prod
  region: us-east-1

  iamRoleStatements:
    - Effect: Allow
      Action:
        - [LIST OF PERMISSIONS] # e.g. dynamodb:Query
      Resource: [ARN WITH AWS SERVICE] # e.g. "arn:aws:dynamodb:us-east-1:*:*"
```

#### Create functions
Here is the basic template for a function:
  ```javascript
  import { success, failure } from './libs/response-lib';

  export async function main(event, context, callback) {
    const data = JSON.parse(event.body);
    const params = {
      // parameters for AWS service (e.g. TableName: '')
    };

    try {
      const result = await dynamoDbLib.call('put', params);
      callback(null, success(params.Item));
    }
    catch(e) {
      callback(null, failure({status: false}));
    }
  };
  ```

  And a function configuration will need to be added to the `serverless.yml`
  ```yaml
  functions:
  # Defines an HTTP API endpoint that calls the main function in [FUNCTION NAME].js
  # - path: url path
  # - method: type of request
  # - cors: enabled CORS (Cross-Origin Resource Sharing) for browser cross
  #     domain api call
  # - authorizer: authenticate the api via Cognito User Pool. Update the 'arn'
  #     with your own User Pool ARN
  [FUNCTION NAME]:
    handler: [FUNCTION NAME].main
    events:
      - http:
          path: [URL PATH] # e.g. notes
          method: [METHOD] # post, put, get, etc.
          cors: true
          # needed to attach things to user
          authorizer:
            arn: [YOUR_USER_POOL_ARN] # current: arn:aws:cognito-idp:us-east-1:323575399341:userpool/us-east-1_EalHLGVGQ
```

### curl
`$ curl https://93sr3ovj3d.execute-api.us-east-1.amazonaws.com/prod/user/create`
