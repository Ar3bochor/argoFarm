# Product Discovery Module - ArgoFarm

This directory contains the standalone "Product Discovery Module" for the ArgoFarm project. It is designed following the isolation strategy, ensuring all necessary components, context, and data are self-contained.

## Features Developed

1. **`mockData.js`**: 
   - Provides an array of 10 sample agriculture-related products (`mockProducts`).
   - Includes categories (`categories`) to populate the UI without a backend.

2. **`ProductListing.jsx`**:
   - The main shop page displaying a responsive grid of product cards.
   - **Real-time Search**: Filters products based on name input.
   - **Category Sidebar**: Allows filtering by "All", "Seeds", "Tools", and "Fertilizers".
   - **Sorting Logic**: Sorts displayed products by Popularity, Price (Low/High), and Rating.

3. **`ProductDetails.jsx`**:
   - A dynamic single-product view page fetching data based on the URL parameter (`id`).
   - Includes a high-quality product image display, detailed description, pricing, and ratings.
   - Features a functional "Quantity Selector" and "Add to Cart" button that integrates with the cart state.

4. **`CartContext.jsx`**:
   - A React Context providing global state management for the cart.
   - Functions included: `addToCart`, `updateQuantity`, `removeFromCart`, `clearCart`.
   - Automatically synchronizes cart data with the browser's `localStorage` to persist data across reloads.

5. **`CartPage.jsx`**:
   - A dedicated page to view the items currently in the cart.
   - Users can increase or decrease the quantity of products directly from this page, or remove items entirely.
   - Displays a dynamic Order Summary with calculated subtotals.

## Integration Instructions

To integrate this module into the main application, follow these steps in your `src/App.js` (or main routing file):

### 1. Import the Components
Add the following import statements at the top of your file:

```jsx
import { CartProvider } from './features/ProductModule/CartContext';
import ProductListing from './features/ProductModule/ProductListing';
import ProductDetails from './features/ProductModule/ProductDetails';
import CartPage from './features/ProductModule/CartPage';
```

### 2. Wrap your App in the Provider
Wrap your routing setup (or the components that need access to the cart) with the `<CartProvider>`:

```jsx
function App() {
  return (
    <CartProvider>
      {/* Your other app wrappers, e.g., <BrowserRouter> */}
      <Routes>
        {/* Your existing routes */}
        <Route path="/shop" element={<ProductListing />} />
        <Route path="/shop/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<CartPage />} />
      </Routes>
    </CartProvider>
  );
}
```

*Note: Ensure you have `react-router-dom` installed and configured in your application.*
