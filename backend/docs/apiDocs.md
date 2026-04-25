# KrishiMart Backend API

Base URL: `http://localhost:5000/api`

## Auth
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me` Bearer token required
- `PUT /auth/update-password` Bearer token required

## Products
- `GET /products?search=rice&category=seeds&minPrice=10&maxPrice=500&sort=price_asc&page=1&limit=12`
- `GET /products/featured`
- `GET /products/:id`
- `POST /products` admin/farmer
- `PUT /products/:id` admin/farmer
- `DELETE /products/:id` admin

## Cart
- `GET /cart`
- `POST /cart` `{ "productId": "...", "quantity": 2 }`
- `PUT /cart/:productId` `{ "quantity": 3 }`
- `DELETE /cart/:productId`
- `POST /cart/coupon` `{ "code": "KRISHI10" }`

## Checkout and Orders
- `POST /orders/summary`
- `POST /orders`
- `GET /orders/my`
- `GET /orders/:id`
- `GET /orders/:id/track`
- `POST /orders/:id/reorder`

## Reviews
- `GET /reviews/product/:productId`
- `POST /reviews`
- `GET /reviews` admin
- `PUT /reviews/:id/approve` admin
- `PUT /reviews/:id/reject` admin
- `DELETE /reviews/:id`

## Admin
- `GET /admin/dashboard`
- `GET /admin/users`
- `GET /admin/orders`
- `PUT /admin/orders/:id/status`
- `GET /admin/reports/sales?startDate=2026-04-01&endDate=2026-04-30`
- `GET /admin/reviews`
