import { ReactNode, createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';

interface User {
  id: string;
  username: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = authService.getToken();
      
      if (storedToken) {
        // Check if token is expired
        if (authService.isTokenExpired(storedToken)) {
          // Token expired, clear it
          authService.removeTokens();
          setIsLoading(false);
          return;
        }

        // Token exists and is valid, fetch user profile
        try {
          const userProfile = await authService.getProfile(storedToken);
          setUser(userProfile);
          setToken(storedToken);
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          // Token invalid, clear it
          authService.removeTokens();
        }
      }
      
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await authService.login({ username, password });
      
      // Store tokens
      authService.storeToken(response.token, response.refreshToken);
      
      // Update state
      setUser(response.user);
      setToken(response.token);
    } catch (error: any) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await authService.logout(token);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear state and storage
      authService.removeTokens();
      setUser(null);
      setToken(null);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
