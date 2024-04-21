import React from 'react';
import { useStorageState } from './components/useStorageState';

const AuthContext = React.createContext<{
  signIn: () => void;
  signOut: () => void;
  user?: User | null;
  accessToken?: string | null;
  refreshToken?: string | null;
  session?: string | null;
  userId?: string | null;
  isLoading: boolean;
}>({
  signIn: () => null,
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

  return (
    <AuthContext.Provider
      value={{
        signIn: () => {
          // Perform sign-in logic here
          setSession('xxx');
        },
        signOut: () => {
          setSession(null);
        },
        accessToken,
        refreshToken,
        session,
        isLoading,
      }}>
      {props.children}
    </AuthContext.Provider>
  );
}
