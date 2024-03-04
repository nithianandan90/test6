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
const {sendNotification} = require('./firebase');
var docClient = new AWS.DynamoDB.DocumentClient();

const env = process.env.ENV;
const AppsyncID = process.env.API_INSTALEARNING_GRAPHQLAPIIDOUTPUT;

const UserTableName = `User-${AppsyncID}-${env}`;

const NOTIFICATION_TEXT = {
  NEW_FOLLOWER: 'started following you',
  NEW_LIKE: 'liked your post',
  NEW_COMMENT: 'wrote a new comment',
};

const NOTIFICATION_TITLE = {
  NEW_FOLLOWER: 'New follower!',
  NEW_LIKE: 'Your post got a new like!',
  NEW_COMMENT: 'New comment',
};

exports.handler = async event => {
  console.log(`EVENT: ${JSON.stringify(event)}`);

  await Promise.all(event.Records.map(handleRecord));

  return Promise.resolve('Successfully processed DynamoDB record');
};

const handleRecord = async ({eventName, dynamodb}) => {
  console.log(eventName);
  console.log('DynamoDB Record: %j', dynamodb);

  if (eventName !== 'INSERT') {
    return;
  }

  // get the User from database
  const userId = dynamodb.NewImage.userId.S;

  const type = dynamodb.NewImage.type.S;

  const actorId = dynamodb.NewImage.actorId.S;

  const user = await getUser(userId);
  if (!user?.fcmToken) {
    console.log("Couldn't find user or user doesnt have fcm token");
    return;
  }
  // get the User fcm token from db
  console.log('Sending notification', user.fcmToken);

  const notification = await createNotification(type, actorId);

  const data = {};
  if (dynamodb.NewImage.notificationPostId?.S) {
    data.postId = dynamodb.NewImage.notificationPostId?.S;
  }

  // send the notification using fcm token
  await sendNotification(notification, data, user.fcmToken);
};

const getUser = async id => {
  const params = {
    TableName: UserTableName,
    Key: {id},
  };

  try {
    const response = await docClient.get(params).promise();
    return response?.Item;
  } catch (e) {
    console.log(e);
    return null;
  }
};

const createNotification = async (type, actorId) => {
  const actor = await getUser(actorId);
  return {
    title: NOTIFICATION_TITLE[type],
    body: `${actor.name} ${NOTIFICATION_TEXT[type]}`,
  };
};
