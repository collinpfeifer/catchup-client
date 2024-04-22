import React from 'react';
import { useStorageState } from './components/useStorageState';

const AuthContext = React.createContext<{
  signIn: (userId: string, accessToken: string, refreshToken: string) => void;
  signOut: () => void;
  user?: User | null;
  accessToken?: string | null;
  refreshToken?: string | null;
  session?: string | null;
  userId?: string | null;
  isLoading: boolean;
}>({
  signIn: (userId: string, accessToken: string, refreshToken: string) => null,
  signOut: () => null,
  accessToken: null,
  refreshToken: null,
  user: null,
  session: null,
  isLoading: false,
});

// This hook can be used to access the user info.
export function useSession() {
  const value = React.useContext(AuthContext);
  if (process.env.NODE_ENV !== 'production') {
    if (!value) {
      throw new Error('useSession must be wrapped in a <SessionProvider />');
    }
  }

  return value;
}

export function SessionProvider(props: React.PropsWithChildren) {
  const [[isLoading, session], setSession] = useStorageState('session');
  const [[, accessToken], setAccessToken] = useStorageState('accessToken');
  const [[, refreshToken], setRefreshToken] = useStorageState('refreshToken');
  const [[, userId], setUserId] = useStorageState('userId');

  return (
    <AuthContext.Provider
      value={{
        signIn: (userId: string, accessToken: string, refreshToken: string) => {
          // Perform sign-in logic here
          setAccessToken(accessToken);
          setRefreshToken(refreshToken);
          setUserId(userId);
          setSession('xxx');
        },
        signOut: () => {
          setSession(null);
          setAccessToken(null);
          setRefreshToken(null);
          setUserId(null);
        },
        userId,
        accessToken,
        refreshToken,
        session,
        isLoading,
      }}>
      {props.children}
    </AuthContext.Provider>
  );
}
