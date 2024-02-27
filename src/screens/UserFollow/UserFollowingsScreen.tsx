import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React from 'react';
import {userFollowings} from './queries';
import {UserFollowingsQuery, UserFollowingsQueryVariables} from '../../API';
import {useQuery} from '@apollo/client';
import ApiErrorMessage from '../../components/ApiErrorMessage';
import UserListItem from '../../components/UserListItem';

interface UserFollowingsScreenProps {
  userId: string;
}

const UserFollowingsScreen = ({userId}: UserFollowingsScreenProps) => {
  const {data, loading, error, refetch} = useQuery<
    UserFollowingsQuery,
    UserFollowingsQueryVariables
  >(userFollowings, {
    variables: {
      followerID: userId,
    },
  });

  if (loading) {
    return <ActivityIndicator />;
  }

  if (error) {
    return (
      <ApiErrorMessage
        title="Error fethching comments"
        message={error.message}
        // onRetry={() => refetch()}
      />
    );
  }

  const users =
    data?.userFollowings?.items
      ?.filter(i => !i?._deleted)
      .map(i => i?.Followee) || [];

  //   console.log(JSON.stringify(data, null, 2));
  return (
    <FlatList
      data={users}
      renderItem={({item}) => <UserListItem user={item} />}
      onRefresh={() => refetch()}
      refreshing={loading}
    />
  );
};

export default UserFollowingsScreen;

const styles = StyleSheet.create({});
