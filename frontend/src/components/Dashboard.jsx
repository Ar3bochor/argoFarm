// Dashboard.jsx
    import React, { useEffect, useState } from 'react';
    import axios from 'axios';

    const Dashboard = ({ user }) => {
        const [products, setProducts] = useState([]);

        useEffect(() => {
            const fetchProducts = async () => {
                try {
                    const response = await axios.get(`/api/products?userId=${user._id}`);
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
    