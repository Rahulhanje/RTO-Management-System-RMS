import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, LoginCredentials, RegisterData } from '@/types';
import { authService } from '@/services/authService';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check for existing user on mount
    const storedUser = authService.getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authService.login(credentials);
      
      if (response.success && response.data) {
        setUser(response.data.user);
        toast({
          title: 'Login Successful',
          description: `Welcome back, ${response.data.user.name}!`,
        });
        return true;
      } else {
        toast({
          title: 'Login Failed',
          description: response.message || 'Invalid credentials',
          variant: 'destructive',
        });
        return false;
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'An error occurred during login';
      toast({
        title: 'Login Error',
        description: message,
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authService.register(data);
      
      if (response.success) {
        toast({
          title: 'Registration Successful',
          description: 'Your account has been created. Please login.',
        });
        return true;
      } else {
        toast({
          title: 'Registration Failed',
          description: response.message || 'Could not create account',
          variant: 'destructive',
        });
        return false;
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'An error occurred during registration';
      toast({
        title: 'Registration Error',
        description: message,
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
      setUser(null);
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
    } catch (error) {
      // Still clear local state even if API call fails
      setUser(null);
    }
  };

  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  const isAuthenticated = !!user && authService.isAuthenticated();

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
