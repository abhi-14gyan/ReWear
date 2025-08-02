import React, { useState, useEffect } from 'react';
import { Users, Package, CheckCircle, XCircle, Trash2, TrendingUp, Activity } from 'lucide-react';
import axios from 'axios';
import { getImageUrlFull } from '../utils/imageUtils';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingItems, setPendingItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'pending') {
        const response = await axios.get('/api/admin/pending-items');
        setPendingItems(response.data);
      } else if (activeTab === 'users') {
        const response = await axios.get('/api/admin/users');
        setUsers(response.data);
      } else if (activeTab === 'stats') {
        const [statsRes, activityRes] = await Promise.all([
          axios.get('/api/admin/stats'),
          axios.get('/api/admin/activity')
        ]);
        setStats(statsRes.data);
        setActivity(activityRes.data);
      } else if (activeTab === 'admin-codes') {
        // Admin codes are handled in the UI
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
      console.error('Error response:', error.response);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveItem = async (itemId) => {
    try {
      await axios.put(`/api/admin/items/${itemId}/approve`);
      fetchData();
    } catch (error) {
      console.error('Error approving item:', error);
    }
  };

  const handleRejectItem = async (itemId) => {
    try {
      await axios.put(`/api/admin/items/${itemId}/reject`);
      fetchData();
    } catch (error) {
      console.error('Error rejecting item:', error);
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (window.confirm('Are you sure you want to remove this item?')) {
      try {
        await axios.delete(`/api/admin/items/${itemId}`);
        fetchData();
      } catch (error) {
        console.error('Error removing item:', error);
      }
    }
  };

  const handleUpdateUserPoints = async (userId, points) => {
    try {
      await axios.put(`/api/admin/users/${userId}/points`, { points });
      fetchData();
    } catch (error) {
      console.error('Error updating user points:', error);
    }
  };

  const handleToggleAdmin = async (userId) => {
    try {
      await axios.put(`/api/admin/users/${userId}/admin`);
      fetchData();
    } catch (error) {
      console.error('Error toggling admin status:', error);
    }
  };

  const tabs = [
    { id: 'pending', label: 'Pending Items', icon: Package },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'stats', label: 'Statistics', icon: TrendingUp },
    { id: 'admin-codes', label: 'Admin Codes', icon: Activity }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
        <p className="text-gray-600">Manage the ReWear platform</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div>
          {/* Pending Items */}
          {activeTab === 'pending' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Pending Items for Approval</h2>
              {pendingItems.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No pending items</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {pendingItems.map((item) => (
                    <div key={item.id} className="card p-6">
                      <div className="flex items-start space-x-4">
                        {item.images && (
                          <img
                            src={getImageUrlFull(item.images[0])}
                            alt={item.title}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                            <span>By: {item.uploaderName}</span>
                            <span>Category: {item.category}</span>
                            <span>Condition: {item.condition}</span>
                            <span>{item.points} points</span>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleApproveItem(item.id)}
                              className="btn-primary text-sm px-3 py-1 flex items-center space-x-1"
                            >
                              <CheckCircle size={14} />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleRejectItem(item.id)}
                              className="btn-outline text-sm px-3 py-1 flex items-center space-x-1"
                            >
                              <XCircle size={14} />
                              <span>Reject</span>
                            </button>
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 rounded-lg flex items-center space-x-1"
                            >
                              <Trash2 size={14} />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* User Management */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Points
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Items
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                          No users found
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              value={user.points}
                              onChange={(e) => handleUpdateUserPoints(user.id, parseInt(e.target.value))}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.itemCount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              user.isAdmin 
                                ? 'bg-purple-100 text-purple-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {user.isAdmin ? 'Admin' : 'User'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleToggleAdmin(user.id)}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Statistics */}
          {activeTab === 'stats' && (
            <div className="space-y-8">
              <h2 className="text-xl font-semibold text-gray-900">Platform Statistics</h2>
              
              {/* Stats Cards */}
              <div className="grid md:grid-cols-4 gap-6">
                <div className="card p-6 text-center">
                  <Users className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{stats.totalUsers || 0}</div>
                  <div className="text-sm text-gray-500">Total Users</div>
                </div>
                <div className="card p-6 text-center">
                  <Package className="w-8 h-8 text-secondary-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{stats.approvedItems || 0}</div>
                  <div className="text-sm text-gray-500">Approved Items</div>
                </div>
                <div className="card p-6 text-center">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{stats.completedSwaps || 0}</div>
                  <div className="text-sm text-gray-500">Completed Swaps</div>
                </div>
                <div className="card p-6 text-center">
                  <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{stats.totalPoints || 0}</div>
                  <div className="text-sm text-gray-500">Total Points</div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Activity size={20} />
                  <span>Recent Activity</span>
                </h3>
                {activity.length === 0 ? (
                  <p className="text-gray-500">No recent activity</p>
                ) : (
                  <div className="space-y-3">
                    {activity.slice(0, 10).map((item, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className={`w-2 h-2 rounded-full ${
                          item.type === 'item_created' ? 'bg-blue-500' : 'bg-green-500'
                        }`} />
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">{item.userName}</span>
                            {item.type === 'item_created' ? ' listed ' : ' completed swap for '}
                            <span className="font-medium">{item.title}</span>
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(item.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Admin Codes */}
          {activeTab === 'admin-codes' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Admin Approval Codes</h2>
              
              <div className="card p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Current Admin Code</h3>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        value="ADMIN2024"
                        readOnly
                        className="input-field font-mono text-lg"
                      />
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText('ADMIN2024')}
                      className="btn-primary"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Share this code with users who need admin access. They can use it during registration.
                  </p>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Generate New Code</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Admin Code
                      </label>
                      <input
                        type="text"
                        placeholder="Enter new admin code"
                        className="input-field"
                        id="newAdminCode"
                      />
                    </div>
                    <button
                      onClick={() => {
                        const newCode = document.getElementById('newAdminCode').value;
                        if (newCode.trim()) {
                          // Here you would typically make an API call to update the admin code
                          alert(`New admin code would be set to: ${newCode}`);
                        } else {
                          alert('Please enter a valid admin code');
                        }
                      }}
                      className="btn-secondary"
                    >
                      Update Admin Code
                    </button>
                  </div>
                </div>

                <div className="border-t pt-6 mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Admin Registration Instructions</h3>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <ol className="list-decimal list-inside space-y-2 text-sm text-blue-900">
                      <li>Share the current admin code with the person who needs admin access</li>
                      <li>They should go to the registration page and check "Register as Admin"</li>
                      <li>Enter the admin approval code in the provided field</li>
                      <li>Complete the registration process</li>
                      <li>The new user will have admin privileges immediately</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPanel; 