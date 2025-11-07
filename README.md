# InventoryPro — Real-Time Inventory & Order Management System

A full-stack web application for managing inventory, products, orders, and users in real time. Built with **Java Spring Boot** (backend) and **React.js** (frontend).

**Duration:** November 4–7, 2025

---

## Features

- **Dashboard** — Live summary of total products, categories, orders, pending orders, and low-stock alerts
- **Product Management** — Full CRUD with SKU, pricing, category assignment, and low-stock threshold configuration
- **Order Management** — Create orders with multiple line items, track status through the fulfillment lifecycle, automatic stock deduction
- **Stock Alerts** — Real-time low-stock detection with urgency levels (Low / Warning / Critical / Out of Stock), inline restock capability
- **User Management** — Admin-only user creation with role-based access (ADMIN / STAFF)
- **JWT Authentication** — Stateless token-based auth with Spring Security and role-based endpoint protection

---

## Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Backend    | Java 17, Spring Boot 3.2, Spring Security |
| ORM        | Spring Data JPA, Hibernate              |
| Auth       | JWT (jjwt 0.11.5), BCrypt               |
| Database   | H2 (dev), PostgreSQL-compatible schema  |
| Validation | Jakarta Bean Validation                 |
| Frontend   | React 18, React Router v6               |
| HTTP       | Axios                                   |
| UI         | Bootstrap 5, Bootstrap Icons            |
| Testing    | JUnit 5, Mockito                        |
| Build      | Maven (backend), Create React App (frontend) |

---

## Project Structure

```
InventoryPro/
├── backend/                     # Spring Boot application
│   ├── pom.xml
│   └── src/
│       ├── main/java/com/inventorypro/
│       │   ├── InventoryProApplication.java
│       │   ├── config/          # Security, DataSeeder
│       │   ├── controller/      # REST controllers (Auth, Product, Category, Order, User, Dashboard)
│       │   ├── dto/             # Data Transfer Objects
│       │   ├── entity/          # JPA entities (Product, Category, Order, OrderItem, User)
│       │   ├── exception/       # Global exception handler
│       │   ├── repository/      # Spring Data JPA repositories
│       │   ├── security/        # JWT filter, token provider, UserDetailsService
│       │   └── service/         # Business logic services
│       ├── main/resources/
│       │   └── application.properties
│       └── test/java/com/inventorypro/service/
│           ├── ProductServiceTest.java
│           ├── OrderServiceTest.java
│           └── UserServiceTest.java
└── frontend/                    # React application
    ├── package.json
    ├── public/index.html
    └── src/
        ├── App.js
        ├── index.js
        ├── index.css
        ├── api/axios.js         # Axios instance with JWT interceptor
        ├── context/AuthContext.js
        ├── components/
        │   ├── Navbar.js
        │   └── PrivateRoute.js
        └── pages/
            ├── Login.js
            ├── Dashboard.js
            ├── Products.js
            ├── Orders.js
            ├── StockAlerts.js
            └── Users.js
```

---

## Database Schema

Five related tables:

| Table         | Description                                      |
|---------------|--------------------------------------------------|
| `users`       | System users with roles (ADMIN, STAFF)           |
| `categories`  | Product categories                               |
| `products`    | Inventory items with SKU, price, stock quantity  |
| `orders`      | Customer orders with status tracking             |
| `order_items` | Line items linking orders to products            |

**Seed data:** 8 categories, 55+ products, 22 orders auto-loaded on startup.

---

## Setup & Running

### Prerequisites

- Java 17+
- Maven 3.8+
- Node.js 18+ and npm

### Backend

```bash
cd backend
mvn spring-boot:run
```

The server starts on **http://localhost:8080**.

H2 Console (dev): http://localhost:8080/h2-console  
- JDBC URL: `jdbc:h2:mem:inventoryprodb`  
- Username: `sa` | Password: *(empty)*

### Frontend

```bash
cd frontend
npm install
npm start
```

