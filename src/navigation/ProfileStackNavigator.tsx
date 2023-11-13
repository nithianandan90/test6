import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen/ProfileScreen';
import logo from '../assets/images/logo.png';
import BottomTabNavigator from './BottomTabNavigator';
import {Image} from 'react-native';
import EditProfileScreen from '../screens/EditProfileScreen/EditProfileScreen';
import {ProfileStackNavigatorParamList} from '../types/navigation';
import UserFollowTabNavigator from './UserFollowTabNavigator';

const Stack = createNativeStackNavigator<ProfileStackNavigatorParamList>();

const ProfileStackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Edit Profile" component={EditProfileScreen} />
      <Stack.Screen name="UserFollow" component={UserFollowTabNavigator} />
    </Stack.Navigator>
  );
};

export default ProfileStackNavigator;
