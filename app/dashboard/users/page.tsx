"use client";

import { useEffect, useState } from 'react';
import { useApp } from '@/context/AppProvider';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import Loading from '@/components/Loading';

interface User {
  id?: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  created_at?: string;
  password?: string;
}

interface PaginatedResponse {
  status: string;
  data: {
    current_page: number;
    data: User[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
}

export default function UsersManagement() {
  const { authToken, isLoading, user, isAdmin, checkAdminAccess, fetchUserProfile } = useApp();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<User>({
    name: '',
    email: '',
    role: 'user',
    status: 'active',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    const initializePage = async () => {
      console.log('Initializing users management page:', {
        isLoading,
        hasToken: !!authToken,
        userRole: user?.role,
        isAdmin,
        checkAdminAccess: checkAdminAccess()
      });

      if (isLoading) {
        console.log('App is still loading, waiting...');
        return;
      }

      if (!authToken) {
        console.log('No auth token, redirecting to login');
        router.replace('/auth');
        return;
      }

      // Check admin access using the helper function
      const hasAdminAccess = checkAdminAccess();
      console.log('Admin access check result:', {
        hasAdminAccess,
        userRole: user?.role,
        isAdmin,
        userId: user?.id
      });

      if (!hasAdminAccess) {
        console.log('User is not admin, redirecting to dashboard', {
          userRole: user?.role,
          isAdmin,
          userId: user?.id
        });
        toast.error('Access denied. Admin privileges required.');
        router.replace('/dashboard');
        return;
      }

      // If we get here, user is admin
      console.log('Admin access verified, proceeding to fetch users');
      setIsPageLoading(false);
      await fetchUsers();
    };

    initializePage();
  }, [isLoading, authToken, checkAdminAccess, user]);

  const fetchUsers = async (page = 1) => {
    try {
      // Validate auth state before making request
      if (!authToken) {
        const error = new Error('No auth token available');
        console.error('Auth validation failed:', {
          error: error.message,
          stack: error.stack,
          authState: {
            hasToken: false,
            userRole: user?.role,
            isAdmin,
            userId: user?.id
          }
        });
        toast.error('Authentication required');
        router.replace('/auth');
        return;
      }

      // Validate user state
      if (!user) {
        const error = new Error('No user data available');
        console.error('User validation failed:', {
          error: error.message,
          stack: error.stack,
          authState: {
            hasToken: !!authToken,
            tokenLength: authToken?.length,
            userRole: null,
            isAdmin: false
          }
        });
        toast.error('User session invalid');
        router.replace('/auth');
        return;
      }

      // Validate admin access
      const hasAdminAccess = checkAdminAccess();
      if (!hasAdminAccess) {
        const error = new Error('User does not have admin access');
        console.error('Admin access validation failed:', {
          error: error.message,
          stack: error.stack,
          authState: {
            hasToken: !!authToken,
            tokenLength: authToken?.length,
            userRole: user.role,
            isAdmin,
            userId: user.id,
            userEmail: user.email
          }
        });
        toast.error('Access denied. Admin privileges required.');
        router.replace('/dashboard');
        return;
      }

      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/users?page=${page}`;
      
      // Log request details
      console.log('Making users request:', {
        url: apiUrl,
        method: 'GET',
        auth: {
          hasToken: !!authToken,
          tokenLength: authToken?.length,
          userRole: user?.role,
          isAdmin,
          checkAdminAccess: checkAdminAccess()
        }
      });

      const response = await axios.get<PaginatedResponse>(apiUrl, {
        headers: { 
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('Users fetch response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });
      
      if (response.data.status === 'success') {
        setUsers(response.data.data.data);
        setCurrentPage(response.data.data.current_page);
        setTotalPages(response.data.data.last_page);
        setTotalUsers(response.data.data.total);
      } else {
        throw new Error('Failed to fetch users: Invalid response format');
      }
    } catch (error) {
      // Enhanced error logging
      const errorDetails = {
        // Basic error info
        name: error instanceof Error ? error.name : 'Unknown Error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        stack: error instanceof Error ? error.stack : undefined,
        
        // Axios specific info
        isAxiosError: axios.isAxiosError(error),
        axiosError: axios.isAxiosError(error) ? {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: {
              ...error.config?.headers,
              Authorization: '[REDACTED]'
            }
          }
        } : null,
        
        // Application state
        authState: {
          hasToken: !!authToken,
          tokenLength: authToken?.length,
          userRole: user?.role,
          isAdmin,
          userId: user?.id,
          userEmail: user?.email,
          checkAdminAccess: checkAdminAccess()
        }
      };

      console.error('Error fetching users:', errorDetails);

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
          console.error('403 Forbidden - Access denied:', {
            ...errorDetails,
            responseData: error.response?.data,
            requestConfig: {
              url: error.config?.url,
              method: error.config?.method,
              headers: {
                ...error.config?.headers,
                Authorization: '[REDACTED]'
              }
            }
          });

          // Additional validation of user state when 403 occurs
          if (!user) {
            console.error('403 occurred with no user data');
            router.replace('/auth');
            return;
          }

          if (user.role !== 'admin') {
            console.error('403 occurred with non-admin role:', user.role);
            router.replace('/dashboard');
            return;
          }

          toast.error('Access denied. Admin privileges required.');
          router.replace('/dashboard');
        } else {
          const errorMessage = error.response?.data?.message || 'Failed to fetch users';
          console.error('API request failed:', {
            ...errorDetails,
            errorMessage
          });
          toast.error(errorMessage);
        }
      } else {
        console.error('Non-Axios error occurred:', errorDetails);
        toast.error('An unexpected error occurred');
      }
    }
  };

  // Show loading state while initializing
  if (isLoading || isPageLoading) {
    return <Loading />;
  }

  // If we get here, we should have admin access
  console.log('Rendering user management page');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!authToken) {
        toast.error('Authentication required');
        router.replace('/auth');
        return;
      }

      // Generate a temporary password for new users
      const tempPassword = Math.random().toString(36).slice(-8);
      const userData = {
        ...formData,
        password: isEditing ? formData.password : tempPassword,
        password_confirmation: isEditing ? formData.password : tempPassword,
      };

      if (isEditing && formData.id) {
        // Update existing user
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/users/${formData.id}`,
          userData,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        toast.success('User updated successfully');
      } else {
        // Create new user
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/users`,
          userData,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );

        // Show the temporary password to the admin
        if (response.data.status === 'success') {
          Swal.fire({
            title: 'User Created Successfully',
            html: `
              <div class="text-left">
                <p class="mb-2">A new user has been created with the following credentials:</p>
                <p class="mb-1"><strong>Email:</strong> ${formData.email}</p>
                <p class="mb-1"><strong>Temporary Password:</strong> ${tempPassword}</p>
                <p class="mt-4 text-sm text-red-500">Please make sure to share these credentials securely with the user.</p>
                <p class="text-sm text-red-500">The user should change their password upon first login.</p>
              </div>
            `,
            icon: 'success',
            confirmButtonColor: 'var(--primary)',
          });
        }
      }
      resetForm();
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || 'Failed to save user';
        toast.error(message);
      } else {
        toast.error('Failed to save user');
      }
    }
  };

  const handleEdit = (user: User) => {
    setIsEditing(true);
    setFormData(user);
  };

  const handleDelete = async (id: number) => {
    try {
      if (user?.role !== 'admin') {
        toast.error('Access denied. Admin privileges required.');
        return;
      }

      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: 'var(--primary)',
        cancelButtonColor: 'var(--border-color)',
        confirmButtonText: 'Yes, delete it!'
      });

      if (result.isConfirmed) {
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        setUsers(users.filter(user => user.id !== id));
        Swal.fire('Deleted!', 'User has been deleted.', 'success');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
          toast.error('Access denied. Admin privileges required.');
        } else {
          console.error('Error deleting user:', error);
          toast.error('Failed to delete user');
        }
      }
    }
  };

  const handleStatusToggle = async (userToToggle: User) => {
    try {
      if (user?.role !== 'admin') {
        toast.error('Access denied. Admin privileges required.');
        return;
      }

      const newStatus = userToToggle.status === 'active' ? 'inactive' : 'active';
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${userToToggle.id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setUsers(users.map(u => u.id === userToToggle.id ? { ...u, status: newStatus } : u));
      toast.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
          toast.error('Access denied. Admin privileges required.');
        } else {
          console.error('Error updating user status:', error);
          toast.error('Failed to update user status');
        }
      }
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setFormData({
      name: '',
      email: '',
      role: 'user',
      status: 'active',
    });
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Add pagination controls component
  const PaginationControls = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => fetchUsers(i)}
          className={`px-3 py-1 rounded ${
            currentPage === i
              ? 'bg-[var(--primary)] text-white'
              : 'bg-[var(--card-bg)] text-[var(--text-muted)] hover:bg-[var(--primary)] hover:text-white'
          }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-[var(--text-muted)]">
          Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalUsers)} of {totalUsers} users
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fetchUsers(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded ${
              currentPage === 1
                ? 'bg-[var(--card-bg)] text-[var(--text-muted)] cursor-not-allowed'
                : 'bg-[var(--card-bg)] text-[var(--text-muted)] hover:bg-[var(--primary)] hover:text-white'
            }`}
          >
            Previous
          </button>
          {pages}
          <button
            onClick={() => fetchUsers(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded ${
              currentPage === totalPages
                ? 'bg-[var(--card-bg)] text-[var(--text-muted)] cursor-not-allowed'
                : 'bg-[var(--card-bg)] text-[var(--text-muted)] hover:bg-[var(--primary)] hover:text-white'
            }`}
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Manage Users</h1>
        <button
          onClick={resetForm}
          className="btn-primary"
        >
          Add New User
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border-color)] rounded-lg text-white placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
        />
        <svg
          className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Form */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">
          {isEditing ? 'Edit User' : 'Add New User'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border-color)] rounded-lg text-white placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border-color)] rounded-lg text-white placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">
              Role <span className="text-red-500">*</span>
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border-color)] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              required
            >
              <option value="user">Regular User</option>
              <option value="admin">Administrator</option>
            </select>
            {!isEditing && formData.role === 'admin' && (
              <p className="mt-1 text-sm text-yellow-500">
                Note: Creating an admin user will generate a temporary password that must be shared securely.
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border-color)] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              required
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 btn-primary"
            >
              {isEditing ? 'Update User' : 'Add User'}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-[var(--border-color)] rounded-lg text-[var(--text-muted)] hover:bg-[var(--card-bg)] hover:text-white transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-color)]">
                <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-muted)]">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-muted)]">Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-muted)]">Role</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-muted)]">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-muted)]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-[var(--card-bg)]">
                  <td className="px-4 py-3 text-white">{user.name}</td>
                  <td className="px-4 py-3 text-white">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleStatusToggle(user)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer ${
                        user.status === 'active'
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-1 text-[var(--primary)] hover:text-[var(--primary-hover)]"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => user.id && handleDelete(user.id)}
                        className="p-1 text-red-500 hover:text-red-600"
                        disabled={user.role === 'admin'} // Prevent deleting admin users
                        title={user.role === 'admin' ? 'Cannot delete admin users' : 'Delete user'}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-[var(--border-color)]">
          <PaginationControls />
        </div>
      </div>
    </div>
  );
} 