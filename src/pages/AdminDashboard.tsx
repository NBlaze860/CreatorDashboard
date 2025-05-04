import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Users, AlertCircle, ArrowUp, User, CreditCard, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import api from '../utils/api';
import { format } from 'date-fns';

interface UserData {
  _id: string;
  username: string;
  email: string;
  role: string;
  profileCompleted: boolean;
  lastLogin: string;
  credits: {
    total: number;
  };
  createdAt: string;
}

interface ReportedFeed {
  _id: string;
  source: string;
  content: string;
  author: {
    name: string;
  };
  url: string;
  reportedBy: Array<{
    user: {
      username: string;
      email: string;
    };
    reason: string;
    timestamp: string;
  }>;
}

const AdminDashboard: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [creditAmount, setCreditAmount] = useState('10');
  const [creditReason, setCreditReason] = useState('Admin bonus');
  const [showCreditModal, setShowCreditModal] = useState(false);
  
  // Fetch all users
  const { data: users, isLoading: loadingUsers, refetch: refetchUsers } = useQuery<UserData[]>(
    'allUsers',
    async () => {
      const response = await api.get('/users');
      return response.data;
    }
  );
  
  // Fetch reported content
  const { data: reportedContent, isLoading: loadingReported, refetch: refetchReported } = useQuery<ReportedFeed[]>(
    'reportedContent',
    async () => {
      const response = await api.get('/feeds/reported');
      return response.data;
    }
  );
  
  // Handle adding credits
  const handleAddCredits = async () => {
    if (!selectedUser) return;
    
    try {
      await api.post('/credits/add', {
        userId: selectedUser._id,
        amount: parseInt(creditAmount),
        reason: creditReason
      });
      
      toast.success(`Credits added to ${selectedUser.username}'s account`);
      setShowCreditModal(false);
      refetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add credits');
    }
  };
  
  // Open credit modal
  const openCreditModal = (user: UserData) => {
    setSelectedUser(user);
    setCreditAmount('10');
    setCreditReason('Admin bonus');
    setShowCreditModal(true);
  };
  
  return (
    <Layout title="Admin Dashboard">
      <div className="space-y-6">
        {/* Admin Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
              <span className="p-1.5 rounded-full bg-indigo-50">
                <Users className="h-5 w-5 text-indigo-500" />
              </span>
            </div>
            <div className="flex items-baseline">
              <p className="text-2xl font-bold text-gray-900">{users?.length || 0}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-medium text-gray-500">Incomplete Profiles</h3>
              <span className="p-1.5 rounded-full bg-amber-50">
                <User className="h-5 w-5 text-amber-500" />
              </span>
            </div>
            <div className="flex items-baseline">
              <p className="text-2xl font-bold text-gray-900">
                {users?.filter(user => !user.profileCompleted).length || 0}
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-medium text-gray-500">Reported Content</h3>
              <span className="p-1.5 rounded-full bg-red-50">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </span>
            </div>
            <div className="flex items-baseline">
              <p className="text-2xl font-bold text-gray-900">{reportedContent?.length || 0}</p>
            </div>
          </div>
        </div>
        
        {/* User Management */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200 p-4 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">User Management</h3>
            <button
              onClick={() => refetchUsers()}
              className="flex items-center gap-x-1 text-blue-600 hover:text-blue-800"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            {loadingUsers ? (
              <div className="text-center py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                <p className="mt-4 text-gray-600">Loading users...</p>
              </div>
            ) : users && users.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Credits
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-500" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.username} {user.role === 'admin' && <span className="ml-1 text-xs text-blue-600">(Admin)</span>}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.profileCompleted 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {user.profileCompleted ? 'Complete' : 'Incomplete'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.credits.total}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(user.createdAt), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(user.lastLogin), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openCreditModal(user)}
                          className="text-blue-600 hover:text-blue-900 flex items-center gap-x-1 justify-end"
                        >
                          <CreditCard className="h-4 w-4" />
                          <span>Add Credits</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No users found</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Reported Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200 p-4 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Reported Content</h3>
            <button
              onClick={() => refetchReported()}
              className="flex items-center gap-x-1 text-blue-600 hover:text-blue-800"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
          <div className="p-4">
            {loadingReported ? (
              <div className="text-center py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                <p className="mt-4 text-gray-600">Loading reported content...</p>
              </div>
            ) : reportedContent && reportedContent.length > 0 ? (
              <div className="space-y-4">
                {reportedContent.map((feed) => (
                  <div key={feed._id} className="border border-red-100 bg-red-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs font-semibold">
                          Reported {feed.reportedBy.length} times
                        </span>
                        <span className="ml-2 text-sm text-gray-600">From {feed.source}</span>
                      </div>
                      <a 
                        href={feed.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        View original
                      </a>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-gray-800 whitespace-pre-line">
                        {feed.content.length > 200 
                          ? `${feed.content.substring(0, 200)}...` 
                          : feed.content}
                      </p>
                    </div>
                    
                    <div className="border-t border-red-100 pt-3">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Report Details:</h4>
                      <ul className="space-y-2">
                        {feed.reportedBy.map((report, index) => (
                          <li key={index} className="text-sm bg-white p-2 rounded border border-red-100">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{report.user.username}</span>
                              <span className="text-gray-500 text-xs">{format(new Date(report.timestamp), 'MMM d, yyyy')}</span>
                            </div>
                            <p className="mt-1 text-gray-700">Reason: {report.reason}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No reported content found</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Add Credits Modal */}
      {showCreditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Add Credits to {selectedUser.username}'s Account
            </h3>
            <p className="text-gray-600 mb-4">
              Current balance: <span className="font-medium">{selectedUser.credits.total} credits</span>
            </p>
            
            <div className="mb-4">
              <label htmlFor="creditAmount" className="block text-sm font-medium text-gray-700 mb-1">
                Amount to Add
              </label>
              <input
                type="number"
                id="creditAmount"
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="creditReason" className="block text-sm font-medium text-gray-700 mb-1">
                Reason
              </label>
              <input
                type="text"
                id="creditReason"
                value={creditReason}
                onChange={(e) => setCreditReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCreditModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCredits}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Credits
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AdminDashboard;