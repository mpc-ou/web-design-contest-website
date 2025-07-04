import { createContext, useContext, useEffect, useState } from 'react';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { app } from '../firebase/config';
import api from '../services/api';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth(app);

  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      
      // Login to backend and get user info
      const response = await api.post('/api/auth/login', {}, {
        headers: {
          Authorization: `Bearer ${idToken}`
        }
      });
      
      setUserInfo(response.data.user);
      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  async function signOut() {
    try {
      await firebaseSignOut(auth);
      setUserInfo(null);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          const idToken = await user.getIdToken();
          // Store token for API requests
          api.defaults.headers.common['Authorization'] = `Bearer ${idToken}`;
          
          // Try to get user info if we don't have it
          if (!userInfo) {
            try {
              const response = await api.post('/api/auth/login', {});
              setUserInfo(response.data.user);
            } catch (err) {
              console.error("Failed to get user info:", err);
            }
          }
        } catch (err) {
          console.error("Error getting token:", err);
        }
      } else {
        // Clear token if user is logged out
        delete api.defaults.headers.common['Authorization'];
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, [auth, userInfo]);

  const value = {
    currentUser,
    userInfo,
    isAdmin: userInfo?.role === 'admin',
    loginWithGoogle,
    signOut,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
