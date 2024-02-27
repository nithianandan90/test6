import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React from 'react';
import {useQuery} from '@apollo/client';
import {userFollowers} from './queries';
import {UserFollowersQuery, UserFollowersQueryVariables} from '../../API';
import ApiErrorMessage from '../../components/ApiErrorMessage';
import UserListItem from '../../components/UserListItem';

interface UserFollowersScreenProps {
  userId: string;
}

const UserFollowers = ({userId}: UserFollowersScreenProps) => {
  const {data, loading, error, refetch} = useQuery<
    UserFollowersQuery,
    UserFollowersQueryVariables
  >(userFollowers, {
    variables: {
      followeeID: userId,
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

  console.log(JSON.stringify(data, null, 2));

  const users =
    data?.userFollowers?.items
      ?.filter(i => !i?._deleted)
      .map(i => i?.Follower) || [];

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

export default UserFollowers;

const styles = StyleSheet.create({});
