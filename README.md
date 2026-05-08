# ArgoFarm / KrishiMart

A full-stack MERN ecommerce application for buying and selling farm products. The backend is an Express + MongoDB REST API with JWT authentication, role-based access control, product management, cart, checkout, orders, reviews, coupons, and admin reporting. The frontend is a Vite + React application with public shop pages, protected customer flows, farmer dashboard routes, and admin dashboard routes.

> Naming note: the project currently uses both `ArgoFarm` and `KrishiMart` in different files. The API boot message and several frontend screens reference `ArgoFarm`, while the existing backend API docs and some UI sections reference `KrishiMart`. Choose one brand name before production and update the text consistently.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Installation](#installation)
- [Running the Project](#running-the-project)
- [Database Seeding](#database-seeding)
- [Backend Architecture](#backend-architecture)
- [Backend Router Flow](#backend-router-flow)
- [Backend API Routes](#backend-api-routes)
- [Frontend Architecture](#frontend-architecture)
- [Frontend Routes](#frontend-routes)
- [Frontend Service Layer](#frontend-service-layer)
- [Authentication and Authorization](#authentication-and-authorization)
- [Data Models](#data-models)
- [Important File Map](#important-file-map)
- [Available Scripts](#available-scripts)
- [Development Workflow](#development-workflow)
- [Production Notes](#production-notes)
- [Troubleshooting](#troubleshooting)

---

## Tech Stack

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Tokens (`jsonwebtoken`)
- `bcryptjs` for password hashing
- `helmet` for secure HTTP headers
- `cors` for browser API access
- `compression` for gzip responses
- `express-rate-limit` for API throttling
- `express-mongo-sanitize` for NoSQL injection protection
- `morgan` for request logging
- `dotenv` for environment configuration
- `nodemon` for development reloads

### Frontend

- React
- Vite
- React Router DOM
- Axios
- Tailwind CSS
- PostCSS / Autoprefixer
- ESLint

---

## Features

### Customer Features

- Register and log in with JWT authentication.
- Browse products with search, filters, sorting, and pagination.
- View product details, gallery, related products, ratings, and reviews.
- Add products to cart, update quantities, remove items, clear cart, and apply coupons.
- Add and manage delivery addresses.
- Checkout with saved or inline shipping address.
- Select delivery slot and payment method.
- View order history and order details.
- Track order status history.
- Reorder previous purchases.
- Submit reviews for delivered products.

### Farmer Features

- Access a farmer-only dashboard.
- Create and manage own products.
- Activate or deactivate own products.
- View orders that contain the farmer's products.
- See farmer-level dashboard statistics.

### Admin Features

- Access an admin-only dashboard.
- View platform-level statistics.
- Manage users and roles.
- Manage all products and categories.
- Manage all orders and update order statuses.
- Approve, reject, or delete product reviews.
- Create and manage coupons.
- View sales reports with date filters, top products, category revenue, and payment-method summaries.

---

## Project Structure

```text
proj/
├── backend/
│   ├── config/             # Database and future external-service configuration
│   ├── controllers/        # Request handlers for each API domain
│   ├── data/               # Seed data and seed script
│   ├── docs/               # Existing short backend API notes
│   ├── middleware/         # Auth, role, validation, async, and error middleware
│   ├── models/             # Mongoose schemas/models
│   ├── routes/             # Express routers mounted by server.js
│   ├── services/           # Shared business logic helpers
│   ├── tests/              # Test placeholder
│   ├── uploads/            # Local upload folder placeholder
│   ├── utils/              # Tokens, constants, validators, query helpers
│   ├── package.json
│   └── server.js           # Backend entry point
│
└── frontend/
    ├── public/             # Static assets
    ├── src/
    │   ├── components/     # Reusable UI components
    │   ├── context/        # Auth and cart global state providers
    │   ├── features/       # Larger feature-level UI modules
    │   ├── hooks/          # Custom hooks
    │   ├── pages/          # Route-level pages
    │   ├── routes/         # React Router configuration and guards
    │   ├── services/       # Axios API modules
    │   └── utils/          # Shared frontend helpers
    ├── package.json
    └── vite.config.js
```

---

## Prerequisites

Install these before running the project:

- Node.js and npm
- MongoDB database, either local MongoDB or MongoDB Atlas
- Git, if cloning from a repository

Recommended local ports:

- Backend API: `http://localhost:5000`
- Frontend app: `http://localhost:5173`

---

## Environment Variables

Create environment files in both apps. Do not commit real `.env` files.

### Backend: `backend/.env`

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/argofarm
JWT_SECRET=replace_with_a_long_random_secret
FRONTEND_URL=http://localhost:5173
CLIENT_URL=http://localhost:5173
```

Notes:

- `PORT` controls the Express server port.
- `MONGO_URI` is required by `config/db.js`.
- `JWT_SECRET` is required for signing and verifying authentication tokens.
- `FRONTEND_URL` and `CLIENT_URL` are used by CORS and payment-session redirects.
- The uploaded `.env` also contains `ds_pass`, but the current backend code does not read it directly.

### Frontend: `frontend/.env`

```env
VITE_API_URL=http://localhost:5000/api
```

Notes:

- Vite only exposes variables prefixed with `VITE_` to frontend code.
- `src/services/api.js` uses `VITE_API_URL` as the Axios base URL.

---

## Installation

Install dependencies separately for the backend and frontend.

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Install Frontend Dependencies

Open a second terminal from the project root:

```bash
cd frontend
npm install
```

For a clean reproducible install based on the lock files, use `npm ci` instead of `npm install`.

---

## Running the Project

### Start the Backend

```bash
cd backend
npm run dev
```

The backend starts on:

```text
http://localhost:5000
```

Useful backend health checks:

```text
GET http://localhost:5000/
GET http://localhost:5000/api/health
```

### Start the Frontend

In another terminal:

```bash
cd frontend
npm run dev
```

The frontend starts on:

```text
http://localhost:5173
```

### Production-style Backend Start

```bash
cd backend
npm start
```

### Production Frontend Build

```bash
cd frontend
npm run build
npm run preview
```

---

## Database Seeding

The backend includes a seed script that creates sample users, categories, products, and coupons.

```bash
cd backend
npm run seed
```

To destroy seeded data:

```bash
cd backend
npm run seed:destroy
```

Warning: the seed script deletes existing users, products, categories, and coupons before inserting sample data.

### Seed Users

| Role | Email | Password |
|---|---|---|
| Admin | `admin@argofarm.com` | `admin123` |
| Farmer | `rahim@argofarm.com` | `farmer123` |
| Customer | `karim@argofarm.com` | `user1234` |

### Seed Coupons

| Code | Type | Purpose |
|---|---|---|
| `WELCOME10` | Percent | 10% off first order-style promotion |
| `SAVE50` | Fixed | Flat BDT 50 discount above a minimum order amount |
| `FRESH20` | Percent | 20% discount for fresh products |

---

## Backend Architecture

The backend follows a standard Express MVC/service structure.

```text
HTTP request
  -> server.js middleware stack
  -> mounted Express router
  -> route-level middleware such as protect, authorizeRoles, sanitizeBody
  -> controller function
  -> service/model/database logic
  -> JSON response
  -> notFound/errorHandler if something fails
```

### `server.js` Responsibilities

`backend/server.js` is the backend entry point. It:

1. Loads environment variables with `dotenv.config()`.
2. Connects to MongoDB through `connectDB()`.
3. Creates the Express application.
4. Applies security middleware:
   - `helmet()`
   - `mongoSanitize()`
5. Applies performance and parser middleware:
   - `compression()`
   - `express.json()`
   - `express.urlencoded()`
6. Configures CORS for `FRONTEND_URL` and `CLIENT_URL`.
7. Adds request logging through `morgan` outside test mode.
8. Adds a global rate limiter to all `/api` routes.
9. Adds a stricter rate limiter to `/api/auth`.
10. Mounts all API routers.
11. Adds 404 and global error handlers.
12. Starts the HTTP server.
13. Handles graceful shutdown and unhandled promise rejections.

### Router Mount Points

| Mount Point | Router File | Main Purpose |
|---|---|---|
| `/api/auth` | `routes/authRoutes.js` | Registration, login, logout, current user, password update |
| `/api/users` | `routes/userRoutes.js` | Profile, addresses, account deletion |
| `/api/products` | `routes/productRoutes.js` | Product listing, details, creation, updates, activation/deactivation |
| `/api/categories` | `routes/categoryRoutes.js` | Product categories |
| `/api/cart` | `routes/cartRoutes.js` | Authenticated cart operations and cart coupon application |
| `/api/orders` | `routes/orderRoutes.js` | Checkout summary, order creation, customer/farmer orders, tracking, reorder |
| `/api/reviews` | `routes/reviewRoutes.js` | Product reviews and admin moderation |
| `/api/admin` | `routes/adminRoutes.js` | Admin dashboard, user management, order management, reports |
| `/api/coupons` | `routes/couponRoutes.js` | Coupon validation and admin coupon CRUD |

---

## Backend Router Flow

### Authentication Middleware

The API uses JWT Bearer tokens.

```http
Authorization: Bearer <token>
```

`protect` in `middleware/authMiddleware.js`:

- Reads the `Authorization` header.
- Verifies the JWT with `JWT_SECRET`.
- Loads the user from MongoDB.
- Attaches the authenticated user to `req.user`.

`authorizeRoles(...roles)`:

- Must run after `protect`.
- Blocks users whose `req.user.role` is not included in the allowed role list.

`optionalAuth`:

- Attaches `req.user` when a valid token exists.
- Does not block public access if no token is provided.

### Validation and Error Handling

- `sanitizeBody` removes dangerous top-level keys such as `__proto__`, `constructor`, and `prototype` and trims string fields.
- `notFound` handles unknown routes.
- `errorHandler` normalizes errors such as Mongoose validation errors, duplicate keys, invalid ObjectIds, JWT errors, large request bodies, and CORS errors.

### Router-by-Router Behavior

#### `authRoutes.js`

- Public registration and login.
- Protected logout, current user lookup, and password update.
- `server.js` applies the stricter auth rate limiter to this router.

#### `userRoutes.js`

- Applies `router.use(protect)`, so every user route requires login.
- Handles profile and address management.
- Account deletion is available to the authenticated user.

#### `productRoutes.js`

- Public listing, featured products, related products, and product details.
- Admins and farmers can create/update products.
- Farmers can only update, activate, or deactivate their own products.
- Only admins can hard-delete products.

#### `categoryRoutes.js`

- Public category listing and single category view.
- Uses `optionalAuth` for listing so admins can request inactive categories.
- Create, update, and delete are admin-only.

#### `cartRoutes.js`

- Applies `router.use(protect)`, so all cart routes require login.
- Supports get, add, update quantity, remove item, clear cart, apply coupon, and remove coupon.
- Named coupon routes are placed before `/:productId` to avoid route conflicts.

#### `orderRoutes.js`

- Applies `router.use(protect)`, so all order routes require login.
- Order creation always builds items from the authenticated user's cart. This prevents client-side price or quantity tampering.
- `GET /farmer` is restricted to farmers and admins.
- `PUT /:id/pay` is admin-only.
- Order status updates are intentionally handled through `adminRoutes.js` at `/api/admin/orders/:id/status`.

#### `reviewRoutes.js`

- Public users can read approved reviews for a product.
- Authenticated users can submit reviews.
- A user can review only a product contained in one of their delivered orders.
- Admins can list all reviews, approve reviews, and reject reviews.
- Owners or admins can delete reviews.

#### `adminRoutes.js`

- Applies `router.use(protect, authorizeRoles("admin"))`, so every route is admin-only.
- Handles dashboard stats, users, all orders, order status updates, and sales reports.

#### `couponRoutes.js`

- Logged-in users can validate coupons.
- Admins can create, view, update, and delete coupons.

---

## Backend API Routes

Base URL in development:

```text
http://localhost:5000/api
```

### Health and Root

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/` | Public | Confirms the API server is running |
| GET | `/api/health` | Public | Returns status, uptime, timestamp, and environment |

### Auth Routes

| Method | Endpoint | Access | Body / Query | Purpose |
|---|---|---|---|---|
| POST | `/api/auth/register` | Public | `name`, `email`, `password`, optional `role`, `phone` | Register a user and return user data with token |
| POST | `/api/auth/login` | Public | `email`, `password` | Authenticate user and return token |
| POST | `/api/auth/logout` | Private | None | Server-side logout placeholder; client removes token |
| GET | `/api/auth/me` | Private | None | Return authenticated user |
| PUT | `/api/auth/update-password` | Private | `currentPassword`, `newPassword` | Change password |

Public registration blocks self-elevation to admin. If someone submits `role: "admin"`, the backend saves them as a normal `user`.

### User Routes

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/api/users/profile` | Private | Get current user's profile |
| PUT | `/api/users/profile` | Private | Update name, email, and phone |
| GET | `/api/users/addresses` | Private | Get saved addresses |
| POST | `/api/users/addresses` | Private | Add a saved address |
| PUT | `/api/users/addresses/:id` | Private | Update a saved address |
| DELETE | `/api/users/addresses/:id` | Private | Delete a saved address |
| DELETE | `/api/users/account` | Private | Delete the authenticated user's account |

### Product Routes

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/api/products` | Public | List products with filters, sort, and pagination |
| GET | `/api/products/featured` | Public | Get featured products |
| GET | `/api/products/:id` | Public | Get one product by MongoDB ID or slug |
| GET | `/api/products/:id/related` | Public | Get related products from the same category |
| POST | `/api/products` | Admin/Farmer | Create a product |
| PUT | `/api/products/:id` | Admin/Farmer | Update a product |
| PATCH | `/api/products/:id/deactivate` | Admin/Farmer | Soft-disable a product |
| PATCH | `/api/products/:id/activate` | Admin/Farmer | Reactivate a product |
| DELETE | `/api/products/:id` | Admin | Hard-delete a product |

Supported product query parameters:

| Query | Example | Purpose |
|---|---|---|
| `page` | `page=2` | Pagination page |
| `limit` | `limit=12` | Items per page, capped at 100 |
| `keyword`, `search`, or `q` | `search=tomato` | Search by name, description, or tags |
| `category` | `category=vegetables` | Filter by category ID, slug, or name |
| `minPrice` | `minPrice=50` | Minimum price |
| `maxPrice` | `maxPrice=500` | Maximum price |
| `minRating` | `minRating=4` | Minimum average rating |
| `inStock` | `inStock=true` | Products with stock greater than zero |
| `sort` | `price_asc`, `price_desc`, `rating`, `popular`, `oldest`, `newest` | Sort order |
| `mine` | `mine=true` | Farmer-only own product list |
| `farmer` | `farmer=<id>` | Admin-only farmer filter |
| `includeInactive` | `includeInactive=true` | Admin/farmer visibility for inactive products |

Create product minimum body:

```json
{
  "name": "Fresh Tomatoes",
  "description": "Fresh local tomatoes",
  "price": 60,
  "category": "category_id",
  "stock": 100
}
```

### Category Routes

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/api/categories` | Public / optional auth | List active categories; admins can include inactive categories |
| GET | `/api/categories/:id` | Public | Get one category |
| POST | `/api/categories` | Admin | Create a category |
| PUT | `/api/categories/:id` | Admin | Update a category |
| DELETE | `/api/categories/:id` | Admin | Delete a category |

### Cart Routes

| Method | Endpoint | Access | Body | Purpose |
|---|---|---|---|---|
| GET | `/api/cart` | Private | None | Get or create current user's cart |
| POST | `/api/cart` | Private | `productId`, `quantity` | Add item to cart |
| PUT | `/api/cart/:productId` | Private | `quantity` | Update item quantity |
| DELETE | `/api/cart/:productId` | Private | None | Remove item from cart |
| DELETE | `/api/cart` | Private | None | Clear cart |
| POST | `/api/cart/coupon` | Private | `code` | Apply coupon to cart |
| DELETE | `/api/cart/coupon` | Private | None | Remove coupon from cart |

The cart controller returns a cart object directly rather than always wrapping it in `{ success, data }`. The frontend `CartContext` handles both direct and wrapped response shapes.

### Order Routes

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/api/orders/summary` | Private | Calculate checkout summary from cart |
| POST | `/api/orders` | Private | Create order from cart and clear cart |
| GET | `/api/orders/my` | Private | Get current user's orders |
| GET | `/api/orders/farmer` | Farmer/Admin | Get orders containing the farmer's products |
| GET | `/api/orders/:id` | Owner/Admin | Get one order |
| GET | `/api/orders/:id/track` | Owner/Admin | Get order status and status history |
| POST | `/api/orders/:id/reorder` | Owner | Add previous order items back to cart |
| PUT | `/api/orders/:id/pay` | Admin | Mark an order as paid |

Checkout body can use either a saved address ID or inline shipping address:

```json
{
  "addressId": "saved_address_id",
  "paymentMethod": "COD",
  "deliverySlot": {
    "date": "2026-05-08",
    "time": "10:00-12:00",
    "label": "Morning delivery"
  },
  "couponCode": "WELCOME10"
}
```

Or:

```json
{
  "shippingAddress": {
    "fullName": "Customer Name",
    "phone": "01700000000",
    "address": "House 1, Road 2",
    "city": "Dhaka",
    "district": "Dhaka",
    "postalCode": "1207",
    "country": "Bangladesh"
  },
  "paymentMethod": "bKash"
}
```

### Review Routes

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/api/reviews/product/:productId` | Public | Get approved product reviews |
| POST | `/api/reviews` | Private | Submit a review for a delivered product |
| GET | `/api/reviews` | Admin | List all reviews, optionally by status |
| PUT | `/api/reviews/:id/approve` | Admin | Approve review and update product rating |
| PUT | `/api/reviews/:id/reject` | Admin | Reject review and update product rating |
| DELETE | `/api/reviews/:id` | Owner/Admin | Delete review |

Review body:

```json
{
  "productId": "product_id",
  "rating": 5,
  "title": "Great quality",
  "comment": "Fresh and delivered on time."
}
```

### Coupon Routes

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/api/coupons/validate` | Private | Validate coupon for a given amount |
| GET | `/api/coupons` | Admin | List coupons |
| POST | `/api/coupons` | Admin | Create coupon |
| PUT | `/api/coupons/:id` | Admin | Update coupon |
| DELETE | `/api/coupons/:id` | Admin | Delete coupon |

Coupon validation body:

```json
{
  "code": "WELCOME10",
  "amount": 1000
}
```

### Admin Routes

Every admin route requires `protect` and `authorizeRoles("admin")`.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/admin/dashboard` | Platform stats: users, products, categories, orders, reviews, revenue |
| GET | `/api/admin/users` | List users with pagination, role filter, and search |
| PUT | `/api/admin/users/:id` | Update user name or role |
| DELETE | `/api/admin/users/:id` | Delete non-admin user |
| GET | `/api/admin/orders` | List all orders, optionally filtered by status |
| PUT | `/api/admin/orders/:id/status` | Update order status and status history |
| GET | `/api/admin/reports/sales` | Sales report with daily revenue, top products, category revenue, payment methods |

Admin order status body:

```json
{
  "status": "processing",
  "note": "Order accepted and preparing for shipment"
}
```

Supported order statuses:

```text
pending, processing, shipped, delivered, cancelled
```

Supported payment methods:

```text
COD, bKash, Nagad, Card, Stripe, SSLCommerz
```

---

## Frontend Architecture

The frontend is built around React Router, global context providers, and a service layer.

```text
main.jsx
  -> BrowserRouter
  -> AuthProvider
  -> CartProvider
  -> App
      -> Navbar
      -> AppRoutes
      -> Footer
```

### Main Files

| File | Purpose |
|---|---|
| `src/main.jsx` | React entry point; registers router and global providers |
| `src/App.jsx` | App shell with navbar, routed pages, and footer |
| `src/routes/AppRoutes.jsx` | All frontend route declarations |
| `src/routes/ProtectedRoute.jsx` | Blocks unauthenticated users |
| `src/routes/RoleRoute.jsx` | Blocks authenticated users with the wrong role |
| `src/routes/DashboardRedirect.jsx` | Sends `/dashboard` to the correct role dashboard |
| `src/context/AuthContext.jsx` | Stores user session, login, register, logout, refresh user |
| `src/context/CartContext.jsx` | Stores cart state and exposes cart actions |
| `src/services/api.js` | Central Axios instance and token interceptor |

---

## Frontend Routes

### Public Routes

| Path | Component | Purpose |
|---|---|---|
| `/` | `Home` | Landing page with featured content, categories, and products |
| `/products` | `Products` | Product listing page with search, filter, sort, and pagination |
| `/products/:id` | `ProductDetails` | Product detail page by product ID or slug |
| `/product/:id` | `ProductDetails` | Alternate product detail path |
| `/login` | `Login` | User login page |
| `/register` | `Register` | User registration page |

### Authenticated Routes

These routes are wrapped in `ProtectedRoute`.

| Path | Component | Purpose |
|---|---|---|
| `/cart` | `Cart` | Shopping cart page |
| `/checkout` | `Checkout` | Checkout and order placement |
| `/orders/:id` | `OrderDetails` | Single order details and tracking |
| `/dashboard` | `DashboardRedirect` | Redirects the user to their role-specific dashboard |

### Role-protected Routes

These routes are wrapped in `RoleRoute`.

| Path | Allowed Role | Component | Purpose |
|---|---|---|---|
| `/dashboard/user` | `user` | `UserDashboard` | Customer dashboard |
| `/dashboard/farmer` | `farmer` | `FarmerDashboard` | Farmer product and order dashboard |
| `/admin` | `admin` | `AdminDashboard` | Admin dashboard |

### 404 Route

| Path | Component | Purpose |
|---|---|---|
| `*` | `EmptyState` | Shows a page-not-found message and a link back home |

---

## How Frontend Routing Works

### `ProtectedRoute`

Use this when the route only requires login.

```jsx
<Route
  path="/cart"
  element={
    <ProtectedRoute>
      <Cart />
    </ProtectedRoute>
  }
/>
```

Behavior:

- Shows a loader while auth state is loading.
- Redirects unauthenticated users to `/login`.
- Preserves the attempted route in `location.state.from`.
- Does not check user roles.

### `RoleRoute`

Use this when the route requires a specific role.

```jsx
<Route
  path="/admin"
  element={
    <RoleRoute roles={["admin"]}>
      <AdminDashboard />
    </RoleRoute>
  }
/>
```

Behavior:

- Shows a permissions loader while auth state is loading.
- Redirects unauthenticated users to `/login`.
- Redirects wrong-role users to their own dashboard:
  - `admin` -> `/admin`
  - `farmer` -> `/dashboard/farmer`
  - `user` -> `/dashboard/user`

### `DashboardRedirect`

The plain `/dashboard` path does not render a dashboard directly. It reads `user.role` and redirects:

| Role | Redirect Target |
|---|---|
| `admin` | `/admin` |
| `farmer` | `/dashboard/farmer` |
| `user` | `/dashboard/user` |

This prevents admins and farmers from accidentally landing on the normal user dashboard.

---

## Frontend Service Layer

All API calls go through `src/services/api.js`, which creates a central Axios instance.

### Axios Configuration

```js
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 15000,
});
```

### Request Interceptor

Before each request, the interceptor reads `localStorage.getItem("token")` and adds:

```http
Authorization: Bearer <token>
```

### Response Interceptor

The response interceptor only clears the stored token when a true authentication endpoint fails, such as `/auth/me` or `/auth/login`. It intentionally does not log the user out for every `401` response from normal API calls.

### Service Files

| Service File | API Area |
|---|---|
| `adminService.js` | Admin dashboard, users, reports, review moderation, order status |
| `authService.js` | Register, login, current user, password update |
| `cartService.js` | Cart items, quantity updates, coupons |
| `categoryService.js` | Category list and admin category CRUD |
| `couponService.js` | Coupon validation and admin coupon CRUD |
| `orderService.js` | Order summary, creation, order list, tracking, reorder |
| `productService.js` | Products, featured products, related products, product CRUD |
| `reviewService.js` | Product review list and review creation |
| `userService.js` | Profile, addresses, account deletion |

---

## Authentication and Authorization

### User Roles

The application supports three roles:

| Role | Purpose |
|---|---|
| `user` | Normal customer who can shop, order, manage addresses, and review delivered products |
| `farmer` | Seller who can manage own products and view relevant farmer orders |
| `admin` | Platform manager with access to all admin routes and dashboards |

### Token Storage

- The frontend stores the JWT in `localStorage` under the key `token`.
- The backend expects the token in the `Authorization` header.
- The token payload includes the user ID and role.

### Access Rules

- Public pages and public product/category endpoints do not require a token.
- Cart, checkout, orders, profile, and review creation require login.
- Farmer dashboard and farmer order views require `farmer` or `admin` depending on the endpoint.
- Admin dashboard and admin APIs require `admin`.

---

## Data Models

### `User`

Stores account data, role, password hash, phone, and saved addresses.

Important fields:

- `name`
- `email`
- `password`
- `role`: `user`, `farmer`, or `admin`
- `phone`
- `addresses[]`

### `Product`

Stores product catalog data.

Important fields:

- `name`
- `slug`
- `description`
- `price`
- `discountPrice`
- `category`
- `farmer`
- `image`
- `images[]`
- `unit`
- `stock`
- `sold`
- `averageRating`
- `numReviews`
- `tags[]`
- `isFeatured`
- `isActive`

### `Category`

Stores product category data.

Important fields:

- `name`
- `slug`
- `description`
- `image`
- `parent`
- `isActive`

### `Cart`

Stores one cart per user.

Important fields:

- `user`
- `items[]`
- `coupon`
- virtual `itemsPrice`

### `Order`

Stores checkout/order data.

Important fields:

- `user`
- `orderItems[]`
- `shippingAddress`
- `deliverySlot`
- `paymentMethod`
- `paymentStatus`
- `coupon`
- `itemsPrice`
- `taxPrice`
- `shippingPrice`
- `discountPrice`
- `totalPrice`
- `status`
- `statusHistory[]`
- `isPaid`
- `isDelivered`

### `Review`

Stores moderated product reviews.

Important fields:

- `user`
- `product`
- `order`
- `rating`
- `title`
- `comment`
- `status`: `pending`, `approved`, or `rejected`
- `moderatedBy`
- `moderatedAt`

### `Coupon`

Stores discount rules.

Important fields:

- `code`
- `type`: `percent` or `fixed`
- `value`
- `minOrderAmount`
- `maxDiscount`
- `usageLimit`
- `usedCount`
- `expiresAt`
- `isActive`

---

## Important File Map

### Backend Files

| Path | Description |
|---|---|
| `backend/server.js` | Main Express entry point; configures middleware, routers, error handling, and server startup. |
| `backend/config/db.js` | Connects to MongoDB with retry handling and connection event logging. |
| `backend/config/cloudinary.js` | Placeholder for future Cloudinary configuration. |
| `backend/config/env.js` | Placeholder for centralized environment configuration. |
| `backend/controllers/adminController.js` | Handles admin stats, users, all orders, sales reports, and admin user management. |
| `backend/controllers/authController.js` | Handles registration, login, current user lookup, password change, and logout. |
| `backend/controllers/cartController.js` | Handles cart creation, item updates, cart totals, and cart coupon application. |
| `backend/controllers/categoryController.js` | Handles category listing and admin category CRUD. |
| `backend/controllers/couponController.js` | Handles coupon validation and admin coupon CRUD. |
| `backend/controllers/orderController.js` | Handles checkout summary, order creation, user orders, farmer orders, tracking, reorder, payment marking, and status updates. |
| `backend/controllers/productController.js` | Handles product listing, details, related products, featured products, and product CRUD. |
| `backend/controllers/reviewController.js` | Handles product reviews, review submission, moderation, deletion, and rating recalculation. |
| `backend/controllers/userController.js` | Handles user profile, saved addresses, and account deletion. |
| `backend/data/dummyData.js` | Small development data helper. |
| `backend/data/seed.js` | Seeds sample users, categories, products, and coupons into MongoDB. |
| `backend/docs/apiDocs.md` | Short existing backend API route summary. |
| `backend/middleware/asyncHandler.js` | Custom async wrapper for forwarding promise errors to Express. |
| `backend/middleware/authMiddleware.js` | JWT authentication, role authorization, and optional authentication helpers. |
| `backend/middleware/errorMiddleware.js` | Central 404 and error response handling. |
| `backend/middleware/roleMiddleware.js` | Additional role helper exports; current routers mainly use `authMiddleware.js`. |
| `backend/middleware/validateMiddleware.js` | Request body sanitization and required-field middleware helpers. |
| `backend/models/Cart.js` | Mongoose cart schema with cart items, coupon info, and virtual item total. |
| `backend/models/Category.js` | Mongoose category schema with automatic slug generation. |
| `backend/models/Coupon.js` | Mongoose coupon schema with discount calculation method. |
| `backend/models/Order.js` | Mongoose order schema with items, address, payment, totals, and status history. |
| `backend/models/Product.js` | Mongoose product schema with pricing, stock, farmer, rating, search indexes, and slug generation. |
| `backend/models/Review.js` | Mongoose review schema with one-review-per-user-per-product index. |
| `backend/models/User.js` | Mongoose user schema with password hashing and password comparison method. |
| `backend/routes/adminRoutes.js` | Admin-only router for dashboard, users, orders, status updates, and reports. |
| `backend/routes/authRoutes.js` | Authentication router for register, login, logout, current user, and password update. |
| `backend/routes/cartRoutes.js` | Private cart router for item and coupon actions. |
| `backend/routes/categoryRoutes.js` | Public/admin category router. |
| `backend/routes/couponRoutes.js` | Coupon validation and admin coupon management router. |
| `backend/routes/orderRoutes.js` | Private order router for checkout, history, tracking, farmer order views, reorder, and payment marking. |
| `backend/routes/productRoutes.js` | Product router for public catalog access and admin/farmer product management. |
| `backend/routes/reviewRoutes.js` | Review router for public product reviews, private submissions, and admin moderation. |
| `backend/routes/userRoutes.js` | Private user profile and address router. |
| `backend/services/authService.js` | User registration, login, password change, and token-return user sanitization. |
| `backend/services/orderService.js` | Shared pricing, shipping, tax, and coupon total calculations. |
| `backend/services/paymentService.js` | Payment-session placeholder and mark-paid helper. |
| `backend/services/productService.js` | Stock validation and product rating recalculation. |
| `backend/tests/sample.test.js` | Empty test placeholder. |
| `backend/utils/apiFeatures.js` | Product filtering, sorting, and pagination helpers. |
| `backend/utils/constants.js` | Shared enums for order statuses, payment methods, review statuses, and product units. |
| `backend/utils/generateToken.js` | Generates signed JWTs. |
| `backend/utils/validators.js` | Email normalization, slug generation, and required-field helper. |

### Frontend Files

| Path | Description |
|---|---|
| `frontend/src/main.jsx` | React entry point; wraps app with router, auth provider, and cart provider. |
| `frontend/src/App.jsx` | Main app shell with navbar, routed page area, and footer. |
| `frontend/src/App.css` | App-level CSS. |
| `frontend/src/index.css` | Global CSS and Tailwind imports/custom styles. |
| `frontend/src/components/AddressForm.jsx` | Reusable address form for checkout and dashboard address management. |
| `frontend/src/components/Cart.jsx` | Legacy/simple cart component. The route currently uses `pages/Cart.jsx`. |
| `frontend/src/components/Dashboard.jsx` | Legacy dashboard component. Current dashboards are in `pages/dashboards`. |
| `frontend/src/components/EmptyState.jsx` | Reusable empty-state UI with optional action link. |
| `frontend/src/components/Footer.jsx` | Site footer. |
| `frontend/src/components/Loader.jsx` | Page loader and skeleton loading components. |
| `frontend/src/components/Navbar.jsx` | Main navigation bar with role-aware dashboard links and logout. |
| `frontend/src/components/Order.jsx` | Legacy/simple order component. Current order UI is in pages/dashboards and `OrderDetails`. |
| `frontend/src/components/OrderTimeline.jsx` | Appears to contain navigation/brand-style code; review naming before production. |
| `frontend/src/components/ProductCard.jsx` | Product card UI with pricing, rating, and add-to-cart behavior. |
| `frontend/src/components/ProjectedHint.jsx` | Login-required hint component; filename likely intended to be `ProtectedHint.jsx`. |
| `frontend/src/components/RatingStars.jsx` | Reusable star rating display. |
| `frontend/src/components/SectionHeader.jsx` | Reusable section heading component. |
| `frontend/src/components/StatusBadge.jsx` | Reusable status badge for order/review states. |
| `frontend/src/context/AuthContext.jsx` | Global authentication state and login/register/logout methods. |
| `frontend/src/context/CartContext.jsx` | Global cart state, cart refresh, item actions, and coupon application. |
| `frontend/src/features/AddToCartFeature.jsx` | Product add-to-cart feature with quantity selector. |
| `frontend/src/features/CartQuantityFeature.jsx` | Cart page feature with item rows, quantity controls, and order summary. |
| `frontend/src/features/ProductDetailsFeature.jsx` | Product detail feature with gallery, product info, reviews, and review form. |
| `frontend/src/features/ProductListingFeature.jsx` | Product list loading feature with pagination-safe product unwrapping. |
| `frontend/src/features/SearchFilterSortFeature.jsx` | Product filter, sort, URL query, and API query helpers. |
| `frontend/src/features/index.js` | Feature export barrel. |
| `frontend/src/hooks/useAuth.js` | Convenience hook for accessing `AuthContext`. |
| `frontend/src/hooks/useCart.js` | Convenience hook for accessing `CartContext`. |
| `frontend/src/pages/Home.jsx` | Public landing page. |
| `frontend/src/pages/Products.jsx` | Public product browsing page with search/filter/sort/pagination. |
| `frontend/src/pages/ProductDetails.jsx` | Product detail route page. |
| `frontend/src/pages/Cart.jsx` | Protected cart route page. |
| `frontend/src/pages/Checkout.jsx` | Protected checkout route page. |
| `frontend/src/pages/OrderDetails.jsx` | Protected order details route page. |
| `frontend/src/pages/auth/Login.jsx` | Login page with role-aware post-login redirect. |
| `frontend/src/pages/auth/Register.jsx` | Registration page with role-aware post-register redirect. |
| `frontend/src/pages/dashboards/AdminDashboard.jsx` | Admin dashboard for stats, products, categories, orders, reviews, reports, and coupons. |
| `frontend/src/pages/dashboards/FarmerDashboard.jsx` | Farmer dashboard for own products and relevant orders. |
| `frontend/src/pages/dashboards/UserDashboard.jsx` | Customer dashboard for orders, addresses, reviews, and profile. |
| `frontend/src/pages/dashboards/useAdminData.js` | Admin data helper hook/module. |
| `frontend/src/routes/AppRoutes.jsx` | Central frontend route table. |
| `frontend/src/routes/DashboardRedirect.jsx` | Role-based redirect from `/dashboard`. |
| `frontend/src/routes/ProtectedRoute.jsx` | Auth-only route guard. |
| `frontend/src/routes/RoleRoute.jsx` | Role-specific route guard. |
| `frontend/src/services/adminService.js` | Admin API client functions. |
| `frontend/src/services/api.js` | Shared Axios instance and JWT interceptors. |
| `frontend/src/services/authService.js` | Auth API client functions. |
| `frontend/src/services/cartService.js` | Cart API client functions. |
| `frontend/src/services/categoryService.js` | Category API client functions. |
| `frontend/src/services/couponService.js` | Coupon API client functions. |
| `frontend/src/services/orderService.js` | Order API client functions. |
| `frontend/src/services/productService.js` | Product API client functions. |
| `frontend/src/services/reviewService.js` | Review API client functions. |
| `frontend/src/services/userService.js` | User/profile/address API client functions. |
| `frontend/src/utils/helpers.js` | Shared frontend helper functions, including error-message handling and formatting helpers. |
| `frontend/vite.config.js` | Vite configuration. |
| `frontend/tailwind.config.cjs` | Tailwind theme configuration. |
| `frontend/postcss.config.cjs` | PostCSS configuration. |
| `frontend/eslint.config.js` | ESLint configuration. |
| `frontend/index.html` | HTML entry document. |

---

## Available Scripts

### Backend Scripts

Run from `backend/`.

| Command | Description |
|---|---|
| `npm install` | Install backend dependencies |
| `npm run dev` | Start backend with Nodemon |
| `npm start` | Start backend with Node |
| `npm run seed` | Seed sample database data |
| `npm run seed:destroy` | Delete seeded database data |
| `npm test` | Currently placeholder script that exits with an error |

### Frontend Scripts

Run from `frontend/`.

| Command | Description |
|---|---|
| `npm install` | Install frontend dependencies |
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build production frontend into `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

---

## Development Workflow

A typical local development workflow:

```bash
# Terminal 1
cd backend
npm install
npm run dev

# Terminal 2
cd frontend
npm install
npm run dev
```

Then open:

```text
http://localhost:5173
```

Recommended workflow for new work:

1. Create or update backend model/controller/service logic.
2. Expose the behavior through a router.
3. Add or update the matching frontend service function.
4. Use the service function inside a page, feature, context, or dashboard.
5. Test the UI flow with the correct user role.
6. Run frontend linting.
7. Test backend endpoints with Postman, Insomnia, cURL, or the frontend.

---

## Production Notes

Before deployment:

- Replace all local `.env` values with production secrets.
- Use a strong `JWT_SECRET`.
- Set `NODE_ENV=production` on the backend.
- Set `FRONTEND_URL` and `CLIENT_URL` to the deployed frontend URL.
- Set `VITE_API_URL` to the deployed backend API base URL.
- Build the frontend with `npm run build`.
- Do not commit `.env`, `node_modules`, `dist`, logs, or local uploads.
- Choose one product name: `ArgoFarm` or `KrishiMart`.
- Replace placeholder payment logic with real payment gateway SDK/API logic before accepting real online payments.
- Review CORS origins carefully.
- Add automated tests before production release.

---

## Troubleshooting

### Backend cannot connect to MongoDB

Check:

- `MONGO_URI` exists in `backend/.env`.
- MongoDB is running if using local MongoDB.
- MongoDB Atlas IP access list allows your machine/server.
- Database username/password are correct.

### Frontend cannot call backend

Check:

- Backend is running on `http://localhost:5000`.
- `frontend/.env` contains `VITE_API_URL=http://localhost:5000/api`.
- You restarted Vite after changing `.env`.
- Backend CORS allows the frontend origin, usually `http://localhost:5173`.

### Login works but protected pages redirect incorrectly

Check:

- Token exists in `localStorage` under `token`.
- `GET /api/auth/me` returns the user.
- User object includes a valid `role`.
- Route is using `ProtectedRoute` for login-only pages or `RoleRoute` for role-specific pages.

### Admin or farmer is redirected to the user dashboard

The project already includes a fix through `DashboardRedirect`, `RoleRoute`, and role-aware dashboard links. Check that all dashboard navigation uses:

- Admin: `/admin`
- Farmer: `/dashboard/farmer`
- User: `/dashboard/user`

### Cart looks empty after adding items

Check:

- User is logged in.
- `Authorization: Bearer <token>` is being sent.
- Product is active and has stock.
- The cart response is handled as a direct cart object or wrapped `{ success, data }` object. `CartContext` already supports both.

### Coupons do not apply

Check:

- Coupon exists and is active.
- Coupon is not expired.
- Usage limit has not been reached.
- Cart/order amount meets `minOrderAmount`.
- Calculated discount is greater than zero.

### Seed script removed my data

This is expected. The seed script is designed for development and clears selected collections before inserting sample data. Do not run it on production data.

---

## Maintainer Notes

The project is already organized in a maintainable MERN structure. The most important cleanup tasks before production are:

1. Standardize the project name across API docs, server messages, navbar, footer, and pages.
2. Replace placeholder payment session logic with real provider integrations.
3. Remove or rename legacy/misaligned components such as `components/Dashboard.jsx`, `components/Order.jsx`, `components/OrderTimeline.jsx`, and `ProjectedHint.jsx` if they are not used.
4. Add automated backend tests for auth, product, cart, order, and admin routes.
5. Add frontend tests for route guards, auth flow, cart flow, and dashboard role redirects.
6. Add `.env.example` files for backend and frontend.
7. Review all response shapes and standardize them where practical.