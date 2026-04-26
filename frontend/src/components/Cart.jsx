// Cart.jsx
    import React from 'react';
    const Cart = ({ cart, handleUpdateCart }) => {
        const handleError = (error) => {
            console.error(error);
            alert('Error with cart update');
        };

        return (
            <div className="cart-container">
                <h2>Your Cart</h2>
                {cart.items.length === 0 ? (
                    <p>Your cart is empty.</p>
                ) : (
                    cart.items.map(item => (
                        <div key={item.id}>
                            <span>{item.name}</span>
                            <button onClick={() => handleUpdateCart(item, 'remove')}>Remove</button>
                        </div>
                    ))
                )}
            </div>
        );
    };
    export default Cart;
    