# User Order History API Documentation

## Overview
This API provides comprehensive order history functionality for authenticated users, including pagination, filtering, and detailed order information.

## Base URL
```
/api/user/orders
```

## Authentication
All endpoints require Firebase authentication token in the Authorization header:
```
Authorization: Bearer <firebase_token>
```

## Endpoints

### 1. Get User Orders (with Pagination & Filtering)
**GET** `/api/user/orders`

#### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number for pagination |
| `limit` | number | 10 | Number of orders per page |
| `status` | string | - | Filter by order status (Pending, Processing, Completed, Cancelled) |
| `startDate` | string | - | Filter orders from this date (YYYY-MM-DD) |
| `endDate` | string | - | Filter orders until this date (YYYY-MM-DD) |
| `sortBy` | string | createdAt | Sort field (createdAt, totalAmount) |
| `sortOrder` | string | desc | Sort direction (asc, desc) |

#### Example Request
```bash
GET /api/user/orders?page=1&limit=5&status=Completed&sortBy=createdAt&sortOrder=desc
```

#### Example Response
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "orderId": "ORD-12345",
        "userEmail": "user@example.com",
        "status": "Completed",
        "totalAmount": 299.99,
        "paymentMethod": "Credit Card",
        "items": [
          {
            "productId": "prod123",
            "name": "iPhone 15",
            "quantity": 1,
            "price": 299.99
          }
        ],
        "shippingAddress": {
          "street": "123 Main St",
          "city": "New York",
          "state": "NY",
          "zipCode": "10001"
        },
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-16T14:20:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalCount": 25,
      "hasNextPage": true,
      "hasPrevPage": false,
      "limit": 10
    }
  }
}
```

### 2. Get Single Order Details
**GET** `/api/user/orders/:orderId`

#### Path Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `orderId` | string | MongoDB ObjectId of the order |

#### Example Request
```bash
GET /api/user/orders/64f8a1b2c3d4e5f6a7b8c9d0
```

#### Example Response
```json
{
  "success": true,
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "orderId": "ORD-12345",
    "userEmail": "user@example.com",
    "status": "Completed",
    "totalAmount": 299.99,
    "paymentMethod": "Credit Card",
    "items": [
      {
        "productId": "prod123",
        "name": "iPhone 15",
        "quantity": 1,
        "price": 299.99,
        "image": "https://example.com/iphone15.jpg"
      }
    ],
    "shippingAddress": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    },
    "billingAddress": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    },
    "trackingNumber": "TRK123456789",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-16T14:20:00Z"
  }
}
```

### 3. Get User Order Statistics
**GET** `/api/user/orders/stats/summary`

#### Example Request
```bash
GET /api/user/orders/stats/summary
```

#### Example Response
```json
{
  "success": true,
  "data": {
    "totalOrders": 25,
    "totalAmount": 5247.50,
    "completedOrders": 20,
    "pendingOrders": 3,
    "cancelledOrders": 2
  }
}
```

## Error Responses

### 401 Unauthorized
```json
{
  "message": "Unauthorized Access"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Order not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal server error"
}
```

## Order Status Values
- `Pending`: Order placed but not yet processed
- `Processing`: Order is being prepared for shipment
- `Completed`: Order has been delivered successfully
- `Cancelled`: Order was cancelled

## Frontend Integration Example

### React Hook for Orders
```javascript
import { useState, useEffect } from 'react';
import useAxiosSecure from '@/utils/useAxiosSecure';

const useUserOrders = (filters = {}) => {
  const axiosSecure = useAxiosSecure();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await axiosSecure.get(`/user/orders?${queryParams}`);
      
      if (response.data.success) {
        setOrders(response.data.data.orders);
        setPagination(response.data.data.pagination);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  return { orders, loading, pagination, error, refetch: fetchOrders };
};

export default useUserOrders;
```

## Database Schema

### Orders Collection
```javascript
{
  _id: ObjectId,
  orderId: String, // Human-readable order ID
  userEmail: String, // User's email from Firebase auth
  status: String, // Order status
  totalAmount: Number, // Total order amount
  paymentMethod: String, // Payment method used
  items: [{
    productId: String,
    name: String,
    quantity: Number,
    price: Number,
    image: String
  }],
  shippingAddress: Object,
  billingAddress: Object,
  trackingNumber: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Security Notes
1. All endpoints require valid Firebase authentication
2. Users can only access their own orders
3. Order data is filtered by `userEmail` from the authenticated token
4. Input validation is performed on all query parameters
5. Pagination limits prevent excessive data retrieval
