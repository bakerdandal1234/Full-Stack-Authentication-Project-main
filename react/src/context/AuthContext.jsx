import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  setAccessToken,
  getAccessToken,
  addTokenObserver,
  removeTokenObserver,
} from "../utils/axios";

const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  const checkAuth = async () => {
    try {
      const response = await fetch("http://localhost:3000/auth/me", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        setUser(null);
        setIsAuthenticated(false);
        throw new Error(data.message || 'Authentication failed');
      }

      setUser(data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Auth check error:", error);
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const tokenObserver = (token) => {
      if (token) {
        checkAuth();
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    };

    addTokenObserver(tokenObserver);
    checkAuth();

    return () => {
      removeTokenObserver(tokenObserver);
    };
  }, []);


  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:3000/logout", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (response.status === 200) {
        setUser(null);
        setIsAuthenticated(false);
        setAccessToken(null);
        navigate("/login");
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Force logout on client side even if server request fails
      setUser(null);
      setIsAuthenticated(false);
      setAccessToken(null);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      console.log('Server response:', data);
      
      // If login was successful
      if (data.success) {
        setAccessToken(data.accessToken);
        setUser(data.user);
        setIsAuthenticated(true);
        return { success: true };
      }
      
      // Return error from server
      return { 
        success: false,
        error: data.error
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Failed to connect to the server. Please try again.'
      };
    }
  };
  const signup = async (username, email, password) => {
    try {
      const response = await fetch("http://localhost:3000/signup", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });
      
      const data = await response.json();
      console.log('Signup response:', data);

      // إذا كان هناك خطأ من السيرفر
      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Signup failed'
        };
      }

      // في حالة النجاح
      if (data.accessToken) {
        setAccessToken(data.accessToken);
        setUser(data.user);
        setIsAuthenticated(true);
      }

      return {
        success: true,
        message: data.message
      };
    } catch (error) {
      console.error("Signup error:", error);
      return {
        success: false,
        error: 'Failed to connect to the server. Please try again.'
      };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await fetch("http://localhost:3000/reset-password", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return {
            success: false,
            ...data, // ينقل كل البيانات من السيرفر
        };
    }

      return {
        success: true,
        message: data.message,
      };
    } catch (error) {
      console.error("Forgot password error:", error);
      return {
        success: false,
        message: "Failed to connect to the server",
      };
    }
  };

  
  const resetPassword = async (token, newPassword) => {
    try {
      const response = await fetch(`http://localhost:3000/reset-password/${token}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newPassword }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          ...data,
        };
      }

      return {
        success: true,
        message: data.message,
      };
    } catch (error) {
      console.error("Reset password error:", error);
      return {
        success: false,
        message: "Failed to reset password",
      };
    }
  };

  const verifyResetToken = async (token) => {
    try {
      const response = await fetch(`http://localhost:3000/verify-reset-token/${token}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (!response.ok) {
        return {
          success: false,
          ...data,
        };
      }

      return { success: true };
    } catch (error) {
      console.error("Token verification error:", error);
      return {
        success: false,
        message: "Token verification failed",
      };
    }
  };


  const resendVerification = async (email) => {
    try {
      const response = await fetch("http://localhost:3000/resend-verification", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          ...data,
        };
      }

      return {
        success: true,
        message: data.message,
      };
    } catch (error) {
      console.error("Resend verification error:", error);
      return {
        success: false,
        message: "Failed to resend verification email",
      };
    }
  };

  const verifyEmail = async (token) => {
    try {
      const response = await fetch(`http://localhost:3000/verify-email/${token}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          ...data,
        };
      }

      return {
        success: true,
        message: data.message,
      };
    } catch (error) {
      console.error("Email verification error:", error);
      return {
        success: false,
        message: "Failed to verify email",
      };
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout: handleLogout,
    forgotPassword,
    verifyResetToken,
    resetPassword,
    resendVerification,
    verifyEmail,
    setIsAuthenticated,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

export default AuthContext;
