/* Amplify Params - DO NOT EDIT
	API_INSTALEARNING_GRAPHQLAPIENDPOINTOUTPUT
	API_INSTALEARNING_GRAPHQLAPIIDOUTPUT
	ENV
	REGION
Amplify Params - DO NOT EDIT */

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */

const AWS = require('aws-sdk');
var docClient = new AWS.DynamoDB.DocumentClient();

const env = process.env.ENV;
const AppsyncID = process.env.API_INSTALEARNING_GRAPHQLAPIIDOUTPUT;

const UserTableName = `User-${AppsyncID}-${env}`;

exports.handler = async event => {
  console.log(`EVENT: ${JSON.stringify(event)}`);

  for (const record of event.Records) {
    await handleEvent(record);
  }

  return Promise.resolve('Successfully processed DynamoDB record');
};

const handleEvent = async ({eventID, eventName, dynamodb}) => {
  console.log(eventID);
  console.log(eventName);
  console.log('DynamoDB Record: %j', dynamodb);

  if (eventName === 'INSERT') {
    //increase number of user for followee
    await increaseUserField(dynamodb.NewImage.followeeID.S, 'nofFollowers', 1);

    //increase number of user for follower

    await increaseUserField(dynamodb.NewImage.followerID.S, 'nofFollowings', 1);
  } else if (
    eventName === 'MODIFY' &&
    !dynamodb.OldImage._deleted?.BOOL &&
    !!dynamodb.NewImage._deleted?.BOOL
  ) {
    // Decrease number of user for followee
    await increaseUserField(dynamodb.NewImage.followeeID.S, 'nofFollowers', -1);

    // Decrease number of user for follower

    await increaseUserField(
      dynamodb.NewImage.followerID.S,
      'nofFollowings',
      -1,
    );
  }
};

const increaseUserField = async (userId, field, value) => {
  const params = {
    TableName: UserTableName,
    Key: {id: userId},
    UpdateExpression: 'ADD #field :inc, #version :version_inc',
    ExpressionAttributeValues: {':inc': value, ':version_inc': 1},
    ExpressionAttributeNames: {'#field': field, '#version': '_version'},
  };

  try {
    await docClient.update(params).promise();
  } catch (e) {
    console.log(e);
  }
};
