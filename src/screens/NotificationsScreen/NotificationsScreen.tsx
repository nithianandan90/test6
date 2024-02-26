import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React from 'react';
import {userNotifications} from './queries';
import {useQuery} from '@apollo/client';
import {useAuthContext} from '../../contexts/AuthContext';
import {
  ModelSortDirection,
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

  const notifications = (data?.userNotifications?.items || []).filter(
    item => !item?._deleted,
  );

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
