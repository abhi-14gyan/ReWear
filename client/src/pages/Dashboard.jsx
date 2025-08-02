import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { User, Package, Clock, CheckCircle, XCircle, Plus, Edit, Sun, Moon } from 'lucide-react';
import axios from 'axios';
import { getImageUrlFull } from '../utils/imageUtils';

const Dashboard = () => {
  const { user, updateProfile } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [userItems, setUserItems] = useState([]);
  const [swapRequests, setSwapRequests] = useState([]);
  const [swapHistory, setSwapHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [itemsRes, requestsRes, historyRes] = await Promise.all([
        axios.get(`/api/users/${user.id}/items`),
        axios.get('/api/swaps/my-items'),
        axios.get('/api/swaps/history')
      ]);

      setUserItems(itemsRes.data);
      setSwapRequests(requestsRes.data);
      setSwapHistory(historyRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNameUpdate = async () => {
    try {
      const result = await updateProfile(newName);
      if (result.success) {
        setEditingName(false);
      }
    } catch (error) {
      console.error('Error updating name:', error);
    }
  };

  const handleAcceptSwap = async (swapId) => {
    try {
      await axios.put(`/api/swaps/${swapId}/accept`);
      fetchDashboardData();
    } catch (error) {
      console.error('Error accepting swap:', error);
    }
  };

  const handleRejectSwap = async (swapId) => {
    try {
      await axios.put(`/api/swaps/${swapId}/reject`);
      fetchDashboardData();
    } catch (error) {
      console.error('Error rejecting swap:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with Theme Toggle */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      {/* Profile Section */}
      <div className="card p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              {editingName ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="input-field w-48"
                  />
                  <button
                    onClick={handleNameUpdate}
                    className="btn-primary text-sm px-3 py-1"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingName(false);
                      setNewName(user?.name || '');
                    }}
                    className="btn-outline text-sm px-3 py-1"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user?.name}</h1>
                  <button
                    onClick={() => setEditingName(true)}
                    className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
                  >
                    <Edit size={16} />
                  </button>
                </div>
              )}
              <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">{user?.points}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Points Balance</div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* My Items Section */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
              <Package className="w-5 h-5" />
              <span>My Items</span>
            </h2>
            <Link to="/add-item" className="btn-primary text-sm flex items-center space-x-1">
              <Plus size={16} />
              <span>Add Item</span>
            </Link>
          </div>
          
          {userItems.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">You haven't listed any items yet</p>
              <Link to="/add-item" className="btn-primary">
                List Your First Item
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  <strong>Note:</strong> New items require admin approval before they appear in the marketplace. 
                  You can see the status of your items below.
                </p>
              </div>
              <div className="space-y-4">
              {userItems.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  {item.images && item.images.length > 0 && (
                    <img 
                      src={getImageUrlFull(item.images[0])}
                      alt={item.title}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">{item.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.status === 'approved' 
                          ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400' 
                          : item.status === 'pending'
                          ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400'
                          : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.category} • {item.condition}</p>
                    <p className="text-sm text-primary-600 dark:text-primary-400">{item.points} points</p>
                  </div>
                  <Link 
                    to={`/item/${item.id}`}
                    className="btn-outline text-sm px-3 py-1"
                  >
                    View
                  </Link>
                </div>
              ))}
              {userItems.length > 5 && (
                <div className="text-center">
                  <Link to="/browse" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm">
                    View all {userItems.length} items
                  </Link>
                </div>
              )}
              </div>
            </>
          )}
        </div>

        {/* Pending Swap Requests */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Pending Requests</span>
          </h2>
          
          {swapRequests.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No pending swap requests</p>
            </div>
          ) : (
            <div className="space-y-4">
              {swapRequests.map((swap) => (
                <div key={swap.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900 dark:text-white">{swap.itemTitle}</h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{swap.type}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Requested by: {swap.requesterName}
                  </p>
                  {swap.pointsOffered > 0 && (
                    <p className="text-sm text-primary-600 dark:text-primary-400 mb-3">
                      Points offered: {swap.pointsOffered}
                    </p>
                  )}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleAcceptSwap(swap.id)}
                      className="btn-primary text-sm px-3 py-1 flex items-center space-x-1"
                    >
                      <CheckCircle size={14} />
                      <span>Accept</span>
                    </button>
                    <button
                      onClick={() => handleRejectSwap(swap.id)}
                      className="btn-outline text-sm px-3 py-1 flex items-center space-x-1"
                    >
                      <XCircle size={14} />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Swap History */}
      <div className="card p-6 mt-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Recent Activity</h2>
        
        {swapHistory.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No swap history yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {swapHistory.slice(0, 10).map((swap) => (
              <div key={swap.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center space-x-4">
                  {swap.itemImages && swap.itemImages.length > 0 && (
                    <img 
                      src={getImageUrlFull(swap.itemImages[0])}
                      alt={swap.itemTitle}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                  )}
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{swap.itemTitle}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {swap.requesterName} ↔ {swap.ownerName}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(swap.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    swap.status === 'accepted' 
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400' 
                      : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400'
                  }`}>
                    {swap.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;