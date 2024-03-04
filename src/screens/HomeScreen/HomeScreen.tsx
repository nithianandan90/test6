import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
  ViewToken,
  ViewabilityConfig,
} from 'react-native';
import React, {useRef, useState, useEffect} from 'react';
import FeedPost from '../../components/FeedPosts/FeedPost';
import {useQuery} from '@apollo/client';
import {userFeed} from './queries';
import {
  ModelSortDirection,
  PostByDateQuery,
  PostByDateQueryVariables,
  UserFeedQuery,
  UserFeedQueryVariables,
} from '../../API';
import ApiErrorMessage from '../../components/ApiErrorMessage';
import {useAuthContext} from '../../contexts/AuthContext';

const HomeScreen = () => {
  const {userId} = useAuthContext();

  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const {data, loading, error, refetch, fetchMore} = useQuery<
    UserFeedQuery,
    UserFeedQueryVariables
  >(userFeed, {
    variables: {
      userID: userId,
      sortDirection: ModelSortDirection.DESC,
      limit: 5,
    },
  });

  console.log(userId);

  // console.log('data', data);

  const viewabilityConfig: ViewabilityConfig = {
    itemVisiblePercentThreshold: 51,
  };

  const onViewableItemsChanged = useRef(
    ({viewableItems}: {viewableItems: Array<ViewToken>}) => {
      console.log('changed');

      if (viewableItems.length > 0) {
        setActivePostId(viewableItems[0].item.id);
      }
    },
  );

  const nextToken = data?.userFeed?.nextToken;

  const loadMore = async () => {
    console.log('loading more', nextToken);

    if (!nextToken || isFetchingMore) {
      return;
    }

    setIsFetchingMore(true);

    const response = await fetchMore({variables: {nextToken}});

    // console.log(
    //   'response',
    //   JSON.stringify(response?.data?.commentsForPost?.items, null, 2),
    // );

    setIsFetchingMore(false);
  };

  // console.log(data);
  if (loading) {
    return <ActivityIndicator />;
  }

  if (error) {
    console.log(error);
    return (
      <ApiErrorMessage
        title="Error fethching posts"
        message={error.message}
        onRetry={() => refetch()}
      />
    );
  }

  // console.log('data', data?.postByDate?.items);

  // console.log('data', JSON.stringify(data, null, 2));

  const posts = (data?.userFeed?.items || [])
    .filter(item => !item?._deleted && !item?.Post?._deleted)
    .map(item => item?.Post);

  // console.log(JSON.stringify(posts, null, 2));

  return (
    <View>
      <FlatList
        data={posts}
        renderItem={({item}) =>
          item && <FeedPost post={item} isVisible={activePostId === item.id} />
        } // {item}
        showsVerticalScrollIndicator={false}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged.current}
        onRefresh={() => refetch()}
        refreshing={loading}
        onEndReached={() => {
          loadMore();
        }}
      />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({});
