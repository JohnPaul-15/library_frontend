"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useApp } from "@/context/AppProvider";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import axios from "axios";

interface FormData {
  name?: string;
  email: string;
  password: string;
  password_confirmation?: string;
  role: 'user' | 'admin';
  adminCode?: string; // For admin registration verification
}

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: "user",
    adminCode: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showAdminFields, setShowAdminFields] = useState(false);

  const router = useRouter();
  const { login, register, authToken, isLoading, setAuthToken, setUser } = useApp();

  // Admin registration code - this should be stored securely in environment variables
  const ADMIN_REGISTRATION_CODE = process.env.NEXT_PUBLIC_ADMIN_CODE || "ADMIN123";

  useEffect(() => {
    if (authToken) {
      router.push("/dashboard");
      return;
    }
  }, [authToken, router]);

  const handleOnChangeInput = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    
    if (name === 'role') {
      setShowAdminFields(value === 'admin');
    }
    
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/login`,
        formData
      );

      if (response.data.token) {
        setAuthToken(response.data.token);
        setUser(response.data.user);
        toast.success('Login successful! Welcome back.');
        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.response?.status === 422) {
        toast.error(error.response.data.message || 'Invalid credentials');
      } else {
        toast.error('Failed to login. Please try again.');
      }
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/register`,
        formData
      );

      if (response.data.token) {
        setAuthToken(response.data.token);
        setUser(response.data.user);
        toast.success('Registration successful! Welcome to the library.');
        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        if (errors) {
          Object.values(errors).forEach((error: any) => {
            toast.error(error[0]);
          });
        } else {
          toast.error(error.response.data.message || 'Registration failed');
        }
      } else {
        toast.error('Failed to register. Please try again.');
      }
    }
  };

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    try {
      if (isLogin) {
        await handleLogin(event);
      } else {
        // Validate registration data
        if (!formData.name || !formData.password_confirmation) {
          throw new Error("Name and password confirmation are required");
        }

        // Validate admin registration
        if (formData.role === 'admin') {
          if (!formData.adminCode) {
            toast.error("Admin registration code is required");
            return;
          }
          if (formData.adminCode !== ADMIN_REGISTRATION_CODE) {
            toast.error("Invalid admin registration code");
            return;
          }
        }

        await handleRegister(event);
      }
    } catch (error) {
      console.error(`Authentication Failed:`, error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Authentication failed. Please try again.");
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[var(--background)]">
      <div className="w-full max-w-md p-8 bg-[var(--card-bg)] rounded-xl shadow-lg border border-[var(--border-color)]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Library Management</h1>
          <p className="text-[var(--text-muted)]">
            {isLogin ? "Welcome back! Please login to your account." : "Create a new account to get started."}
          </p>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[var(--text-muted)] mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
            <input
                  id="name"
                  className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border-color)] rounded-lg text-white placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleOnChangeInput}
                  placeholder="Enter your full name"
              required={!isLogin}
            />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-[var(--text-muted)] mb-1">
                  Account Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleOnChangeInput}
                  className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border-color)] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                  required={!isLogin}
                >
                  <option value="user">Regular User</option>
                  <option value="admin">Administrator</option>
                </select>
                {showAdminFields && (
                  <p className="mt-1 text-sm text-yellow-500">
                    Note: Admin registration requires a valid registration code.
                  </p>
                )}
              </div>

              {showAdminFields && (
                <div>
                  <label htmlFor="adminCode" className="block text-sm font-medium text-[var(--text-muted)] mb-1">
                    Admin Registration Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="adminCode"
                    className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border-color)] rounded-lg text-white placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                    name="adminCode"
                    type="password"
                    value={formData.adminCode}
                    onChange={handleOnChangeInput}
                    placeholder="Enter admin registration code"
                    required={showAdminFields}
                  />
                </div>
              )}
            </>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[var(--text-muted)] mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
          <input
              id="email"
              className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border-color)] rounded-lg text-white placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleOnChangeInput}
              placeholder="Enter your email"
            required
          />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[var(--text-muted)] mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
          <input
                id="password"
                className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border-color)] rounded-lg text-white placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
            name="password"
                type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleOnChangeInput}
                placeholder="Enter your password"
            required
          />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-white"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div>
              <label htmlFor="password_confirmation" className="block text-sm font-medium text-[var(--text-muted)] mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
            <input
                  id="password_confirmation"
                  className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border-color)] rounded-lg text-white placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              name="password_confirmation"
                  type={showConfirmPassword ? "text" : "password"}
              value={formData.password_confirmation}
              onChange={handleOnChangeInput}
                  placeholder="Confirm your password"
              required={!isLogin}
            />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-white"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          )}

          <button
            className="w-full bg-[var(--primary)] text-white py-3 px-4 rounded-lg font-medium hover:bg-[var(--primary-hover)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:ring-offset-[var(--card-bg)]"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              isLogin ? "Sign In" : "Create Account"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-[var(--text-muted)]">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            className="text-[var(--primary)] hover:text-[var(--primary-hover)] font-medium focus:outline-none"
            onClick={() => {
              setIsLogin(!isLogin);
              setShowAdminFields(false);
              setFormData({
                name: "",
                email: "",
                password: "",
                password_confirmation: "",
                role: "user",
                adminCode: "",
              });
            }}
          >
            {isLogin ? "Create Account" : "Sign In"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;