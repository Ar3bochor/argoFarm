// Order.jsx
    import React, { useState, useEffect } from 'react';
    import axios from 'axios';

    const Order = ({ user }) => {
        const [orders, setOrders] = useState([]);

        useEffect(() => {
            const fetchOrders = async () => {
                try {
                    const response = await axios.get(`/api/orders/farmer?userId=${user._id}`);
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
    