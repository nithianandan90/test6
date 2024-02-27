import {Text, StyleSheet, Pressable} from 'react-native';
import React, {useEffect, useState} from 'react';
import {LazyPost, LazyUser, Notification} from '../../models';
import UserImage from '../UserImage';
import {S3Image} from 'aws-amplify-react-native';
import {useNavigation} from '@react-navigation/native';
import {NotificationsNavigationProp} from '../../types/navigation';

interface NotificationListItemProps {
  notification: Notification;
}

const NOTIFICATION_TEXT = {
  NEW_FOLLOWER: 'started following you.',
  NEW_LIKE: 'liked your post.',
  NEW_COMMENT: 'wrote a new comment',
};

const NotificationListItem = ({notification}: NotificationListItemProps) => {
  const navigation = useNavigation<NotificationsNavigationProp>();

  const [actor, setActor] = useState<LazyUser | undefined | null>(null);
  const [post, setPost] = useState<LazyPost | undefined | null>(null);

  const getData = async () => {
    const rActor = await notification?.Actor;
    setActor(rActor);

    const rPost = await notification?.Post;
    setPost(rPost);
  };

  useEffect(() => {
    getData();
  }, [notification]);

  const onPress = () => {
    navigation.navigate('UserProfile', {
      screen: 'Profile',
      params: {userId: actor?.id || ''},
    });
  };

  const navigateToPost = () => {
    {
      navigation.navigate('Post', {id: notification.notificationPostId || ''});
    }
  };

  return (
    <Pressable onPress={onPress} style={styles.container}>
      <UserImage imageKey={actor?.image || ''} width={40} />
      <Text>
        <Text style={{fontWeight: 'bold'}}>{actor?.username}</Text>{' '}
        {NOTIFICATION_TEXT[notification.type]}
      </Text>
      {post?.image && (
        <Pressable onPress={navigateToPost} style={{marginLeft: 'auto'}}>
          <S3Image imgKey={post?.image} style={styles.image} />
        </Pressable>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 50,
    height: 50,
  },
});

export default NotificationListItem;
