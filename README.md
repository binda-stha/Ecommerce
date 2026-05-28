# Multi-Vendor E-commerce Platform

A comprehensive PERN stack (PostgreSQL, Express, React, Node.js) e-commerce platform with multi-vendor support, role-based access control, and integrated payment processing.

## 🚀 Features

### User Roles

- **Admin**: Full platform control, trader approval, violation management, sales reports
- **Traders**: Shop management (2 shops max), product management (5 products per shop), order tracking
- **Customers**: Product browsing, cart management, checkout, loyalty points

### Core Functionality

- Multi-vendor marketplace with separate trader shops
- Guest cart with mandatory registration at checkout
- PayPal payment integration (sandbox)
- Digital invoice generation
- Customer loyalty points system (1 point = ₹100 spent)
- Product search and filtering (price, rating)
- Violation management system for traders

## 🛠️ Technology Stack

### Backend

- **Node.js** with Express.js framework
- **PostgreSQL** database with Sequelize ORM
- **JWT** authentication with Passport.js
- **PayPal REST SDK** for payment processing
- **bcryptjs** for password hashing

### Frontend

- **React** with Vite build tool
- **React Router** for navigation
- **TanStack Query** for state management
- **Axios** for API communication
- **Lucide React** for icons

## 📁 Project Structure

```
ecommerce/
├── backend/
│   ├── src/
│   │   ├── config/          # Database and app configuration
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Authentication and validation
│   │   ├── models/          # Sequelize database models
│   │   ├── routes/          # API route definitions
│   │   ├── services/        # Business logic
│   │   └── app.js          # Main server file
│   ├── .env                 # Environment variables
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API calls
│   │   ├── hooks/          # Custom React hooks
│   │   └── App.jsx         # Main React component
│   └── package.json
└── README.md
```

## 🚦 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd ecommerce
   ```

2. **Set up the backend**

   ```bash
   cd backend
   npm install

   # Copy environment file and configure
   cp .env.example .env
   # Edit .env with your database credentials and API keys
   ```

3. **Set up the frontend**

   ```bash
   cd ../frontend
   npm install
   ```

4. **Database Setup**
   - Create a PostgreSQL database named `ecommerce_db`
   - Update the database credentials in `backend/.env`

### Running the Application

1. **Start the backend server**

   ```bash
   cd backend
   npm run dev
   ```

   The API server will run on `http://localhost:5000`

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```
   The React app will run on `http://localhost:3000`

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ecommerce_db
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d

# PayPal Configuration (Sandbox)
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox
```

## 📊 Database Schema

### Key Models

- **Users**: Base user model with role-based access
- **Traders**: Trader-specific data with violation tracking
- **Shops**: Trader shops (max 2 per trader)
- **Products**: Shop products (max 5 per shop)
- **Orders**: Customer orders split between traders
- **Payments**: PayPal payment tracking
- **Points**: Customer loyalty points

## 🔐 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Traders

- `POST /api/traders/register` - Trader registration (requires admin approval)
- `GET /api/traders/shops` - Get trader shops
- `POST /api/traders/shops` - Create new shop

### Products

- `GET /api/products` - Get all products with filters
- `POST /api/products` - Create new product (traders only)
- `PUT /api/products/:id` - Update product (owner only)

### Orders

- `POST /api/orders/checkout` - Process checkout and payment
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get specific order details

### Admin

- `GET /api/admin/traders` - Get all traders for approval
- `PATCH /api/admin/traders/:id/approve` - Approve trader
- `GET /api/admin/sales-report` - Get sales analytics

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 🚀 Deployment

### Backend Deployment

1. Set up PostgreSQL database on your hosting platform
2. Configure environment variables for production
3. Deploy to your preferred hosting service (Heroku, Railway, etc.)

### Frontend Deployment

1. Build the React app
   ```bash
   cd frontend
   npm run build
   ```
2. Deploy the `dist` folder to your static hosting service

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Developer**: Binda Shrestha
- **Project Type**: College Project
- **Course**: BCA (Bachelor of Computer Applications)

## 🆘 Support

If you encounter any issues or have questions, please create an issue in the repository or contact the development team.

---

**Note**: This is a college project for educational purposes. The PayPal integration uses sandbox mode for testing.
