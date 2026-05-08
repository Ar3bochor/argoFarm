/**
 * File: src/components/Cart.jsx
 * Description: Displays the user's cart items and 
 * allows removing items from the cart.
 */

import React from 'react';

const Cart = ({ cart, handleUpdateCart }) => {
    /**
     * Handles cart-related errors.
     * Currently logs the error and displays a simple alert message to the user.
     */
    const handleError = (error) => {
        console.error(error);
        alert('Error with cart update');
    };

    return (
        <div className="cart-container">
            <h2>Your Cart</h2>

            {/* Show an empty cart message when there are no items */}
            {cart.items.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                /* Display each cart item with a remove button */
                cart.items.map(item => (
                    <div key={item.id}>
                        <span>{item.name}</span>

                        {/* Remove the selected item from the cart */}
                        <button onClick={() => handleUpdateCart(item, 'remove')}>
                            Remove
                        </button>
                    </div>
                ))
            )}
        </div>
    );
};

export default Cart;