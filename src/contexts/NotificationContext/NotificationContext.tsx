import {createContext, useContext, useEffect} from 'react';
import {onCreateNotification, userNotifications} from './queries';
import {useAuthContext} from '../AuthContext';
import {useQuery} from '@apollo/client';
import {
  UserNotificationsQuery,
  UserNotificationsQueryVariables,
} from '../../API';

const NotificationContext = createContext({newNotifications: 0});

const NotificationContextProvider = ({children}) => {
  const {userId} = useAuthContext();
  const {data, subscribeToMore} = useQuery<
    UserNotificationsQuery,
    UserNotificationsQueryVariables
  >(userNotifications, {variables: {userId}});

  //   console.log('notificationsdata', data?.userNotifications?.items);
  const unreadNotifications = (data?.userNotifications?.items || []).filter(
    item => !item?._deleted && !item?.readAt,
  );

  useEffect(() => {
    if (!subscribeToMore || !userId) {
      return;
    }
    subscribeToMore({
      document: onCreateNotification,
      variables: {filter: {userId: {eq: userId}}},
      updateQuery: (prev, next) => {
        return {
          ...prev,
          userNotifications: {
            ...prev?.userNotifications,
            items: [
              ...(prev?.userNotifications?.items || []),
              next.subscriptionData.data.onCreateNotification,
            ],
          },
        };
      },
    });
  }, [subscribeToMore, userId]);

  return (
    <NotificationContext.Provider
      value={{newNotifications: unreadNotifications.length}}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContextProvider;

export const useNotificationContext = () => useContext(NotificationContext);
