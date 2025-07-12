import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, Grid, List } from 'lucide-react';
import axios from 'axios';

const BrowseItems = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  const categories = ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Accessories'];
  const types = ['Casual', 'Formal', 'Sportswear', 'Vintage', 'Designer', "School Dresses"];

  useEffect(() => {
    // Read URL parameters on component mount
    const urlType = searchParams.get('type');
    const urlCategory = searchParams.get('category');
    
    if (urlType && types.includes(urlType)) {
      setType(urlType);
    }
    if (urlCategory && categories.includes(urlCategory)) {
      setCategory(urlCategory);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchItems();
  }, [searchTerm, category, type]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (category) params.append('category', category);
      if (type) params.append('type', type);

      const response = await axios.get(`/api/items?${params.toString()}`);
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategory('');
    setType('');
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-200">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Browse Items</h1>
        <p className="text-gray-600 dark:text-gray-400">Discover amazing pieces from our community</p>
      </div>

      {/* Filters and Search */}
      <div className="card p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="lg:w-48">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input-field"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="lg:w-48">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="input-field"
            >
              <option value="">All Types</option>
              {types.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${
                viewMode === 'grid' 
                  ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400' 
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400'
              }`}
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${
                viewMode === 'list' 
                  ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400' 
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400'
              }`}
            >
              <List size={20} />
            </button>
          </div>

          {/* Clear Filters */}
          {(searchTerm || category || type) && (
            <button
              onClick={clearFilters}
              className="btn-outline text-sm px-4 py-2"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-600 dark:text-gray-400">
          {loading ? 'Loading...' : `${items.length} items found`}
        </p>
        {(searchTerm || category || type) && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Filtered by: {[searchTerm, category, type].filter(Boolean).join(', ')}
          </p>
        )}
      </div>

      {/* Items Grid/List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-12 h-12 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No items found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Try adjusting your search criteria or browse all items
          </p>
          <button
            onClick={clearFilters}
            className="btn-primary"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
        }>
          {items.map((item) => (
            <Link
              key={item.id}
              to={`/item/${item.id}`}
              className={`card overflow-hidden hover:shadow-lg transition-shadow ${
                viewMode === 'list' ? 'flex' : ''
              }`}
            >
              <div className={viewMode === 'list' ? 'w-32 h-32' : 'aspect-w-16 aspect-h-12'}>
                {item.images ? (
                  <img 
                    src={`/uploads/${item.images[0]}`}
                    alt={item.title}
                    className={`object-cover ${viewMode === 'list' ? 'w-full h-full' : 'w-full h-48'}`}
                  />
                ) : (
                  <div className={`bg-gray-200 dark:bg-gray-700 flex items-center justify-center ${
                    viewMode === 'list' ? 'w-full h-full' : 'w-full h-48'
                  }`}>
                    <span className="text-gray-400 dark:text-gray-500">No image</span>
                  </div>
                )}
              </div>
              
              <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{item.uploaderName}</p>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {item.category} • {item.condition}
                  </div>
                  <span className="text-primary-600 dark:text-primary-400 font-medium">{item.points} pts</span>
                </div>
                {viewMode === 'list' && item.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrowseItems; 