const {initializeApp, cert} = require('firebase-admin/app');

const {getMessaging} = require('firebase-admin/messaging');

const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT);

initializeApp({credential: cert(serviceAccount)});

exports.sendNotification = async (notification, data = {}, fcmToken) => {
  const message = {
    token: fcmToken,
    notification,
    data,
  };

  await getMessaging().send(message);
};
