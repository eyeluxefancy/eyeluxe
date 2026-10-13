import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './db.js';
import productRoutes from './routes/products.js';
import rentalRoutes from './routes/rentals.js';
import billingRoutes from './routes/billing.js';
import expenseRoutes from './routes/expenses.js';
import reportRoutes from './routes/reports.js';
import authRoutes from './routes/auth.js';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS to allow frontend requests
const corsOptions = {
    origin: (origin, callback) => {
        // Allow any localhost port in development (Vite may pick 5173, 5174, 5175...)
        if (!origin || /^http:\/\/localhost:\d+$/.test(origin) ||
            origin === 'https://eyeluxefancy.github.io') {
            return callback(null, true);
        }
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Eyeluxe API is running (MongoDB)' });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/reports', reportRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('SERVER ERROR:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
