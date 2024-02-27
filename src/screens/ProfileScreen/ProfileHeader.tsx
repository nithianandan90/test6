import {Alert, Image, Pressable, StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import user from '../../assets/data/user.json';
import styles from './styles';
import Button from '../../components/Button';
import {useNavigation} from '@react-navigation/native';
import {ProfileNavigationProp} from '../../types/navigation';
import {Auth, Storage} from 'aws-amplify';
// import {User} from '../../models';
import {DEFAULT_USER_IMAGE} from '../../config';
import {
  CreateUserFollowMutation,
  CreateUserFollowMutationVariables,
  DeleteUserFollowMutation,
  DeleteUserFollowMutationVariables,
  User,
  UserFollowingsQuery,
  UserFollowingsQueryVariables,
} from '../../API';
import {useAuthContext} from '../../contexts/AuthContext';
import UserImage from '../../components/UserImage';
import {createUserFollow, deleteUserFollow, userFollowings} from './queries';
import {useMutation, useQuery} from '@apollo/client';

interface IProfileHeader {
  user: User;
}

const ProfileHeader = ({user}: IProfileHeader) => {
  const {userId} = useAuthContext();
  const [imageUri, setImageUri] = useState<string | null>(null);

  const [doFollow, {loading: followingsLoading}] = useMutation<
    CreateUserFollowMutation,
    CreateUserFollowMutationVariables
  >(createUserFollow, {
    variables: {input: {followerID: userId, followeeID: user.id}},
    refetchQueries: ['UserFollowings'],
  });

  const {data: userFollowingsData, loading: userFollowingsLoading} = useQuery<
    UserFollowingsQuery,
    UserFollowingsQueryVariables
  >(userFollowings, {
    variables: {followerID: userId, followeeID: {eq: user.id}},
  });

  const [doUnfollow, {loading: unfollowingLoading}] = useMutation<
    DeleteUserFollowMutation,
    DeleteUserFollowMutationVariables
  >(deleteUserFollow);

  const navigation = useNavigation<ProfileNavigationProp>();

  useEffect(() => {
    navigation.setOptions({title: user.username || 'Profile'});
  }, []);

  useEffect(() => {
    if (user.image) {
      Storage.get(user.image).then(setImageUri);
    }
  }, [user?.username]);

  console.log(JSON.stringify(userFollowingsData, null, 2));

  const userFollowObject = userFollowingsData?.userFollowings?.items?.filter(
    item => !item?._deleted,
  )[0];

  const onFollowPress = async () => {
    if (!!userFollowObject) {
      //delete
      try {
        await doUnfollow({
          variables: {
            input: {
              id: userFollowObject.id,
              _version: userFollowObject._version,
            },
          },
        });
        console.log('deleted');
      } catch (e) {
        Alert.alert('Failed to follow the user', (e as Error).message);
      }
    } else {
      // create
      try {
        await doFollow();
        console.log('followed');
      } catch (e) {
        Alert.alert('Failed to follow the user', (e as Error).message);
      }
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.headerRow}>
        <UserImage imageKey={user.image || undefined} width={100} />

        {/* <Image
          style={styles.avatar}
          source={{uri: imageUri || DEFAULT_USER_IMAGE}}
        /> */}
        <View style={styles.numberContainer}>
          <Text style={styles.numberText}>{user.nofPosts}</Text>
          <Text>Posts</Text>
        </View>
        <Pressable
          style={styles.numberContainer}
          onPress={() =>
            navigation.navigate('UserFollow', {
              id: user.id,
              screen: 'Followers',
            })
          }>
          <Text style={styles.numberText}>{user.nofFollowers}</Text>
          <Text>Followerss</Text>
        </Pressable>
        <Pressable
          style={styles.numberContainer}
          onPress={() =>
            navigation.navigate('UserFollow', {
              id: user.id,
              screen: 'Followings',
            })
          }>
          <Text style={styles.numberText}>{user.nofFollowings}</Text>
          <Text>Following</Text>
        </Pressable>
      </View>
      <Text style={styles.name}>{user.name}</Text>
      <Text>{user.bio}</Text>
      {userId === user.id ? (
        <View style={{flexDirection: 'row'}}>
          <Button
            text="Edit Profile"
            onPress={() => navigation.navigate('Edit Profile')}
            inline
          />

          <Button text="Sign Out" onPress={() => Auth.signOut()} inline />
        </View>
      ) : (
        <Button
          text={!!userFollowObject ? 'Unfollow' : 'Follow'}
          onPress={onFollowPress}
          disabled={
            userFollowingsLoading || followingsLoading || unfollowingLoading
          }
          inline
        />
      )}
    </View>
  );
};

export default ProfileHeader;
