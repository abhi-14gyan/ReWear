import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowRight, Heart, Users, TrendingUp, Star, Search } from 'lucide-react';
import axios from 'axios';

// Categories matching BrowseItems types
const categories = [
  { name: 'Casual', icon: <Users className="w-6 h-6" /> },
  { name: 'Formal', icon: <Heart className="w-6 h-6" /> },
  { name: 'Sportswear', icon: <Star className="w-6 h-6" /> },
  { name: 'Vintage', icon: <TrendingUp className="w-6 h-6" /> },
  { name: 'Designer', icon: <TrendingUp className="w-6 h-6" /> },
  { name: 'School Dresses', icon: <TrendingUp className="w-6 h-6" /> },
];

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const [featuredItems, setFeaturedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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

  // Carousel logic (simple manual carousel for now)
  const [carouselIdx, setCarouselIdx] = useState(0);
  const carouselItems = featuredItems.slice(0, 5); // Show up to 5 in carousel
  const nextCarousel = () => setCarouselIdx((prev) => (prev + 1) % carouselItems.length);
  const prevCarousel = () => setCarouselIdx((prev) => (prev - 1 + carouselItems.length) % carouselItems.length);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header/Search Bar */}
      <div className="w-full bg-gray-900 py-4 px-4 flex flex-col md:flex-row items-center gap-4 justify-between">
        <div className="text-2xl font-bold tracking-tight">ReWear</div>
        <div className="flex-1 max-w-xl w-full relative">
          <input
            type="text"
            className="input-field pl-10 bg-gray-800 text-white border-gray-700 placeholder-gray-400"
            placeholder="Search for items, brands, or categories..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>
        <div className="flex gap-2 mt-2 md:mt-0">
          {isAuthenticated ? (
            <>
              <Link to="/browse" className="btn-primary">Start Swapping</Link>
              <Link to="/add-item" className="btn-secondary">List an Item</Link>
            </>
          ) : (
            <>
              <Link to="/register" className="btn-primary">Get Started</Link>
              <Link to="/browse" className="btn-outline text-gray-400">Browse Items</Link>
            </>
          )}
        </div>
      </div>

      {/* Carousel/Banner */}
      <section className="w-full bg-gray-800 py-8 flex flex-col items-center">
        <div className="w-full max-w-4xl relative">
          {loading || carouselItems.length === 0 ? (
            <div className="h-64 flex items-center justify-center bg-gray-700 rounded-lg animate-pulse">Images</div>
          ) : (
            <div className="relative h-64 rounded-lg overflow-hidden">
              <img
                src={`/uploads/${carouselItems[carouselIdx].images?.split(',')[0]}`}
                alt={carouselItems[carouselIdx].title}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-4">
                <h3 className="text-xl font-bold">{carouselItems[carouselIdx].title}</h3>
                <p className="text-sm">{carouselItems[carouselIdx].category} • {carouselItems[carouselIdx].condition}</p>
              </div>
              {carouselItems.length > 1 && (
                <>
                  <button onClick={prevCarousel} className="absolute left-2 top-1/2 -translate-y-1/2 bg-gray-900 bg-opacity-60 rounded-full p-2 text-white hover:bg-opacity-90">&#8592;</button>
                  <button onClick={nextCarousel} className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-900 bg-opacity-60 rounded-full p-2 text-white hover:bg-opacity-90">&#8594;</button>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 bg-black">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6 text-center">Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((cat, idx) => (
              <Link
                to={`/browse?type=${encodeURIComponent(cat.name)}`}
                key={cat.name}
                className="bg-gray-800 hover:bg-primary-700 transition-colors rounded-lg flex flex-col items-center justify-center p-6 shadow-md border border-gray-700 group"
              >
                <div className="mb-2 text-primary-400 group-hover:text-white">{cat.icon}</div>
                <div className="font-semibold text-lg group-hover:text-white">{cat.name}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Product Listings Section */}
      <section className="py-12 bg-gray-900">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6 text-center">Product Listings</h2>
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredItems.map((item) => (
                <div key={item.id} className="card bg-gray-800 border-gray-700 text-white overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
                  <div className="aspect-w-16 aspect-h-12 bg-gray-700 flex items-center justify-center">
                    {item.images ? (
                      <img
                        src={`/uploads/${item.images.split(',')[0]}`}
                        alt={item.title}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 flex items-center justify-center text-gray-500">No Image</div>
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                      <p className="text-sm text-gray-400 mb-1">{item.uploaderName}</p>
                      <span className="text-xs text-gray-400">{item.category} • {item.condition}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-primary-400 font-medium">{item.points} pts</span>
                      <Link to={`/item/${item.id}`} className="btn-outline text-xs py-1 px-3">View</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="text-center mt-10">
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
    </div>
  );
};

export default LandingPage;