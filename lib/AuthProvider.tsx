import nookies from 'nookies';
import { createContext, useContext, useEffect, useState } from 'react';
import { getAuth, onIdTokenChanged, User } from "firebase/auth";

const AuthContext = createContext<{ user: User | null }>({
  user: null,
});

export function AuthProvider({ children }: any) {
  const [user, setUser] = useState<User | null>(null);

  const auth = getAuth();


  // listen for token changes
  // call setUser and write new token as a cookie
  useEffect(() => {
    return onIdTokenChanged(auth, async (user) => {
      if (!user) {
        setUser(null);
        nookies.set(undefined, 'token', '', { path: '/' });
      } else {
        const token = await user.getIdToken();
        setUser(user);
        nookies.set(undefined, 'token', token, { path: '/' });
      }
    });
  }, []);

  // force refresh the token every 10 minutes
  useEffect(() => {
    const handle = setInterval(async () => {
      const user = auth.currentUser;
      if (user) await user.getIdToken(true);
    }, 10 * 60 * 1000);

    // clean up setInterval
    return () => clearInterval(handle);
  }, []);

  return (
    <AuthContext.Provider value={ { user } }>{ children }</AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
