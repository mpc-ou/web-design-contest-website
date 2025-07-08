import { createContext, useContext, useEffect, useState } from 'react';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { app } from '../firebase/config';
import { apiService } from '../services/api';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth(app);

  // Load cached user info on mount
  useEffect(() => {
    const cachedUserInfo = localStorage.getItem('userInfo');
    const cachedTimestamp = localStorage.getItem('userInfoTimestamp');
    
    if (cachedUserInfo && cachedTimestamp) {
      try {
        const parsedUserInfo = JSON.parse(cachedUserInfo);
        const timestamp = parseInt(cachedTimestamp);
        const now = Date.now();
        
        // Check if cached data is less than 1 hour old
        if (now - timestamp < 60 * 60 * 1000) {
          setUserInfo(parsedUserInfo);
        } else {
          // Cache is too old, remove it
          localStorage.removeItem('userInfo');
          localStorage.removeItem('userInfoTimestamp');
        }
      } catch (error) {
        console.error('Error parsing cached user info:', error);
        localStorage.removeItem('userInfo');
        localStorage.removeItem('userInfoTimestamp');
      }
    }
  }, []);

  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const idToken = await user.getIdToken();
      
      // Store Firebase token for API requests
      localStorage.setItem('authToken', idToken);
      
      // Login to backend with user data
      const loginData = {
        uid: user.uid,
        email: user.email,
        name: user.displayName || user.email
      };
      
      const response = await apiService.login(loginData);
      
      // Store backend token if provided
      if (response.data.token) {
        localStorage.setItem('backendToken', response.data.token);
      }
      
      // Cache user info with timestamp
      localStorage.setItem('userInfo', JSON.stringify(response.data.user));
      localStorage.setItem('userInfoTimestamp', Date.now().toString());
      setUserInfo(response.data.user);
      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('backendToken');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('userInfoTimestamp');
      throw error;
    }
  }

  async function signOut() {
    try {
      await firebaseSignOut(auth);
      setUserInfo(null);
      localStorage.removeItem('authToken');
      localStorage.removeItem('backendToken');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('userInfoTimestamp');
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  }

  async function refreshUserInfo() {
    if (!currentUser) return null;
    
    try {
      const response = await apiService.getCurrentUser();
      const newUserInfo = response.data;
      
      // Check if user info has changed (e.g., role changed)
      if (userInfo && JSON.stringify(userInfo) !== JSON.stringify(newUserInfo)) {
        console.log("User info has changed, updating...");
      }
      
      // Cache user info with timestamp
      localStorage.setItem('userInfo', JSON.stringify(newUserInfo));
      localStorage.setItem('userInfoTimestamp', Date.now().toString());
      setUserInfo(newUserInfo);
      return newUserInfo;
    } catch (err) {
      console.error("Failed to get user info:", err);
      // If getting user info fails, try to login again
      try {
        const idToken = await currentUser.getIdToken();
        localStorage.setItem('authToken', idToken);
        
        const loginData = {
          uid: currentUser.uid,
          email: currentUser.email,
          name: currentUser.displayName || currentUser.email
        };
        
        const loginResponse = await apiService.login(loginData);
        const newUserInfo = loginResponse.data.user;
        
        // Cache user info with timestamp
        localStorage.setItem('userInfo', JSON.stringify(newUserInfo));
        localStorage.setItem('userInfoTimestamp', Date.now().toString());
        setUserInfo(newUserInfo);
        return newUserInfo;
      } catch (loginErr) {
        console.error("Failed to re-login:", loginErr);
        // If re-login fails, sign out the user
        await signOut();
        return null;
      }
    }
  }

  // Main auth state change effect
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          const idToken = await user.getIdToken();
          localStorage.setItem('authToken', idToken);
          
          // Check if we have cached user info that matches the current user
          const cachedUserInfo = localStorage.getItem('userInfo');
          const cachedTimestamp = localStorage.getItem('userInfoTimestamp');
          
          if (cachedUserInfo && cachedTimestamp) {
            try {
              const parsedUserInfo = JSON.parse(cachedUserInfo);
              const timestamp = parseInt(cachedTimestamp);
              const now = Date.now();
              
              // Check if cached data matches current user and is not too old (less than 1 hour)
              if (parsedUserInfo.uid === user.uid && (now - timestamp < 60 * 60 * 1000)) {
                setUserInfo(parsedUserInfo);
                setLoading(false);
                return; // Use cached data, no need to fetch from backend
              }
            } catch (error) {
              console.error('Error parsing cached user info:', error);
              localStorage.removeItem('userInfo');
              localStorage.removeItem('userInfoTimestamp');
            }
          }
          
          // Try to get user info from backend and wait for it to complete
          const userData = await refreshUserInfo();
          
          // If we couldn't get user data, still set loading to false
          // but keep the Firebase user for basic authentication
          if (!userData) {
            console.warn("Could not load user info from backend, but Firebase auth is valid");
          }
        } catch (err) {
          console.error("Error in auth state change:", err);
          // Don't sign out immediately, just clear user info
          setUserInfo(null);
        }
      } else {
        // Clear tokens if user is logged out
        localStorage.removeItem('authToken');
        localStorage.removeItem('backendToken');
        localStorage.removeItem('userInfo');
        localStorage.removeItem('userInfoTimestamp');
        setUserInfo(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, [auth]);

  // Retry loading user info if we have a Firebase user but no backend user info
  useEffect(() => {
    if (currentUser && !userInfo && !loading) {
      const retryLoadUserInfo = async () => {
        console.log("Retrying to load user info...");
        await refreshUserInfo();
      };
      
      // Retry after a short delay
      const timeoutId = setTimeout(retryLoadUserInfo, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [currentUser, userInfo, loading]);

  // Periodic refresh of user info (every 30 minutes)
  useEffect(() => {
    if (currentUser && userInfo) {
      const intervalId = setInterval(async () => {
        console.log("Periodically refreshing user info...");
        await refreshUserInfo();
      }, 30 * 60 * 1000); // 30 minutes

      return () => clearInterval(intervalId);
    }
  }, [currentUser, userInfo]);

  // Listen for storage changes (in case user info is updated in another tab)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'userInfo' && e.newValue) {
        try {
          const newUserInfo = JSON.parse(e.newValue);
          if (newUserInfo.uid === currentUser?.uid) {
            setUserInfo(newUserInfo);
          }
        } catch (error) {
          console.error('Error parsing updated user info:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [currentUser]);

  // Handle token expiration by checking if tokens are cleared
  useEffect(() => {
    const checkTokenExpiration = () => {
      const authToken = localStorage.getItem('authToken');
      const userInfo = localStorage.getItem('userInfo');
      
      // If we have user info but no auth token, tokens might have expired
      if (userInfo && !authToken && currentUser) {
        console.log("Auth token missing, attempting to refresh...");
        refreshUserInfo();
      }
    };

    // Check every 5 minutes
    const intervalId = setInterval(checkTokenExpiration, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [currentUser]);

  const value = {
    currentUser,
    userInfo,
    isAdmin: userInfo?.role === 'admin',
    loginWithGoogle,
    signOut,
    refreshUserInfo,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