The React app starts on **http://localhost:3000** and proxies API calls to the backend.

### Run Tests

```bash
cd backend
mvn test
```

---

## API Documentation

Base URL: `http://localhost:8080/api`

All endpoints (except `/auth/**`) require `Authorization: Bearer <token>`.

### Authentication

| Method | Endpoint        | Description          | Auth |
|--------|-----------------|----------------------|------|
| POST   | `/auth/login`   | Obtain JWT token     | None |
| GET    | `/auth/me`      | Get current user     | Any  |

**Login request:**
```json
{ "username": "admin", "password": "admin123" }
```

**Login response:**
```json
{
  "token": "<jwt>",
  "username": "admin",
  "role": "ADMIN",
  "fullName": "System Administrator"
}
```

### Products

| Method | Endpoint                      | Description                   | Role        |
|--------|-------------------------------|-------------------------------|-------------|
| GET    | `/products`                   | List all products              | Any         |
| GET    | `/products?search=<q>`        | Search by name                 | Any         |
| GET    | `/products?categoryId=<id>`   | Filter by category             | Any         |
| GET    | `/products/{id}`              | Get product by ID              | Any         |
| GET    | `/products/low-stock`         | List low-stock products        | Any         |
| GET    | `/products/low-stock/count`   | Count low-stock products       | Any         |
| POST   | `/products`                   | Create product                 | ADMIN       |
| PUT    | `/products/{id}`              | Update product                 | ADMIN       |
| DELETE | `/products/{id}`              | Delete product                 | ADMIN       |

### Categories

| Method | Endpoint             | Description          | Role  |
|--------|----------------------|----------------------|-------|
| GET    | `/categories`        | List all categories  | Any   |
| GET    | `/categories/{id}`   | Get category by ID   | Any   |
| POST   | `/categories`        | Create category      | ADMIN |
| PUT    | `/categories/{id}`   | Update category      | ADMIN |
| DELETE | `/categories/{id}`   | Delete category      | ADMIN |

### Orders

| Method | Endpoint                    | Description              | Role |
|--------|-----------------------------|--------------------------|------|
| GET    | `/orders`                   | List all orders           | Any  |
| GET    | `/orders?status=<status>`   | Filter by status          | Any  |
| GET    | `/orders/{id}`              | Get order by ID           | Any  |
| GET    | `/orders/recent?limit=<n>`  | Get recent orders         | Any  |
| POST   | `/orders`                   | Create order              | Any  |
| PATCH  | `/orders/{id}/status`       | Update order status       | Any  |
| POST   | `/orders/{id}/cancel`       | Cancel order              | Any  |

**Order statuses:** `PENDING` → `PROCESSING` → `SHIPPED` → `DELIVERED` | `CANCELLED`

### Users (ADMIN only)

| Method | Endpoint                       | Description           |
|--------|--------------------------------|-----------------------|
| GET    | `/users`                       | List all users        |
| GET    | `/users/{id}`                  | Get user by ID        |
| POST   | `/users`                       | Create user           |
| PUT    | `/users/{id}`                  | Update user           |
| PATCH  | `/users/{id}/toggle-status`    | Activate/deactivate   |
| DELETE | `/users/{id}`                  | Delete user           |

### Dashboard

| Method | Endpoint      | Description                                    |
|--------|---------------|------------------------------------------------|
| GET    | `/dashboard`  | Summary stats, low-stock list, recent orders  |

---

## Default Credentials

| Username | Password   | Role  |
|----------|------------|-------|
| `admin`  | `admin123` | ADMIN |
| `staff`  | `staff123` | STAFF |

---

## Production (PostgreSQL)

To switch to PostgreSQL, update `application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/inventorypro
spring.datasource.driverClassName=org.postgresql.Driver
spring.datasource.username=your_user
spring.datasource.password=your_password
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=update
spring.h2.console.enabled=false
```

---

## License

MIT
