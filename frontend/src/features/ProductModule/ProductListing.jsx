import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { mockProducts, categories } from './mockData';

const ProductListing = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOption, setSortOption] = useState('Popularity'); // 'Popularity', 'Price: Low to High', 'Price: High to Low', 'Rating'

  const filteredAndSortedProducts = useMemo(() => {
    let result = mockProducts;

    // Filter by category
    if (selectedCategory !== 'All') {
      result = result.filter(product => product.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      result = result.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort products
    switch (sortOption) {
      case 'Price: Low to High':
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case 'Price: High to Low':
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case 'Rating':
        result = [...result].sort((a, b) => b.rating - a.rating);
        break;
      case 'Popularity':
      default:
        result = [...result].sort((a, b) => b.popularity - a.popularity);
        break;
    }

    return result;
  }, [searchTerm, selectedCategory, sortOption]);

  return (
    <div className="min-h-screen bg-[#f4f7f4] text-gray-800 font-sans">
      {/* Header Area */}
      <div className="bg-[#2e5c3b] text-white py-12 px-6 shadow-md">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Discover Our Farm Supplies</h1>
          <p className="text-[#a8cfb4] text-lg max-w-2xl mx-auto">Premium seeds, top-tier tools, and organic fertilizers for the modern agricultural professional.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0 space-y-8">
          {/* Search Bar */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-[#2e5c3b] mb-3">Search</h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4caf50] transition-shadow"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-[#2e5c3b] mb-3">Categories</h3>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category}>
                  <button
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === category
                        ? 'bg-[#e8f5e9] text-[#2e5c3b] font-medium'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-[#4caf50]'
                    }`}
                  >
                    {category}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {/* Top Bar: Sort & Results count */}
          <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
            <p className="text-sm text-gray-500 mb-4 sm:mb-0">
              Showing <span className="font-semibold text-gray-800">{filteredAndSortedProducts.length}</span> results
            </p>
            <div className="flex items-center space-x-3">
              <label htmlFor="sort" className="text-sm font-medium text-gray-700">Sort by:</label>
              <select
                id="sort"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="border-gray-200 border rounded-lg text-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#4caf50]"
              >
                <option value="Popularity">Popularity</option>
                <option value="Price: Low to High">Price: Low to High</option>
                <option value="Price: High to Low">Price: High to Low</option>
                <option value="Rating">Top Rated</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {filteredAndSortedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedProducts.map((product) => (
                <Link
                  to={`/shop/${product.id}`}
                  key={product.id}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full"
                >
                  {/* Image Container */}
                  <div className="aspect-w-4 aspect-h-3 bg-gray-100 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  
                  {/* Content Container */}
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="text-xs font-semibold text-[#4caf50] uppercase tracking-wider mb-2">
                      {product.category}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#2e5c3b] transition-colors">
                      {product.name}
                    </h3>
                    
                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-50">
                      <span className="text-xl font-bold text-[#2e5c3b]">${product.price.toFixed(2)}</span>
                      <div className="flex items-center text-sm text-yellow-500">
                        <span className="mr-1">★</span>
                        <span className="text-gray-600 font-medium">{product.rating}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No products found</h3>
              <p className="text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
              <button 
                onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
                className="mt-4 text-[#4caf50] hover:text-[#2e5c3b] font-medium"
              >
                Clear all filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProductListing;
