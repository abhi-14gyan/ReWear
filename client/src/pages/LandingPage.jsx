import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { ArrowRight, Heart, Users, TrendingUp, Star, Search, Sun, Moon } from 'lucide-react';
import api from '../config/axios';
import { getImageUrlFull } from '../utils/imageUtils';

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
  const { isDarkMode, toggleTheme } = useTheme();
  const [featuredItems, setFeaturedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchFeaturedItems = async () => {
      try {
        const response = await api.get('/api/items/featured');
        setFeaturedItems(response.data);
      } catch (error) {
        console.error('Error fetching featured items:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedItems();
  }, []);

  // Carousel logic with auto-switching
  const [carouselIdx, setCarouselIdx] = useState(0);
  const carouselItems = featuredItems.slice(0, 5); // Show up to 5 in carousel
  const nextCarousel = () => setCarouselIdx((prev) => (prev + 1) % carouselItems.length);
  const prevCarousel = () => setCarouselIdx((prev) => (prev - 1 + carouselItems.length) % carouselItems.length);

  // Auto-switch carousel images every 2.5 seconds
  useEffect(() => {
    if (carouselItems.length <= 1) return; // Don't auto-switch if only one item

    const interval = setInterval(() => {
      setCarouselIdx((prev) => (prev + 1) % carouselItems.length);
    }, 2500); // Switch every 2.5 seconds

    return () => clearInterval(interval);
  }, [carouselItems.length]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-200">
      {/* Header/Search Bar */}
      <div className="w-full bg-white dark:bg-gray-800 py-4 px-4 flex flex-col md:flex-row items-center gap-4 justify-between border-b border-gray-200 dark:border-gray-700">
        <div className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">ReWear</div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {isAuthenticated ? (
              <>
                <Link to="/browse" className="btn-primary text-center">Start Swapping</Link>
                <Link to="/add-item" className="btn-secondary text-center">List an Item</Link>
              </>
            ) : (
              <>
                <Link to="/register" className="btn-primary text-center">Get Started</Link>
                <Link to="/browse" className="btn-outline text-center">Browse Items</Link>
              </>
            )}
          </div>
        </div>
      </div>
      {/* About ReWear Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
        Welcome to ReWear
        </h1>
          <div className="prose prose-lg mx-auto text-gray-600 dark:text-gray-300 leading-relaxed">
            <p className="mb-6" style={{fontSize: '1.2rem'}}>
              ReWear is more than just a clothing exchange platform—it's a movement towards sustainable fashion and conscious consumption. 
              We believe that every piece of clothing deserves a second chance, and every fashion enthusiast deserves access to unique, 
              quality garments without contributing to the environmental impact of fast fashion.
            </p>
          </div>
        </div>
      </section>
      {/* Carousel/Banner */}
      <section className="w-full bg-white dark:bg-gray-800 py-8 flex flex-col items-center">
        <div className="w-full max-w-4xl relative px-4">
          {loading || carouselItems.length === 0 ? (
            <div className="h-64 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse text-gray-500 dark:text-gray-400">Images</div>
          ) : (
            <div className="relative h-64 rounded-lg overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-in-out h-full"
                style={{ transform: `translateX(-${carouselIdx * 100}%)` }}
              >
                {carouselItems.map((item, index) => (
                  <div key={index} className="w-full flex-shrink-0">
                    <img
                      src={getImageUrlFull(item.images[0])}
                      alt={item.title}
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-4">
                      <h3 className="text-xl font-bold text-white">{item.title}</h3>
                      <p className="text-sm text-gray-200">{item.category} • {item.condition}</p>
                    </div>
                  </div>
                ))}
              </div>
              {carouselItems.length > 1 && (
                <>
                  <button onClick={prevCarousel} className="absolute left-2 top-1/2 -translate-y-1/2 bg-gray-900 bg-opacity-60 rounded-full p-2 text-white hover:bg-opacity-90 transition-opacity">&#8592;</button>
                  <button onClick={nextCarousel} className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-900 bg-opacity-60 rounded-full p-2 text-white hover:bg-opacity-90 transition-opacity">&#8594;</button>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {categories.map((cat, idx) => (
              <Link
                to={`/browse?type=${encodeURIComponent(cat.name)}`}
                key={cat.name}
                className="bg-gray-100 dark:bg-gray-800 hover:bg-primary-100 dark:hover:bg-primary-900 transition-colors rounded-lg flex flex-col items-center justify-center p-4 md:p-6 shadow-sm border border-gray-200 dark:border-gray-700 group"
              >
                <div className="mb-2 text-primary-600 dark:text-primary-400 group-hover:text-primary-700 dark:group-hover:text-primary-300">{cat.icon}</div>
                <div className="font-semibold text-sm md:text-lg text-gray-900 dark:text-white group-hover:text-primary-700 dark:group-hover:text-primary-300">{cat.name}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Product Listings Section */}
      <section className="py-12 bg-gray-100 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">Product Listings</h2>
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {featuredItems.slice(0, 3).map((item) => (
                <div key={item.id} className="card overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
                  <div className="aspect-w-16 aspect-h-12 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    {item.images && item.images.length > 0 ? (
                      <img
                        src={getImageUrlFull(item.images[0])}
                        alt={item.title}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 flex items-center justify-center text-gray-500 dark:text-gray-400">No Image</div>
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-lg mb-1 text-gray-900 dark:text-white">{item.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{item.uploaderName}</p>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{item.category} • {item.condition}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-primary-600 dark:text-primary-400 font-medium">{item.points} pts</span>
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

      <section className="py-12 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">About ReWear</h2>
          <div className="prose prose-lg mx-auto text-gray-600 dark:text-gray-300 leading-relaxed">
            <p className="mb-6">
              Our innovative point-based system makes clothing exchange fair and accessible. List your gently used items to earn points, 
              then redeem them for pieces you love from our community. Whether you're looking for casual everyday wear, elegant formal attire, 
              vintage treasures, or designer pieces, our diverse collection has something for every style and occasion.
            </p>
            <p>
              Join thousands of fashion-forward individuals who are making a difference—one swap at a time. Together, we're reducing textile waste, 
              building meaningful connections, and creating a more sustainable future for fashion. Start your ReWear journey today and discover 
              the joy of giving clothes a new life while refreshing your wardrobe sustainably.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;