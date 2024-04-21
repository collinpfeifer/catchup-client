import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { SessionProvider } from '@/context';
import { useColorScheme } from '@/components/useColorScheme';
import { Client, cacheExchange, fetchExchange, gql, Provider } from 'urql';
import { authExchange } from '@urql/exchange-auth';
import { TamaguiProvider } from 'tamagui';
import config from '../tamagui.config';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

async function initializeAuthState() {
  const accessToken = await SecureStore.getItemAsync('accessToken');
  const refreshToken = await SecureStore.getItemAsync('refreshToken');
  return { accessToken, refreshToken };
}

async function logout() {
  // Clear the storage
  await SecureStore.deleteItemAsync('accessToken');
  await SecureStore.deleteItemAsync('refreshToken');

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

const client = new Client({
  url: 'http://localhost:4000/graphql',
  exchanges: [
    cacheExchange,
    authExchange(async (utils) => {
      let { accessToken, refreshToken } = await initializeAuthState();
      return {
        addAuthToOperation(operation) {
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
        async refreshAuth() {
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
            // This is where auth has gone wrong and we need to clean up and redirect to a login page
            await utils.mutate(LogoutMutation, {});
            logout();
          }
        },
      };
    }),
    fetchExchange,
  ],
});

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
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

  return (
    <TamaguiProvider config={config}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Provider value={client}>
          <SessionProvider>
            <Stack>
              <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
              <Stack.Screen name='start' />
              <Stack.Screen name='modal' options={{ presentation: 'modal' }} />
            </Stack>
          </SessionProvider>
        </Provider>
      </ThemeProvider>
    </TamaguiProvider>
  );
}
