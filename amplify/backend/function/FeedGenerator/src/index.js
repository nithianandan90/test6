/* Amplify Params - DO NOT EDIT
	API_INSTALEARNING_GRAPHQLAPIENDPOINTOUTPUT
	API_INSTALEARNING_GRAPHQLAPIIDOUTPUT
	ENV
	REGION
Amplify Params - DO NOT EDIT */

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */

const postEventHandler = require('./PostEventHandler');
const userFollowEventHandler = require('./UserFollowEventHandler');

exports.handler = async event => {
  console.log(`EVENT: ${JSON.stringify(event)}`);
  for (const record of event.Records) {
    await handleRecord(record);
  }
  return Promise.resolve('Successfully processed DynamoDB record');
};

const handleRecord = async record => {
  console.log(record.eventID);
  console.log(record.eventName);
  console.log('DynamoDB Record: %j', record.dynamodb);
  console.log('record', record);
  if (record.eventSourceARN.includes('Post')) {
    // handle post events
    console.log('post event');
    await postEventHandler(record);
  } else if (record.eventSourceARN.includes('UserFollow')) {
    console.log('user follow event');

    // handle follow event
    await userFollowEventHandler(record);
  } else {
    console.error('Event not handled');
  }
};
