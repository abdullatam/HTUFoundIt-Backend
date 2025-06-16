# HTUFoundIt Backend Application

**HTUFoundIt Backend** is a robust, secure, and scalable Express.js + Node.js RESTful API designed to power the HTUFoundIt lost-and-found system at Al‑Hussein Technical University (HTU). It provides authenticated, role-aware endpoints for managing lost items, found items, matches, and users, all backed by PostgreSQL and Auth0.

---

## 🚀 Key Features

### 🔐 Role-Based Authentication

* Secure JWT validation via **Auth0**
* Middleware to enforce **student** and **admin** roles

### 🔄 RESTful Endpoints

* **Lost Items**: Create, read, update, delete (`/api/lost-items`)
* **Found Items**: CRUD operations with image uploads (`/api/found-items`)
* **Matches**: Link lost and found items (`/api/matches`)
* **Users**: Public signup and admin user management (`/api/users`)

### 📦 File Uploads

* Image handling with **Multer**
* Uploaded files stored under `/uploads/` and referenced by URL in the database

### 🛢️ PostgreSQL Integration

* Connection pooling via **pg**
* SQL schema (`schema.sql`) defines enums, tables, and constraints

### 🤝 Error Handling & Logging

* Centralized error-handler middleware
* Consistent JSON error responses: `{ "error": "message" }`

---

## 📋 Project Structure

```
HTUFoundItBackend/
├── app.js                   # Express app setup: middleware, routes
├── db.js                    # PostgreSQL pool configuration (pg)
├── schema.sql               # SQL definitions: enums, tables, constraints
├── routes/                  # Route handlers grouped by resource
│   ├── lostItems.js         # /api/lost-items CRUD
│   ├── foundItems.js        # /api/found-items CRUD
│   ├── matches.js           # /api/matches CRUD
│   └── users.js             # /api/users public & admin
├── middleware/              # Authentication and error handling
│   ├── auth.js              # checkJwt, checkRole middleware
│   └── errorHandler.js      # centralized error handler
├── uploads/                 # Multer storage directory
├── .env.sample              # Example environment variables
├── package.json
└── README.md                # This documentation
```

---

## 🛠 Technologies

* **Server:** Node.js, Express.js
* **Authentication:** Auth0 (JWT via `express-jwt`, `jwks-rsa`)
* **Database:** PostgreSQL (pg)
* **File Uploads:** Multer
* **Environment:** dotenv

---

## 🚀 Getting Started

### Prerequisites

* **Node.js** v14+
* **PostgreSQL** database

### Setup

1. **Clone repository**:

   ```bash
   git clone https://github.com/abdullatam/HTUFoundIt-Backend.git
   cd HTUFoundIt-Backend
   ```
2. **Install dependencies**:

   ```bash
   npm install
   ```
3. **Configure environment**:

   ```bash
   cp .env.sample .env
   # Edit .env with your DB and Auth0 credentials
   ```
4. **Initialize database**:

   ```sql
   \i schema.sql
   ```
5. **Start server**:

   ```bash
   npm run dev
   ```

Access API at `http://localhost:3001/api` by default.

---

## 📚 API Reference

### Lost Items

```http
GET    /api/lost-items
GET    /api/lost-items/:id
POST   /api/lost-items
PUT    /api/lost-items/:id
DELETE /api/lost-items/:id
```

### Found Items

```http
GET    /api/found-items
GET    /api/found-items/:id
POST   /api/found-items
PUT    /api/found-items/:id
DELETE /api/found-items/:id
```

### Matches

```http
GET    /api/matches
POST   /api/matches
DELETE /api/matches/:id
```

### Users

```http
GET    /api/users
GET    /api/users/:id
POST   /api/users
PUT    /api/users/:id
DELETE /api/users/:id
```

*For full details on request/response schemas and required roles, refer to the source code in `routes/`.*

---

## 🛡 Authentication & Authorization

1. **`checkJwt`**: Verifies JWT signature, issuer, and audience.
2. **`checkRole(role)`**: Ensures user has required `student` or `admin` role.
3. **Error responses**: `401 Unauthorized` or `403 Forbidden` with JSON `{ "error": "message" }`.

---

## 🤝 Contributing

1. Fork the repo
2. Create feature branch: `git checkout -b feature/YourFeature`
3. Commit changes: \`git commit -m 'Add feature'\`\`
4. Push to branch: `git push origin feature/YourFeature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

⭐ **Thank you for using HTUFoundIt Backend!**
