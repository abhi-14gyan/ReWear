import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ChevronLeft, ChevronRight, User, Calendar, Tag, Heart, Coins } from 'lucide-react';
import axios from 'axios';

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [swapType, setSwapType] = useState('swap');
  const [pointsOffered, setPointsOffered] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchItem();
  }, [id]);

  const fetchItem = async () => {
    try {
      const response = await axios.get(`/api/items/${id}`);
      setItem(response.data);
    } catch (error) {
      setError('Item not found');
    } finally {
      setLoading(false);
    }
  };

  const handleSwapRequest = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (swapType === 'points' && (!pointsOffered || pointsOffered <= 0)) {
      setError('Please enter a valid points amount');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await axios.post('/api/swaps', {
        itemId: item.id,
        type: swapType,
        pointsOffered: swapType === 'points' ? parseInt(pointsOffered) : 0
      });

      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'Error creating swap request');
    } finally {
      setSubmitting(false);
    }
  };

  const nextImage = () => {
    if (item.images && item.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % item.images.length);
    }
  };

  const prevImage = () => {
    if (item.images && item.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + item.images.length) % item.images.length);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Item Not Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/browse')}
            className="btn-primary"
          >
            Back to Browse
          </button>
        </div>
      </div>
    );
  }

  const images = item.images || [];
  const isOwnItem = user && item.uploaderId === user.id;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid lg:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="relative">
            {images.length > 0 ? (
              <img
                src={`/uploads/${images[currentImageIndex]}`}
                alt={item.title}
                className="w-full h-96 object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-400">No image available</span>
              </div>
            )}
            
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 rounded-full p-2 hover:bg-opacity-100"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 rounded-full p-2 hover:bg-opacity-100"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden ${
                    index === currentImageIndex ? 'ring-2 ring-primary-500' : ''
                  }`}
                >
                  <img
                    src={`/uploads/${image}`}
                    alt={`${item.title} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Item Information */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{item.title}</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
              <div className="flex items-center space-x-1">
                <User size={16} />
                <span>{item.uploaderName}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar size={16} />
                <span>{new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-primary-600">{item.points} points</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                item.isAvailable 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {item.isAvailable ? 'Available' : 'Not Available'}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600">{item.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-500">Category</span>
                <p className="text-gray-900">{item.category}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Type</span>
                <p className="text-gray-900">{item.type}</p>
              </div>
              {item.size && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Size</span>
                  <p className="text-gray-900">{item.size}</p>
                </div>
              )}
              <div>
                <span className="text-sm font-medium text-gray-500">Condition</span>
                <p className="text-gray-900">{item.condition}</p>
              </div>
            </div>

            {item.tags && (
              <div>
                <span className="text-sm font-medium text-gray-500 flex items-center space-x-1 mb-2">
                  <Tag size={16} />
                  <span>Tags</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {item.tags.split(',').map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Swap Options */}
          {!isOwnItem && item.isAvailable && (
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Request This Item</h3>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="swap"
                      checked={swapType === 'swap'}
                      onChange={(e) => setSwapType(e.target.value)}
                      className="text-primary-600"
                    />
                    <span>Direct Swap</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="points"
                      checked={swapType === 'points'}
                      onChange={(e) => setSwapType(e.target.value)}
                      className="text-primary-600"
                    />
                    <span>Redeem with Points</span>
                  </label>
                </div>

                {swapType === 'points' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Points to Offer
                    </label>
                    <div className="relative">
                      <Coins className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="number"
                        value={pointsOffered}
                        onChange={(e) => setPointsOffered(e.target.value)}
                        className="input-field pl-10"
                        placeholder="Enter points amount"
                        min="1"
                        max={user?.points || 0}
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Your balance: {user?.points || 0} points
                    </p>
                  </div>
                )}

                <button
                  onClick={handleSwapRequest}
                  disabled={submitting || (swapType === 'points' && (!pointsOffered || pointsOffered <= 0))}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    `Request ${swapType === 'swap' ? 'Swap' : 'Redemption'}`
                  )}
                </button>
              </div>
            </div>
          )}

          {isOwnItem && (
            <div className="card p-6 bg-blue-50 border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Your Item</h3>
              <p className="text-blue-700">
                This is your item. You can view swap requests in your dashboard.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;