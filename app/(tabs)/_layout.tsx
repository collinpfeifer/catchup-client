import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Redirect, Tabs, router } from 'expo-router';


import { useSession } from '@/context';
import { Spinner, View, Text } from 'tamagui';
import { Pressable } from 'react-native';
import { gql, useQuery } from 'urql';

const ReceivedFriendRequestsQuery = gql`
  query ReceivedFriendRequests {
    receivedFriendRequests {
      id
      sender {
        id
        name
        phoneNumber
      }
    }
  }
`;

export default function TabLayout() {
  const { session, isLoading, signOut } = useSession();
  const [ReceivedFriendRequestsResult] = useQuery({
    query: ReceivedFriendRequestsQuery,
  });

  console.log(
    'session',
    session,
    isLoading,
    ReceivedFriendRequestsResult.fetching
  );

  if (isLoading || ReceivedFriendRequestsResult.fetching) {
    console.log('loading');
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Spinner />
      </View>
    );
  } else if (!session) {
    console.log('no session');
    return router.replace('/start');
  } else if (ReceivedFriendRequestsResult.error) {
    console.log('error');
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Text>Something went wrong</Text>
      </View>
    );
  } else {
    console.log('else');
    const hasFriendRequests =
      ReceivedFriendRequestsResult.data.receivedFriendRequests.length > 0;
    return (
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: 'black',
          // Disable the static render of the header on web
          // to prevent a hydration error in React Navigation v6.
          // headerShown: false,
        }}>
        <Tabs.Screen
          name='friend-feed'
          options={{
            title: 'Friend Feed',
            headerShown: false,
            tabBarIcon: ({ focused }) =>
              focused ? (
                <FontAwesome name='comments' size={25} />
              ) : (
                <FontAwesome name='comments-o' s size={25} />
              ),
          }}
        />
        <Tabs.Screen
          name='index'
          options={{
            title: 'Question of the Day',
            headerTransparent: true,
            headerRight: () => (
              <Pressable onPress={() => signOut()}>
                <FontAwesome
                  name='sign-out'
                  size={25}
                  style={{ marginRight: 15 }}
                />
              </Pressable>
            ),
            headerTitle: '',
            tabBarIcon: ({ focused }) =>
              focused ? (
                <FontAwesome name='question-circle' size={25} />
              ) : (
                <FontAwesome name='question-circle-o' size={25} />
              ),
          }}
        />
        <Tabs.Screen
          name='add-friends'
          options={{
            title: 'Add Friends',
            headerTitle: '',
            headerTransparent: true,
            tabBarIcon: ({ focused }) =>
              focused ? (
                <FontAwesome name='user' size={25} />
              ) : (
                <FontAwesome name={'user-o'} size={25} />
              ),
            headerRight: () =>
              hasFriendRequests && (
                <Pressable onPress={() => router.push('/friend-requests')}>
                  <FontAwesome
                    name='user-plus'
                    size={25}
                    style={{ marginRight: 15 }}
                  />
                </Pressable>
              ),
          }}
        />
      </Tabs>
    );
  }
}
