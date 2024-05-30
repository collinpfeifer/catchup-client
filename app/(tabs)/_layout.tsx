import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Redirect, Tabs, router } from 'expo-router';

import { useSession } from '@/context';
import {
  Spinner,
  View,
  Text,
  Popover,
  Button,
  YStack,
  AlertDialog,
  XStack,
} from 'tamagui';
import { Pressable } from 'react-native';
import { gql, useMutation, useQuery } from 'urql';

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

const LogoutMutation = gql`
  mutation Logout {
    logout
  }
`;

const DeleteUserMutation = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
  }
`;

export default function TabLayout() {
  const { session, isLoading, signOut, userId } = useSession();
  const [ReceivedFriendRequestsResult] = useQuery({
    query: ReceivedFriendRequestsQuery,
  });
  const [, logout] = useMutation(LogoutMutation);
  const [, deleteUser] = useMutation(DeleteUserMutation);

  if (isLoading || ReceivedFriendRequestsResult.fetching) {
    return (
      <View flex={1} justifyContent='center' alignItems='center'>
        <Spinner />
      </View>
    );
  } else if (!session) {
    return <Redirect href='/start' />;
  } else if (ReceivedFriendRequestsResult.error) {
    return (
      <View flex={1} justifyContent='center' alignItems='center'>
        <Text>Something went wrong</Text>
      </View>
    );
  } else {
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
              <Popover>
                <Popover.Trigger marginRight='$3'>
                  <FontAwesome name='bars' size={20} color='black' />
                </Popover.Trigger>
                <Popover.Content>
                  <Popover.Arrow />
                  <Popover.Close />
                  <YStack>
                    <Button
                      m='$2'
                      onPress={async () => {
                        await logout();
                        signOut();
                      }}>
                      <Button.Icon>
                        <FontAwesome name='sign-out' size={20} />
                      </Button.Icon>
                      <Text>Log Out</Text>
                    </Button>
                    <AlertDialog native>
                      <AlertDialog.Trigger asChild>
                        <Button backgroundColor='red' m='$2'>
                          <Button.Icon>
                            <FontAwesome name='trash' size={20} color='white' />
                          </Button.Icon>
                          <Text color='white' fontWeight='bold'>
                            Delete Account
                          </Text>
                        </Button>
                      </AlertDialog.Trigger>
                      <AlertDialog.Portal>
                        <AlertDialog.Overlay
                          key='overlay'
                          animation='quick'
                          opacity={0.5}
                          enterStyle={{ opacity: 0 }}
                          exitStyle={{ opacity: 0 }}
                        />
                        <AlertDialog.Content
                          bordered
                          elevate
                          key='content'
                          animation={[
                            'quick',
                            {
                              opacity: {
                                overshootClamping: true,
                              },
                            },
                          ]}
                          enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
                          exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
                          x={0}
                          scale={1}
                          opacity={1}
                          y={0}>
                          <YStack>
                            <AlertDialog.Title>
                              Delete your Account
                            </AlertDialog.Title>
                            <AlertDialog.Description>
                              Are you sure you want to delete your account? All
                              your data will be lost.
                            </AlertDialog.Description>
                            <XStack justifyContent='flex-end'>
                              <AlertDialog.Cancel asChild>
                                <Button>No, take me back!</Button>
                              </AlertDialog.Cancel>
                              <AlertDialog.Action asChild>
                                <Button
                                  theme='active'
                                  onPress={async () => {
                                    await deleteUser({
                                      id: userId,
                                    });
                                    signOut();
                                  }}>
                                  Yes
                                </Button>
                              </AlertDialog.Action>
                            </XStack>
                          </YStack>
                        </AlertDialog.Content>
                      </AlertDialog.Portal>
                    </AlertDialog>
                  </YStack>
                </Popover.Content>
              </Popover>
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
