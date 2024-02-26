import {useMutation, useQuery} from '@apollo/client';
import {
  CreateCommentMutation,
  CreateCommentMutationVariables,
  CreateNotificationMutation,
  CreateNotificationMutationVariables,
  GetPostQuery,
  GetPostQueryVariables,
  NotificationTypes,
  Post,
  UpdatePostMutation,
  UpdatePostMutationVariables,
} from '../../API';
import {
  createComment,
  createNotification,
  getPost,
  updatePost,
} from './queries';
import {Alert} from 'react-native';
import {useAuthContext} from '../../contexts/AuthContext';

const useCommentsService = (postId: string) => {
  const {userId} = useAuthContext();

  const {data: postData} = useQuery<GetPostQuery, GetPostQueryVariables>(
    getPost,
    {variables: {id: postId}},
  );

  const post = postData?.getPost;

  const [doUpdatePost] = useMutation<
    UpdatePostMutation,
    UpdatePostMutationVariables
  >(updatePost);

  const [doCreateComment] = useMutation<
    CreateCommentMutation,
    CreateCommentMutationVariables
  >(createComment);

  const [doCreateNotification] = useMutation<
    CreateNotificationMutation,
    CreateNotificationMutationVariables
  >(createNotification);

  const incrementNofComments = (amount: 1 | -1) => {
    if (!post) {
      Alert.alert('Failed to load post');
      return;
    }

    doUpdatePost({
      variables: {
        input: {
          id: post.id,
          _version: post._version,
          nofComments: post.nofComments + amount,
        },
      },
    });
  };

  const onCreateComment = async (newComment: string) => {
    if (!post) {
      Alert.alert('Failed to load post');
      return;
    }
    try {
      const response = await doCreateComment({
        variables: {
          input: {comment: newComment, userID: userId, postID: post.id},
        },
      });

      const notificationParams = {
        variables: {
          input: {
            type: NotificationTypes.NEW_COMMENT,
            actorId: userId,
            userId: post?.User?.id || '',
            readAt: 0,
            notificationPostId: post.id,
            notificationCommentId: response?.data?.createComment?.id,
          },
        },
      };

      const notificationResponse = await doCreateNotification(
        notificationParams,
      );

      console.log('notification response', notificationResponse);

      incrementNofComments(1);
    } catch (e) {
      Alert.alert('Error submitting post', (e as Error).message);
    }

    // console.warn('Posting the comment', newComment);
  };

  return {
    incrementNofComments,
    onCreateComment,
  };
};

export default useCommentsService;
