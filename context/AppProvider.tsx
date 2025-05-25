"use client";

import Loader from "@/components/loader";
import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation" ;
import Loading from '@/components/Loading';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  created_at: string;
}

interface AppProviderType {
  isLoading: boolean;
  authToken: string | null;
  isLogin: boolean;
  user: User | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    password_confirmation: string,
    role?: 'user' | 'admin',
    adminCode?: string
  ) => Promise<void>;
  logout: () => void;
  fetchUserProfile: () => Promise<void>;
  checkAdminAccess: () => boolean;
  setAuthToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
}

const AppContext = createContext<AppProviderType | undefined>(undefined);

// Fixed: Properly access env variable with fallback
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authToken, setAuthToken] = useState<string | null>(null); 
  const [user, setUser] = useState<User | null>(null);
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const router = useRouter(); 

  // Computed property for admin status
  const isAdmin = user?.role === 'admin';

  // Helper function to check admin access
  const checkAdminAccess = () => {
    if (!user || !authToken) {
      console.log('Admin access check failed: Missing user or token', {
        hasUser: !!user,
        hasToken: !!authToken,
        userRole: user?.role
      });
      return false;
    }

    const hasAccess = user.role === 'admin';
    console.log('Checking admin access:', {
      hasUser: !!user,
      hasToken: !!authToken,
      userRole: user.role,
      hasAccess
    });
    return hasAccess;
  };

  // Debug logging for state changes
  useEffect(() => {
    console.log('AppProvider State Update:', {
      isLoading,
      isProfileLoading,
      hasAuthToken: !!authToken,
      hasUser: !!user,
      userRole: user?.role,
      isAdmin
    });
  }, [isLoading, isProfileLoading, authToken, user, isAdmin]);

  const fetchUserProfile = async () => {
    console.log('Fetching user profile...', {
      hasToken: !!authToken,
      tokenLength: authToken?.length,
      currentUser: user,
      isProfileLoading
    });

    if (!authToken) {
      console.log('No auth token available, skipping profile fetch');
      setIsLoading(false);
      return;
    }

    // Prevent multiple simultaneous profile fetches
    if (isProfileLoading) {
      console.log('Profile fetch already in progress, skipping');
      return;
    }

    try {
      setIsProfileLoading(true);
      console.log('Making profile request to:', `${API_URL}/profile`);
      const response = await axios.get(`${API_URL}/profile`, {
        headers: { 
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log('Profile response received:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers
      });
      
      if (response.data.status === 'success' && response.data.data) {
        const userData = response.data.data;
        console.log('Setting user data:', {
          id: userData.id,
          name: userData.name,
          role: userData.role,
          status: userData.status,
          email: userData.email
        });
        
        // Verify the role is set correctly
        if (!userData.role || !['admin', 'user'].includes(userData.role)) {
          console.error('Invalid user role received:', {
            role: userData.role,
            validRoles: ['admin', 'user'],
            fullUserData: userData
          });
          handleAuthError();
          return;
        }

        // Log role verification
        console.log('Role verification:', {
          receivedRole: userData.role,
          isValidRole: ['admin', 'user'].includes(userData.role),
          willBeAdmin: userData.role === 'admin'
        });
        
        setUser(userData);
        setIsLoading(false);

        // Check current path and redirect if needed
        const currentPath = window.location.pathname;
        if (currentPath === '/auth') {
          // Redirect based on role after successful login/registration
          if (userData.role === 'admin') {
            console.log('Admin user detected, redirecting to admin dashboard');
            router.replace('/dashboard');
          } else {
            console.log('Regular user detected, redirecting to user dashboard');
            router.replace('/user-dashboard');
          }
        } else if (currentPath.startsWith('/dashboard') && userData.role !== 'admin') {
          // If non-admin user tries to access admin dashboard, redirect to user dashboard
          console.log('Non-admin user accessing admin dashboard, redirecting to user dashboard');
          toast.error('Access denied. Admin privileges required.');
          router.replace('/user-dashboard');
        } else if (currentPath.startsWith('/user-dashboard') && userData.role === 'admin') {
          // If admin user tries to access user dashboard, redirect to admin dashboard
          console.log('Admin user accessing user dashboard, redirecting to admin dashboard');
          router.replace('/dashboard');
        }
      } else {
        console.error('Profile fetch returned invalid data:', {
          status: response.data.status,
          data: response.data,
          expectedFormat: 'Expected { status: "success", data: { id, name, role, ... } }'
        });
        handleAuthError();
      }
    } catch (error) {
      console.error('Profile fetch error:', {
        error,
        isAxiosError: axios.isAxiosError(error),
        status: axios.isAxiosError(error) ? error.response?.status : 'N/A',
        statusText: axios.isAxiosError(error) ? error.response?.statusText : 'N/A',
        responseData: axios.isAxiosError(error) ? error.response?.data : 'N/A',
        headers: axios.isAxiosError(error) ? error.response?.headers : 'N/A'
      });
      handleAuthError();
    } finally {
      console.log('Profile fetch completed', {
        hasUser: !!user,
        userRole: user?.role,
        isAdmin: user?.role === 'admin'
      });
      setIsProfileLoading(false);
    }
  };

  const handleAuthError = () => {
    console.log('Handling auth error - clearing session');
    setAuthToken(null);
    setUser(null);
    Cookies.remove("authToken");
    setIsLoading(false);
    setIsProfileLoading(false);
    router.replace("/auth");
  };

  const login = async (email: string, password: string) => {
    console.log('Login attempt...', { email });
    setIsLoading(true);
    try {
      console.log('Making login request to:', `${API_URL}/login`);
      const response = await axios.post(`${API_URL}/login`, {
        email,
        password,
      });

      // Log the complete response for debugging
      console.log('Login response details:', {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data
      });

      // Check if the response indicates an error
      if (response.data.status === false) {
        const errorMessage = response.data.message || 'Login failed';
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }

      if (!response.data.token) {
        const errorMessage = 'Login response missing authentication token';
        console.error('Login response missing token:', {
          responseData: response.data,
          status: response.status,
          statusText: response.statusText
        });
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }

      const token = response.data.token;
      
      // Log the raw token for debugging (first 20 chars only)
      console.log('Received token:', {
        length: token.length,
        preview: token.substring(0, 20) + '...',
        containsDots: token.includes('.'),
        format: token.includes('.') ? 'JWT-like' : 'Non-JWT'
      });

      // Store the token regardless of format for now
      console.log('Setting token in cookies and state');
      Cookies.set("authToken", token, { 
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      setAuthToken(token);
      
      // Fetch user profile to get role information
      await fetchUserProfile();
      
      toast.success("Login successful!");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
        console.error('Login error (Axios):', {
          message: errorMessage,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
        toast.error(errorMessage);
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Login failed. Please try again.';
        console.error('Login error:', {
          message: errorMessage,
          error
        });
        toast.error(errorMessage);
      }
      handleAuthError();
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    password_confirmation: string,
    role: 'user' | 'admin' = 'user', // Default to 'user' if not specified
    adminCode?: string // Add admin code parameter
  ) => {
    console.log('Registration attempt...', { name, email, role });
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/register`, {
        name,
        email,
        password,
        password_confirmation,
        role,
        admin_code: role === 'admin' ? adminCode : undefined // Include admin code only for admin registration
      });

      console.log('Registration response received:', response.status);

      if (response.data.status) {
        console.log('Registration successful, setting token');
        const token = response.data.token;
        Cookies.set("authToken", token, { expires: 7 });
        setAuthToken(token);
        
        // Fetch user profile to get role information
        await fetchUserProfile();
        
        toast.success(`Registration successful! Welcome to the library${role === 'admin' ? ' as an administrator' : ''}.`);
      } else {
        console.log('Registration failed');
        toast.error("Registration failed. Please try again.");
      }
    } catch (error) {
      console.error('Registration error:', error);
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || "Registration failed. Please try again.";
        toast.error(message);
      } else {
        toast.error("Registration failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log('Logging out...');
    setAuthToken(null);
    setUser(null);
    Cookies.remove("authToken");
    setIsLoading(false);
    toast.success("Logout successful!");
    router.replace("/auth");
  };

  // Helper function to validate token
  const validateToken = (token: string): boolean => {
    try {
      // For Sanctum tokens, we just need to check if it exists and has a reasonable length
      if (!token || token.length < 10) {
        console.error('Invalid token:', {
          length: token?.length,
          preview: token?.substring(0, 20) + '...'
        });
        return false;
      }

      // Log token details for debugging
      console.log('Validating Sanctum token:', {
        length: token.length,
        preview: token.substring(0, 20) + '...'
      });

      return true;
    } catch (e) {
      console.error('Token validation failed:', {
        error: e,
        tokenPreview: token?.substring(0, 20) + '...'
      });
      return false;
    }
  };

  // Initialize auth state
  useEffect(() => {
    console.log('Initializing auth state...');
    const token = Cookies.get("authToken");

    if (token) {
      console.log('Found token in cookies:', {
        length: token.length,
        preview: token.substring(0, 20) + '...'
      });

      if (validateToken(token)) {
        console.log('Valid token found, setting auth state');
        setAuthToken(token);
        // Fetch profile immediately
        fetchUserProfile();
      } else {
        console.error('Invalid token found in cookies');
        handleAuthError();
      }
    } else {
      console.log('No token found in cookies, redirecting to auth');
      setIsLoading(false);
      router.replace("/auth");
    }
  }, []); // Empty dependency array for initialization

  // Retry profile fetch if we have a token but no user
  useEffect(() => {
    if (authToken && !user && !isProfileLoading && !isLoading) {
      console.log('Auth token exists but no user data, retrying profile fetch');
      fetchUserProfile();
    }
  }, [authToken, user, isProfileLoading, isLoading]);

  // Prevent rendering children while loading
  if (isLoading) {
    return <Loading />;
  }

  console.log('AppProvider rendering children');
  return (
    <AppContext.Provider 
      value={{ 
        isLoading, 
        isLogin, 
        login, 
        register, 
        authToken, 
        logout, 
        user,
        isAdmin,
        fetchUserProfile,
        checkAdminAccess,
        setAuthToken,
        setUser
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};