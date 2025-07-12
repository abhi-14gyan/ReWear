import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Package, Clock, CheckCircle, XCircle, Plus, Edit } from 'lucide-react';
import axios from 'axios';

const Dashboard = () => {
  const { user, updateProfile } = useAuth();
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
                  <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
                  <button
                    onClick={() => setEditingName(true)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Edit size={16} />
                  </button>
                </div>
              )}
              <p className="text-gray-600">{user?.email}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary-600">{user?.points}</div>
            <div className="text-sm text-gray-500">Points Balance</div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* My Items Section */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
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
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">You haven't listed any items yet</p>
              <Link to="/add-item" className="btn-primary">
                List Your First Item
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {userItems.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                  {item.images && (
                    <img 
                      src={`/uploads/${item.images.split(',')[0]}`}
                      alt={item.title}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-500">{item.category} • {item.condition}</p>
                    <p className="text-sm text-primary-600">{item.points} points</p>
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
                  <Link to="/browse" className="text-primary-600 hover:text-primary-700 text-sm">
                    View all {userItems.length} items
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pending Swap Requests */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Pending Requests</span>
          </h2>
          
          {swapRequests.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No pending swap requests</p>
            </div>
          ) : (
            <div className="space-y-4">
              {swapRequests.map((swap) => (
                <div key={swap.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{swap.itemTitle}</h3>
                    <span className="text-sm text-gray-500">{swap.type}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Requested by: {swap.requesterName}
                  </p>
                  {swap.pointsOffered > 0 && (
                    <p className="text-sm text-primary-600 mb-3">
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
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
        
        {swapHistory.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No swap history yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {swapHistory.slice(0, 10).map((swap) => (
              <div key={swap.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  {swap.itemImages && (
                    <img 
                      src={`/uploads/${swap.itemImages.split(',')[0]}`}
                      alt={swap.itemTitle}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                  )}
                  <div>
                    <h3 className="font-medium text-gray-900">{swap.itemTitle}</h3>
                    <p className="text-sm text-gray-500">
                      {swap.requesterName} ↔ {swap.ownerName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(swap.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    swap.status === 'accepted' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
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