import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowRight, Heart, Users, TrendingUp, Star } from 'lucide-react';
import axios from 'axios';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const [featuredItems, setFeaturedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedItems = async () => {
      try {
        const response = await axios.get('/api/items/featured');
        setFeaturedItems(response.data);
      } catch (error) {
        console.error('Error fetching featured items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedItems();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Sustainable Fashion
              <span className="text-primary-600"> Starts Here</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Join our community of fashion enthusiasts who believe in reducing waste through clothing exchange. 
              Swap your unused garments or redeem them with points.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/browse" 
                    className="btn-primary text-lg px-8 py-3 flex items-center justify-center space-x-2"
                  >
                    <span>Start Swapping</span>
                    <ArrowRight size={20} />
                  </Link>
                  <Link 
                    to="/add-item" 
                    className="btn-secondary text-lg px-8 py-3"
                  >
                    List an Item
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    to="/register" 
                    className="btn-primary text-lg px-8 py-3 flex items-center justify-center space-x-2"
                  >
                    <span>Get Started</span>
                    <ArrowRight size={20} />
                  </Link>
                  <Link 
                    to="/browse" 
                    className="btn-outline text-lg px-8 py-3"
                  >
                    Browse Items
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose ReWear?
            </h2>
            <p className="text-lg text-gray-600">
              Join thousands of users who are making fashion sustainable
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Sustainable Fashion
              </h3>
              <p className="text-gray-600">
                Reduce textile waste by giving your clothes a second life through our community exchange platform.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-secondary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Community Driven
              </h3>
              <p className="text-gray-600">
                Connect with fashion enthusiasts in your area and build meaningful relationships through clothing swaps.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Point System
              </h3>
              <p className="text-gray-600">
                Earn points by listing items and redeem them for clothing you love. A fair and transparent system.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Items Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Featured Items
            </h2>
            <p className="text-lg text-gray-600">
              Discover amazing pieces from our community
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredItems.map((item) => (
                <div key={item.id} className="card overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-w-16 aspect-h-12 bg-gray-200">
                    {item.images && (
                      <img 
                        src={`/uploads/${item.images.split(',')[0]}`}
                        alt={item.title}
                        className="w-full h-48 object-cover"
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{item.uploaderName}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{item.category} • {item.condition}</span>
                      <span className="text-primary-600 font-medium">{item.points} pts</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link 
              to="/browse" 
              className="btn-primary text-lg px-8 py-3 flex items-center justify-center space-x-2 mx-auto w-fit"
            >
              <span>View All Items</span>
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">1000+</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-secondary-600 mb-2">500+</div>
              <div className="text-gray-600">Items Listed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">200+</div>
              <div className="text-gray-600">Successful Swaps</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">50K+</div>
              <div className="text-gray-600">Points Exchanged</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Join the Movement?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Start your sustainable fashion journey today
          </p>
          {!isAuthenticated && (
            <Link 
              to="/register" 
              className="bg-white text-primary-600 font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors inline-flex items-center space-x-2"
            >
              <span>Create Account</span>
              <ArrowRight size={20} />
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default LandingPage; 