import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Redirect, Tabs } from 'expo-router';

import { useSession } from '@/context';
import { Button, Spinner, View } from 'tamagui';

export default function TabLayout() {
  const { session, isLoading, signOut } = useSession();
  if (isLoading) {
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Spinner />
    </View>;
  } else if (!session) {
    console.log(session);
    return <Redirect href='/start' />;
  } else {
    console.log('new', session);
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
            headerRight: () => <Button onPress={signOut}>Log Out</Button>,
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
            headerShown: false,
            tabBarIcon: ({ focused }) =>
              focused ? (
                <FontAwesome name='user' size={25} />
              ) : (
                <FontAwesome name={'user-o'} size={25} />
              ),
          }}
        />
      </Tabs>
    );
  }
}
