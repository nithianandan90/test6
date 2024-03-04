import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useEffect} from 'react';
import {updateNotification, userNotifications} from './queries';
import {useMutation, useQuery} from '@apollo/client';
import {useAuthContext} from '../../contexts/AuthContext';
import {
  ModelSortDirection,
  UpdateNotificationMutation,
  UpdateNotificationMutationVariables,
  UserNotificationsQuery,
  UserNotificationsQueryVariables,
} from '../../API';
import ApiErrorMessage from '../../components/ApiErrorMessage';
import NotificationListItem from '../../components/NotificationListItem';

const NotificationsScreen = () => {
  const {userId} = useAuthContext();

  const {data, loading, error, refetch} = useQuery<
    UserNotificationsQuery,
    UserNotificationsQueryVariables
  >(userNotifications, {
    variables: {userId, sortDirection: ModelSortDirection.DESC},
  });

  const [doUpdateNotification] = useMutation<
    UpdateNotificationMutation,
    UpdateNotificationMutationVariables
  >(updateNotification);

  const notifications = (data?.userNotifications?.items || []).filter(
    item => !item?._deleted,
  );

  useEffect(() => {
    const readNotification = async () => {
      const unreadNotifications = notifications.filter(n => !n?.readAt);
      const first = unreadNotifications[0];

      await Promise.all(
        unreadNotifications.map(
          notification =>
            notification &&
            doUpdateNotification({
              variables: {
                input: {
                  id: notification.id,
                  _version: notification._version,
                  readAt: new Date().getTime(),
                },
              },
            }),
        ),
      );
    };
    readNotification();
  }, [notifications]);

  if (loading) {
    return <ActivityIndicator />;
  }

  if (error) {
    return (
      <ApiErrorMessage
        title="Error fetching the User"
        message={error?.message}
      />
    );
  }

  console.log(data?.userNotifications?.items);

  return (
    <View style={{flex: 1, backgroundColor: 'white'}}>
      <FlatList
        data={notifications}
        renderItem={({item}) => <NotificationListItem notification={item} />}
        onRefresh={refetch}
        refreshing={loading}
        ListEmptyComponent={() => (
          <Text>There is no notification at the moment</Text>
        )}
      />
    </View>
  );
};

export default NotificationsScreen;

const styles = StyleSheet.create({});
