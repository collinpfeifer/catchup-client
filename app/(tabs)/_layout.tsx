import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Redirect, Tabs } from 'expo-router';
import { LogOut } from '@tamagui/lucide-icons';

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
    return <Redirect href='/start' />;
  } else
    return (
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: 'green',
          // Disable the static render of the header on web
          // to prevent a hydration error in React Navigation v6.
        }}>
        <Tabs.Screen
          name='friend-feed'
          options={{
            title: 'Friend Feed',
            tabBarIcon: () => <FontAwesome name='feed' size={25} />,
            // headerRight: () => (
            //   <Link href='/add-friends' asChild>
            //     <Pressable>
            //       {({ pressed }) => (
            //         <FontAwesome
            //           name='info-circle'
            //           size={25}
            //           style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
            //         />
            //       )}
            //     </Pressable>
            //   </Link>
            // ),
          }}
        />
        <Tabs.Screen
          name='index'
          options={{
            title: 'Question of the Day',
            headerRight: () => <Button onPress={signOut}>Log Out</Button>,
            tabBarIcon: () => <FontAwesome name='question' size={25} />,
          }}
        />
        <Tabs.Screen
          name='add-friends'
          options={{
            title: 'Add Friends',
            tabBarIcon: () => <FontAwesome name='user' size={25} />,
          }}
        />
      </Tabs>
    );
}
