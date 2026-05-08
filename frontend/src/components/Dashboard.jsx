/**
 * File: src/components/Dashboard.jsx
 * Description: Displays products created or owned by 
 * the logged-in user.
 */

import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Dashboard = ({ user }) => {
    /**
     * Stores the list of products fetched for the current user.
     */
    const [products, setProducts] = useState([]);

    /**
     * Fetches products linked to the logged-in user whenever the user data changes.
     */
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Request products that belong to the current user
                const response = await axios.get(`/api/products?userId=${user._id}`);

                // Save fetched products in component state
                setProducts(response.data.products);
            } catch (error) {
                console.error('Error fetching products', error);
            }
        };

        fetchProducts();
    }, [user]);

    return (
        <div className="dashboard">
            <h2>Your Products</h2>

            {/* Show products if available, otherwise show an empty state message */}
            {products.length > 0 ? (
                products.map(product => (
                    <div key={product._id}>{product.name}</div>
                ))
            ) : (
                <p>No products found.</p>
            )}
        </div>
    );
};

export default Dashboard;