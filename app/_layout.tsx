import FontAwesome from '@expo/vector-icons/FontAwesome';
import Animated from 'react-native-reanimated';

console.log(Animated); // make sure to use the imported thing, otherwise the import will be optimized away
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { useFonts } from 'expo-font';
import { Slot, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useState } from 'react';
import { SessionProvider } from '@/context';
import { useColorScheme } from '@/components/useColorScheme';
import { Client, fetchExchange, gql, Provider } from 'urql';
import { cacheExchange } from '@urql/exchange-graphcache';
import { authExchange } from '@urql/exchange-auth';
import { retryExchange } from '@urql/exchange-retry';
import { persistedExchange } from '@urql/exchange-persisted';
import { TamaguiProvider } from 'tamagui';
import config from '../tamagui.config';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

function handleRegistrationError(errorMessage: string) {
  alert(errorMessage);
  throw new Error(errorMessage);
}

async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      handleRegistrationError(
        'Permission not granted to get push token for push notification!'
      );
      return;
    }
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;
    if (!projectId) {
      handleRegistrationError('Project ID not found');
    }
    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      console.log(pushTokenString);
      return pushTokenString;
    } catch (e: unknown) {
      handleRegistrationError(`${e}`);
    }
  } else {
    handleRegistrationError('Must use physical device for push notifications');
  }
}

const options = {
  initialDelayMs: 1000,
  maxDelayMs: 15000,
  randomDelay: true,
  maxNumberAttempts: 2,
  retryIf: (err: any) => err && err.networkError,
};

async function initializeAuthState() {
  let accessToken = await SecureStore.getItemAsync('accessToken');
  let refreshToken = await SecureStore.getItemAsync('refreshToken');
  return { accessToken, refreshToken };
}

async function logout() {
  // Clear the storage
  await SecureStore.deleteItemAsync('accessToken');
  await SecureStore.deleteItemAsync('refreshToken');
  await SecureStore.deleteItemAsync('userId');
  await SecureStore.deleteItemAsync('session');
  // Perform any other cleanup tasks
}

const RefreshTokenMutation = gql`
  mutation RefreshToken($refreshToken: String!) {
    refreshToken(refreshToken: $refreshToken) {
      refreshToken
      token
    }
  }
`;

const LogoutMutation = gql`
  mutation Logout {
    logout
  }
`;

const UserAnswerExistsQuery = gql`
  query UserAnswerExists {
    userAnswerExists
  }
`;

const url = process.env.EXPO_PUBLIC_SERVER_URL;

const client = new Client({
  url: url ?? 'http://localhost:4000/graphql',
  exchanges: [
    cacheExchange({
      updates: {
        Mutation: {
          answerQuestion(_result, _args, cache, _info) {
            cache.updateQuery({ query: UserAnswerExistsQuery }, (data) => {
              if (data) {
                data.userAnswerExists = true;
              }
              return data;
            });
          },
        },
      },
    }),
    persistedExchange({
      enforcePersistedQueries: true,
      enableForMutation: true,
      generateHash: (_, document) =>
        Promise.resolve(document?.__meta__?.hash),
    }),
    authExchange(async (utils) => {
      let { accessToken, refreshToken } = await initializeAuthState();
      console.log('initializeAuthState', accessToken, refreshToken);
      return {
        addAuthToOperation(operation) {
          accessToken = SecureStore.getItem('accessToken');
          console.log('addAuthToOperation', accessToken);
          if (!accessToken) return operation;
          return utils.appendHeaders(operation, {
            Authorization: `Bearer ${accessToken}`,
          });
        },
        didAuthError(error, _operation) {
          return error.graphQLErrors.some(
            (e) => e.extensions?.code === 'FORBIDDEN'
          );
        },
        willAuthError(_operation) {
          if (!accessToken) return true;
          else return false;
        },
        async refreshAuth() {
          refreshToken = await SecureStore.getItemAsync('refreshToken');
          console.log('refreshAuth', refreshToken);
          const result = await utils.mutate(RefreshTokenMutation, {
            refreshToken,
          });

          if (result.data?.refreshToken) {
            // Update our local variables and write to our storage
            accessToken = result.data.refreshToken?.token;
            refreshToken = result.data.refreshToken?.refreshToken;
            if (accessToken && refreshToken) {
              await SecureStore.setItemAsync('accessToken', accessToken);
              await SecureStore.setItemAsync('refreshToken', refreshToken);
            }
          } else {
            console.log('logout');
            // This is where auth has gone wrong and we need to clean up and redirect to a login page
            await utils.mutate(LogoutMutation, {});
            console.log('logout done');
            logout();
            console.log('logout done 3');
          }
        },
      };
    }),

    retryExchange(options),
    fetchExchange,
  ],
});

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
    Rubix: require('../assets/fonts/Rubik-VariableFont_wght.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >(undefined);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then((token) => setExpoPushToken(token ?? ''))
      .catch((error: any) => setExpoPushToken(`${error}`));

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return (
    <TamaguiProvider config={config} defaultTheme='light'>
      <ThemeProvider value={DefaultTheme}>
        <Provider value={client}>
          <SessionProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
              <Stack.Screen
                name='friend-requests'
                options={{ presentation: 'modal', headerShown: false }}
              />
            </Stack>
          </SessionProvider>
        </Provider>
      </ThemeProvider>
    </TamaguiProvider>
  );
}
