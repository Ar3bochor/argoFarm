/**
 * File: src/components/Order.jsx
 * Description: Fetches and displays the list of orders 
 * associated with the logged-in farmer.
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Order = ({ user }) => {
    /**
     * Stores the list of orders fetched from the backend.
     */
    const [orders, setOrders] = useState([]);

    /**
     * Fetches all orders related to the current farmer whenever the user data changes.
     */
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                // Request orders linked to the current user's farmer account
                const response = await axios.get(`/api/orders/farmer?userId=${user._id}`);

                // Save fetched orders in component state
                setOrders(response.data.orders);
            } catch (error) {
                console.error('Error fetching orders', error);
            }
        };

        fetchOrders();
    }, [user]);

    return (
        <div className="orders">
            <h2>Your Orders</h2>

            {/* Show order list if orders are available, otherwise show an empty message */}
            {orders.length > 0 ? (
                orders.map(order => (
                    <div key={order._id}>{order.productName}</div>
                ))
            ) : (
                <p>No orders found.</p>
            )}
        </div>
    );
};

export default Order;