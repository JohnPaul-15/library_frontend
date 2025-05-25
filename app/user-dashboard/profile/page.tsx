import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const UserProfilePage: React.FC = () => {
  const [user, setUser] = useState({});
  const [formData, setFormData] = useState({});
  const [passwordData, setPasswordData] = useState({});
  const [authToken] = useState(''); // Replace with actual auth token

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/user/profile`,
        formData,
        {
          headers: { 
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      if (response.data.success) {
        toast.success('Profile updated successfully!');
        setUser(response.data.data);
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        if (errors) {
          Object.values(errors).forEach((error: any) => {
            toast.error(error[0]);
          });
        } else {
          toast.error(error.response.data.message || 'Failed to update profile');
        }
      } else {
        toast.error('Failed to update profile. Please try again.');
      }
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/user/change-password`,
        passwordData,
        {
          headers: { 
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      if (response.data.success) {
        toast.success('Password changed successfully!');
        setPasswordData({
          current_password: '',
          new_password: '',
          new_password_confirmation: '',
        });
      }
    } catch (error: any) {
      console.error('Error changing password:', error);
      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        if (errors) {
          Object.values(errors).forEach((error: any) => {
            toast.error(error[0]);
          });
        } else {
          toast.error(error.response.data.message || 'Failed to change password');
        }
      } else {
        toast.error('Failed to change password. Please try again.');
      }
    }
  };

  return (
    <div>
      {/* Render your form components here */}
    </div>
  );
};

export default UserProfilePage; 