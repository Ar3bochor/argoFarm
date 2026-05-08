import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from './CartContext';

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, cartTotal, cartCount } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#f4f7f4] flex flex-col items-center justify-center p-4 font-sans">
        <div className="bg-white p-10 rounded-3xl shadow-sm text-center border border-gray-100 max-w-md w-full">
          <div className="w-24 h-24 bg-[#e8f5e9] text-[#4caf50] rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-8">Looks like you haven't added any items to your cart yet.</p>
          <Link 
            to="/shop" 
            className="inline-block bg-[#4caf50] hover:bg-[#2e5c3b] text-white font-semibold py-3 px-8 rounded-xl transition-colors shadow-md"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7f4] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Cart Items List */}
          <div className="lg:w-2/3 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center gap-6">
                
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-xl shadow-sm"
                />
                
                <div className="flex-1 text-center sm:text-left w-full">
                  <div className="text-xs font-semibold text-[#4caf50] uppercase tracking-wider mb-1">
                    {item.category}
                  </div>
                  <Link to={`/shop/${item.id}`} className="text-lg font-bold text-gray-900 hover:text-[#4caf50] transition-colors line-clamp-1 mb-2">
                    {item.name}
                  </Link>
                  <div className="text-xl font-bold text-[#2e5c3b]">
                    ${item.price.toFixed(2)}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto mt-4 sm:mt-0 justify-between">
                  {/* Quantity Controls */}
                  <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-[#2e5c3b] hover:bg-gray-100 rounded-l-lg transition-colors"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-medium text-gray-800">
                      {item.quantity}
                    </span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-[#2e5c3b] hover:bg-gray-100 rounded-r-lg transition-colors"
                    >
                      +
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove item"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cartCount} items)</span>
                  <span className="font-medium">${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-medium text-[#4caf50]">Calculated at checkout</span>
                </div>
                <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-[#2e5c3b]">${cartTotal.toFixed(2)}</span>
                </div>
              </div>

              <button className="w-full bg-[#4caf50] hover:bg-[#2e5c3b] text-white py-4 rounded-xl font-bold text-lg transition-colors shadow-md flex items-center justify-center">
                Proceed to Checkout
              </button>
              
              <Link 
                to="/shop" 
                className="mt-4 block text-center text-[#4caf50] hover:text-[#2e5c3b] font-medium transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CartPage;
