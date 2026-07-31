import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import middlewares
import { errorHandler, AppError } from './middlewares/errorHandler';

// Import routes
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import couponRoutes from './routes/coupons';
import cmsRoutes from './routes/cms';
import adminRoutes from './routes/admin';

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Security & CORS Middlewares
app.use(helmet());

// Enable CORS for frontend requests (typically localhost:3000 in dev)
app.use(
  cors({
    origin: '*', // Allow all origins for dev simplicity, can be locked down in production
    credentials: true,
  })
);

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiter globally
app.use('/api', limiter);

// 3. Mount Routes
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'eCommerce Platform API Server is healthy and running.',
    timestamp: new Date(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/cms', cmsRoutes);
app.use('/api/admin', adminRoutes);

// 4. Handle 404 (Not Found) Errors
app.use('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// 5. Global Centralized Error Middleware
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`\n=======================================================`);
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api`);
  console.log(`=======================================================\n`);
});

export default app;
