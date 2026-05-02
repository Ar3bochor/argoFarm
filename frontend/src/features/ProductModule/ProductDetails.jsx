import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { mockProducts } from './mockData';
import { useCart } from './CartContext';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    // In a real app, this would be an API call
    const foundProduct = mockProducts.find(p => p.id === id);
    if (foundProduct) {
      setProduct(foundProduct);
    } else {
      // Product not found, could redirect or show error
      setProduct(null);
    }
  }, [id]);

  const handleIncrement = () => setQuantity(prev => prev + 1);
  const handleDecrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product, quantity);
    alert(`Successfully added ${quantity} x ${product.name} to your cart!`);
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-[#f4f7f4] flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h2>
        <Link to="/shop" className="text-[#4caf50] hover:underline flex items-center">
          &larr; Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7f4] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Breadcrumb */}
        <nav className="flex mb-8 text-sm text-gray-500">
          <Link to="/" className="hover:text-[#4caf50] transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/shop" className="hover:text-[#4caf50] transition-colors">Shop</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-800 font-medium">{product.name}</span>
        </nav>

        <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100 flex flex-col md:flex-row">
          
          {/* Product Image Gallery */}
          <div className="w-full md:w-1/2 bg-gray-50 p-8 flex items-center justify-center">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full max-w-md h-auto object-cover rounded-2xl shadow-lg"
            />
          </div>

          {/* Product Info */}
          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col">
            <div className="uppercase tracking-wide text-sm text-[#4caf50] font-bold mb-2">
              {product.category}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>
            
            <div className="flex items-center mb-6">
              <div className="flex items-center text-yellow-400 text-xl mr-2">
                {'★'.repeat(Math.floor(product.rating))}
                <span className="text-gray-300">{'★'.repeat(5 - Math.floor(product.rating))}</span>
              </div>
              <span className="text-gray-600 text-sm">({product.rating} Rating)</span>
              <span className="mx-4 text-gray-300">|</span>
              <span className="text-sm text-gray-500">{product.popularity} sold</span>
            </div>

            <div className="text-3xl font-bold text-[#2e5c3b] mb-8">
              ${product.price.toFixed(2)}
            </div>

            <p className="text-gray-600 leading-relaxed mb-8">
              {product.description}
            </p>

            <div className="mt-auto border-t border-gray-100 pt-8">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                
                {/* Quantity Selector */}
                <div className="flex items-center border-2 border-gray-200 rounded-xl h-14">
                  <button 
                    onClick={handleDecrement}
                    className="px-5 text-gray-500 hover:text-[#2e5c3b] transition-colors focus:outline-none text-xl"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-semibold text-gray-800">
                    {quantity}
                  </span>
                  <button 
                    onClick={handleIncrement}
                    className="px-5 text-gray-500 hover:text-[#2e5c3b] transition-colors focus:outline-none text-xl"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button 
                  onClick={handleAddToCart}
                  className="flex-1 w-full bg-[#4caf50] hover:bg-[#2e5c3b] text-white h-14 rounded-xl font-bold text-lg transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Add to Cart
                </button>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
