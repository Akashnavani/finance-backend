const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Import DB connection
const { sequelize } = require('./models');

// Import route modules
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// Import global error handler
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// --------------- Global Middlewares ---------------
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true // Allow cookies to be sent cross-origin
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --------------- Health Check ---------------
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Finance API is running',
    timestamp: new Date().toISOString()
  });
});

// --------------- API Routes ---------------
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);

// --------------- 404 Handler ---------------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// --------------- Global Error Handler ---------------
app.use(errorHandler);

// --------------- Start Server ---------------
const PORT = process.env.PORT || 5000;

sequelize
  .authenticate()
  .then(() => {
    console.log('✅ MySQL connected successfully');
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log('✅ Database synced');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    });
  })
  .catch((err) => {
    console.error('❌ Unable to connect to database:', err.message);
    process.exit(1);
  });

module.exports = app;
