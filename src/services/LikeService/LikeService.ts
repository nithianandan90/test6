import {useMutation, useQuery} from '@apollo/client';
import {
  createLike,
  createNotification,
  deleteLike,
  likesForPostByUser,
  updatePost,
} from './queries';
import {
  CreateLikeMutation,
  CreateLikeMutationVariables,
  CreateNotificationInput,
  CreateNotificationMutation,
  CreateNotificationMutationVariables,
  DeleteLikeMutation,
  DeleteLikeMutationVariables,
  LikesForPostByUserQuery,
  LikesForPostByUserQueryVariables,
  NotificationTypes,
  Post,
  UpdatePostMutation,
  UpdatePostMutationVariables,
} from '../../API';
import {useAuthContext} from '../../contexts/AuthContext';

const useLikeService = (post: Post) => {
  const {userId} = useAuthContext();

  const {data: usersLikeData} = useQuery<
    LikesForPostByUserQuery,
    LikesForPostByUserQueryVariables
  >(likesForPostByUser, {variables: {postID: post.id, userID: {eq: userId}}});

  const [doUpdatePost] = useMutation<
    UpdatePostMutation,
    UpdatePostMutationVariables
  >(updatePost);

  const [doCreateLike] = useMutation<
    CreateLikeMutation,
    CreateLikeMutationVariables
  >(createLike);

  const [doDeleteLike] = useMutation<
    DeleteLikeMutation,
    DeleteLikeMutationVariables
  >(deleteLike);

  const [doCreateNotification] = useMutation<
    CreateNotificationMutation,
    CreateNotificationMutationVariables
  >(createNotification, {
    variables: {
      input: {
        type: NotificationTypes.NEW_LIKE,
        actorId: userId,
        userId: post.userID,
        readAt: 0,
        notificationPostId: post.id,
      },
    },
  });

  const userLike = (usersLikeData?.likesForPostByUser?.items || []).filter(
    like => !like?._deleted,
  )?.[0];

  const incrementNofLikes = (amount: 1 | -1) => {
    doUpdatePost({
      variables: {
        input: {
          id: post.id,
          _version: post._version,
          nofLikes: post.nofLikes + amount,
        },
      },
    });
  };

  const toggleLike = () => {
    // setIsLiked(f => !f);

    if (userLike) {
      //delete the user likes
      onDeleteLike();
    } else {
      onAddLike();
    }
  };

  const onAddLike = async () => {
    const data = await doCreateLike({
      variables: {input: {userID: userId, postID: post.id}},
      refetchQueries: ['LikesForPostByUser'],
    });

    console.log('lke data', JSON.stringify(data, null, 3));

    await doCreateNotification();

    incrementNofLikes(1);
  };

  const onDeleteLike = () => {
    if (!userLike) {
      return;
    }
    // delete the user like
    doDeleteLike({
      variables: {input: {id: userLike.id, _version: userLike._version}},
    });
    incrementNofLikes(-1);
  };

  return {
    toggleLike,
    isLiked: !!userLike,
  };
};

export default useLikeService;
