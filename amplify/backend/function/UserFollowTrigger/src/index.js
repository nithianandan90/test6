/* Amplify Params - DO NOT EDIT
	API_INSTALEARNING_GRAPHQLAPIENDPOINTOUTPUT
	API_INSTALEARNING_GRAPHQLAPIIDOUTPUT
	ENV
	REGION
Amplify Params - DO NOT EDIT */

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */

const {v4: uuidv4} = require('uuid');
const AWS = require('aws-sdk');
var docClient = new AWS.DynamoDB.DocumentClient();

const env = process.env.ENV;
const AppsyncID = process.env.API_INSTALEARNING_GRAPHQLAPIIDOUTPUT;

const UserTableName = `User-${AppsyncID}-${env}`;
const NotificationTableName = `Notification-${AppsyncID}-${env}`;

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

  const followeeID = dynamodb.NewImage.followeeID.S;
  const followerID = dynamodb.NewImage.followerID.S;
  const owner = dynamodb.NewImage.owner.S;

  if (eventName === 'INSERT') {
    //increase number of user for followee
    await increaseUserField(followeeID, 'nofFollowers', 1);

    //increase number of user for follower

    await increaseUserField(followerID, 'nofFollowings', 1);

    // create follow notification
    await createFollowNotification(followerID, followeeID, owner);
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

const createFollowNotification = async (userId, actorId, owner) => {
  const date = new Date();
  const dateStr = date.toISOString();
  const timestamp = date.getTime();

  const Item = {
    id: uuidv4(),
    actorId,
    createdAt: dateStr,
    updatedAt: dateStr,
    owner,
    readAt: 0,
    type: 'NEW_FOLLOWER',
    userId,
    _lastChangedAt: timestamp,
    _version: 1,
    __typename: 'Notification',
  };

  console.log('item', Item);

  const params = {
    TableName: NotificationTableName,
    Item,
  };
  try {
    await docClient.put(params).promise();
  } catch (e) {
    console.log(e);
  }
};
