const AWS = require('aws-sdk');
var docClient = new AWS.DynamoDB.DocumentClient();

const env = process.env.ENV;
const AppsyncID = process.env.API_INSTALEARNING_GRAPHQLAPIIDOUTPUT;

const UserFollowTableName = `UserFollow-${AppsyncID}-${env}`;
const UserFeedPostTableName = `UserFeedPost-${AppsyncID}-${env}`;
const PostTableName = `Post-${AppsyncID}-${env}`;

const handle = async record => {
  // handle the post event
  if (record.eventName !== 'INSERT') {
    return;
  }

  const userId = record.dynamodb.NewImage.userID.S;

  // get all the followers of the post owner
  const followers = await getFollowers(userId);

  // console.log(followers);

  await Promise.all(
    followers.map(follower =>
      pushPostToUserFeed(record.dynamodb.NewImage, follower.followerID),
    ),
  );

  // push the new post to their feeds
};

const pushPostToUserFeed = async (postImage, userID) => {
  const date = new Date();
  console.log('lambda function triggered');
  const timestamp = date.getTime();
  const dateStr = date.toISOString();

  const Item = {
    id: `${userID}::${postImage.id.S}`,

    postCreatedAt: postImage.createdAt.S,
    postID: postImage.id.S,
    postOwnerID: postImage.userID.S,
    userID,

    owner: userID,

    createdAt: dateStr,
    updatedAt: dateStr,
    _lastChangedAt: timestamp,
    _version: 1,
    __typename: 'UserFeedPost',
  };

  console.log(Item);

  const params = {
    TableName: UserFeedPostTableName,
    Item,
  };

  try {
    await docClient.put(params).promise();
  } catch (e) {
    console.log(e);
  }
};

const getFollowers = async userId => {
  const params = {
    TableName: UserFollowTableName,
    IndexName: 'byFollowee',
    KeyConditionExpression: 'followeeID = :followeeID',
    FilterExpression: 'attribute_not_exists(#deleted)',
    ExpressionAttributeValues: {
      ':followeeID': userId,
    },
    ExpressionAttributeNames: {
      '#deleted': '_deleted',
    },
  };

  console.log('userID', userId);

  await getPosts(userId);

  console.log('getposts ran');
  console.log('params', params);

  try {
    const result = await docClient.query(params).promise();
    console.log('results', result);
    return result.Items;
  } catch (e) {
    console.log(e);
  }
};

const getPosts = async userID => {
  // query dynamodb
  const params = {
    TableName: PostTableName,
    IndexName: 'byUser',
    KeyConditionExpression: 'userID = :userID',
    FilterExpression: 'attribute_not_exists(#deleted)',
    ExpressionAttributeValues: {
      ':userID': userID,
    },
    ExpressionAttributeNames: {
      '#deleted': '_deleted',
    },
  };

  console.log('get all posts reached 2', params);
  try {
    console.log('get all posts reached 3');
    const result = await docClient.query(params).promise();

    console.log('get all posts reached 4');
    console.log('result', result);
  } catch (e) {
    console.log('error');
    console.log(e);
    return [];
  }
};

module.exports = handle;
