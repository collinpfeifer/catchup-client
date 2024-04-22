import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Redirect, Tabs } from 'expo-router';
import { Pressable } from 'react-native';

import { useSession } from '@/context';
import { Spinner, View } from 'tamagui';

export default function TabLayout() {
  const { session, isLoading } = useSession();

  if (isLoading) {
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Spinner />
    </View>;
  }

  if (!session) {
    return <Redirect href='/start' />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: 'green',
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: false,
      }}>
      <Tabs.Screen
        name='index'
        options={{
          title: 'Question of the Day',
          headerRight: () => (
            <Link href='/add-friends' asChild>
              <Pressable>
                {({ pressed }) => (
                  <FontAwesome
                    name='info-circle'
                    size={25}
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name='friend-feed'
        options={{
          title: 'Friend Feed',
        }}
      />
    </Tabs>
  );
}
