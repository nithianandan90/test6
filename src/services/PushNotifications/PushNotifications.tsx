import {StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import {requestNotifications, RESULTS} from 'react-native-permissions';
import {useNavigation} from '@react-navigation/native';
import {useMutation, useQuery} from '@apollo/client';
import {useAuthContext} from '../../contexts/AuthContext';
import {getUser} from './queries';
import {
  GetUserQuery,
  GetUserQueryVariables,
  UpdateUserMutation,
  UpdateUserMutationVariables,
} from '../../API';
import {updateUser} from '../../screens/EditProfileScreen/queries';

// Register background handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log(
    'Message handled in the background!',
    JSON.stringify(remoteMessage, null, 2),
  );
});

const PushNotifications = () => {
  const [enabled, setEnabled] = useState(false);
  const [token, setToken] = useState('');

  const navigation = useNavigation();

  const {userId} = useAuthContext();

  const {data} = useQuery<GetUserQuery, GetUserQueryVariables>(getUser, {
    variables: {id: userId},
  });

  const [doUpdateUser] = useMutation<
    UpdateUserMutation,
    UpdateUserMutationVariables
  >(updateUser);

  useEffect(() => {
    async function requestUserPermission() {
      const authStatus = await messaging().requestPermission();

      // check OS here
      // const iosenabled =
      //   authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      //   authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      const {status} = await requestNotifications([]);
      const enabled = status === RESULTS.GRANTED;

      if (enabled) {
        console.log('Authorization status:', authStatus);
        setEnabled(true);
        await getDeviceToken();
      }
    }
    requestUserPermission();
  }, []);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Handle in foreground state
    messaging().onMessage(handleNotification);

    // Handle in background state
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Notification opened the app');
      console.log(JSON.stringify(remoteMessage, null, 2));
    });

    // Handle quit state
    messaging().getInitialNotification().then(handleNotification);
  }, [enabled]);

  useEffect(() => {
    if (!token || !data?.getUser?.id) {
      return;
    }

    // console.log('User', data.getUser);

    const user = data.getUser;

    doUpdateUser({
      variables: {
        input: {
          id: user.id,
          _version: user._version,
          fcmToken: token,
        },
      },
    });
  }, [token, data?.getUser?.id]);

  const handleNotification = (
    remoteMessage: FirebaseMessagingTypes.RemoteMessage | null,
  ) => {
    // console.log(JSON.stringify(remoteMessage, null, 2));

    if (!remoteMessage) {
      return;
    }

    if (remoteMessage.data?.postId) {
      console.log('postId', remoteMessage.data?.postId);
      navigation.navigate('Post', {id: remoteMessage.data?.postId});
    }
  };

  const getDeviceToken = async () => {
    await messaging().registerDeviceForRemoteMessages();
    const newToken = await messaging().getToken();
    setToken(newToken);
  };

  console.log('Token:', token);

  return null;
};

export default PushNotifications;

const styles = StyleSheet.create({});
