import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { getRawProductHunt, uploadProductHunt } from './controllers/productHuntController.js';
import { getProcessedReddit, getRawReddit } from './controllers/redditController.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health check
app.get('/health', (_, res) => res.json({ status: 'healthy' }));

// ProductHunt routes
app.get('/api/raw/product-hunt', getRawProductHunt);
app.get('/api/news/product-hunt', uploadProductHunt);
app.get('/api/raw/reddit', getRawReddit);
app.get('/api/raw/reddit-processed', getProcessedReddit);

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 'error',
        message: 'Something went wrong!',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Route not found'
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});