import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Star, BookOpen, Zap, ArrowUp, TrendingUp } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { format } from 'date-fns';

interface CreditHistoryItem {
  amount: number;
  reason: string;
  timestamp: string;
}

interface ActivityData {
  creditHistory: CreditHistoryItem[];
  lastLogin: string;
  profileCompleted: boolean;
}

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<ActivityData | null>(null);
  const [savedFeeds, setSavedFeeds] = useState([]);
  
  // Fetch user activity data
  const { data: activityData, isLoading: isLoadingActivity } = useQuery(
    'userActivity',
    async () => {
      const response = await api.get(`/users/${user?.id}/activity`);
      return response.data;
    },
    {
      enabled: !!user,
      onSuccess: (data) => {
        setActivity(data);
      }
    }
  );
  
  // Fetch saved feeds
  const { data: savedFeedsData, isLoading: isLoadingSaved } = useQuery(
    'savedFeeds',
    async () => {
      const response = await api.get('/users/saved-feeds');
      return response.data;
    },
    {
      enabled: !!user,
      onSuccess: (data) => {
        setSavedFeeds(data);
      }
    }
  );
  
  // Stats cards data
  const statsCards = [
    {
      title: 'Total Credits',
      value: user?.credits || 0,
      icon: <CreditCard className="h-6 w-6 text-blue-500" />,
      change: '+25 this week',
      color: 'bg-blue-50 text-blue-700'
    },
    {
      title: 'Profile Status',
      value: user?.profileCompleted ? 'Complete' : 'Incomplete',
      icon: <Star className="h-6 w-6 text-amber-500" />,
      change: user?.profileCompleted ? '+20 credits earned' : 'Complete for +20 credits',
      color: 'bg-amber-50 text-amber-700'
    },
    {
      title: 'Saved Content',
      value: savedFeeds?.length || 0,
      icon: <BookOpen className="h-6 w-6 text-emerald-500" />,
      change: 'Items in your library',
      color: 'bg-emerald-50 text-emerald-700'
    },
    {
      title: 'Login Streak',
      value: '3 days',
      icon: <Zap className="h-6 w-6 text-purple-500" />,
      change: 'Keep it up!',
      color: 'bg-purple-50 text-purple-700'
    }
  ];
  
  return (
    <Layout title="Dashboard">
      <div className="space-y-6">
        {/* Welcome Message */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white shadow-md">
          <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.username}!</h2>
          <p className="opacity-90">
            You have {user?.credits} credits in your account. Interact with the feed to earn more!
          </p>
          <button
            onClick={() => navigate('/feed')}
            className="mt-4 bg-white text-blue-600 hover:bg-blue-50 transition-colors px-4 py-2 rounded-lg font-medium shadow-sm"
          >
            Explore Feed
          </button>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((card, index) => (
            <div key={index} className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-medium text-gray-500">{card.title}</h3>
                  <span className="p-1.5 rounded-full bg-gray-50">{card.icon}</span>
                </div>
                <div className="flex items-baseline">
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
                <div className={`flex items-center mt-2 text-xs font-medium ${card.color} px-2 py-1 rounded-full inline-block`}>
                  <ArrowUp className="h-3 w-3 mr-1" />
                  {card.change}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Recent Activity and Saved Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="border-b border-gray-200 p-4">
              <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
            </div>
            <div className="p-4 h-64 overflow-y-auto">
              {isLoadingActivity ? (
                <p className="text-gray-500 text-center py-4">Loading activity...</p>
              ) : activity?.creditHistory && activity.creditHistory.length > 0 ? (
                <ul className="space-y-3">
                  {activity.creditHistory.slice(0, 5).map((item, index) => (
                    <li key={index} className="flex items-start gap-x-3 px-3 py-2 hover:bg-gray-50 rounded-md">
                      <div className={`p-1.5 rounded-full ${item.amount > 0 ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
                        {item.amount > 0 ? <TrendingUp className="h-4 w-4" /> : <ArrowUp className="h-4 w-4 transform rotate-180" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{item.reason}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(item.timestamp).toLocaleDateString()} • {item.amount > 0 ? '+' : ''}{item.amount} credits
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-center py-4">No recent activity</p>
              )}
            </div>
          </div>
          
          {/* Recent Saved Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="border-b border-gray-200 p-4 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Saved Content</h3>
              <button
                onClick={() => navigate('/saved')}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                View all
              </button>
            </div>
            <div className="p-4 h-64 overflow-y-auto">
              {isLoadingSaved ? (
                <p className="text-gray-500 text-center py-4">Loading saved content...</p>
              ) : savedFeeds && savedFeeds.length > 0 ? (
                <ul className="space-y-3">
                  {savedFeeds.slice(0, 3).map((feed: any) => (
                    <li key={feed._id} className="p-3 hover:bg-gray-50 rounded-md border border-gray-100">
                      <div className="flex items-start gap-x-3">
                        <span className={`p-1 rounded ${feed.source === 'twitter' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                          {feed.source === 'twitter' ? 'Twitter' : 'Reddit'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {feed.content.substring(0, 50)}...
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            By {feed.author.name} • {format(new Date(feed.timestamp), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No saved content yet</p>
                  <button
                    onClick={() => navigate('/feed')}
                    className="mt-3 text-sm text-blue-600 hover:text-blue-800"
                  >
                    Explore the feed to save content
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserDashboard;