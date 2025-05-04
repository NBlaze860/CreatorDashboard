import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import toast from 'react-hot-toast';
import { User, CreditCard, Calendar, Edit2, Check } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { format } from 'date-fns';

interface UserProfileData {
  _id: string;
  username: string;
  email: string;
  role: string;
  bio: string;
  avatarUrl: string;
  profileCompleted: boolean;
  credits: {
    total: number;
    history: Array<{
      amount: number;
      reason: string;
      timestamp: string;
    }>;
  };
  lastLogin: string;
  createdAt: string;
}

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    avatarUrl: ''
  });
  
  // Fetch profile data
  const { data: profileData, isLoading, refetch } = useQuery<UserProfileData>(
    'userProfile',
    async () => {
      const res = await api.get('/users/profile');
      return res.data;
    }
  );
  
  // Set form data when profile data is loaded
  useEffect(() => {
    if (profileData) {
      setFormData({
        username: profileData.username,
        bio: profileData.bio || '',
        avatarUrl: profileData.avatarUrl || ''
      });
    }
  }, [profileData]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const res = await api.put('/users/profile', formData);
      updateUser(res.data.user);
      toast.success('Profile updated successfully');
      setEditing(false);
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };
  
  // Placeholder avatar URLs
  const avatarOptions = [
    'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200',
    'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=200',
    'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200',
    'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200'
  ];
  
  return (
    <Layout title="My Profile">
      <div className="max-w-4xl mx-auto">
        {isLoading ? (
          <div className="text-center py-10">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        ) : profileData ? (
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="h-12 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
              <div className="px-6 py-4 flex flex-col md:flex-row md:items-end gap-6">
                <div className="z-10">
                  {profileData.avatarUrl ? (
                    <img 
                      src={profileData.avatarUrl} 
                      alt={profileData.username} 
                      className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-md"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center border-4 border-white shadow-md">
                      <User className="h-12 w-12 text-blue-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{profileData.username}</h2>
                      <p className="text-gray-600">{profileData.email}</p>
                    </div>
                    <button
                      onClick={() => setEditing(!editing)}
                      className="flex items-center gap-x-1 text-sm bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700"
                    >
                      {editing ? (
                        <>
                          <Check className="h-4 w-4" />
                          <span>Done</span>
                        </>
                      ) : (
                        <>
                          <Edit2 className="h-4 w-4" />
                          <span>Edit Profile</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      <CreditCard className="h-3 w-3 mr-1" />
                      {profileData.credits.total} Credits
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      <Calendar className="h-3 w-3 mr-1" />
                      Joined {format(new Date(profileData.createdAt), 'MMMM yyyy')}
                    </span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      profileData.profileCompleted 
                        ? 'bg-green-50 text-green-700' 
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      {profileData.profileCompleted ? 'Profile Complete' : 'Profile Incomplete'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Profile Details */}
            {editing ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Profile</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Tell us about yourself..."
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Complete your bio to earn 20 credits!
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Profile Picture
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {avatarOptions.map((avatar, index) => (
                        <div 
                          key={index}
                          onClick={() => setFormData({ ...formData, avatarUrl: avatar })}
                          className={`relative cursor-pointer rounded-md overflow-hidden transition-all ${
                            formData.avatarUrl === avatar ? 'ring-4 ring-blue-500' : 'hover:opacity-80'
                          }`}
                        >
                          <img 
                            src={avatar} 
                            alt={`Avatar option ${index + 1}`} 
                            className="w-full h-auto"
                          />
                          {formData.avatarUrl === avatar && (
                            <div className="absolute bottom-1 right-1 bg-blue-600 rounded-full p-1">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      Choose a profile picture to earn additional credits!
                    </p>
                  </div>
                  
                  <div className="pt-4 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">About</h3>
                <p className="text-gray-700 whitespace-pre-line">
                  {profileData.bio || 'No bio provided yet.'}
                </p>
                
                {!profileData.bio && !profileData.avatarUrl && (
                  <div className="mt-4 p-4 bg-blue-50 text-blue-800 rounded-md">
                    <p className="font-medium">Complete your profile to earn 20 credits!</p>
                    <p className="mt-1 text-sm">Add a bio and profile picture to earn additional credits.</p>
                    <button
                      onClick={() => setEditing(true)}
                      className="mt-2 text-sm bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700"
                    >
                      Complete Profile
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* Credit History */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Credit History</h3>
              
              {profileData.credits.history && profileData.credits.history.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {profileData.credits.history.map((transaction, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {format(new Date(transaction.timestamp), 'MMM d, yyyy')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {transaction.reason}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                            transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No credit transactions yet.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-600">Error loading profile data</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Profile;