// Import required dependencies
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/database';
import config from './config/config';
import playerRoutes from './routes/player';
import mapRoutes from './routes/mapRoutes';
import gameMapRoutes from './routes/gameMapRoutes';

// Initialize Express application
const app = express();

// Connect to MongoDB
connectDB(config.mongodbUri);

// CORS configuration
app.use(cors({
  origin: config.corsOrigin,
  credentials: true
}));

// Enable JSON parsing
app.use(express.json());

// Routes
app.use('/api/players', playerRoutes);
app.use('/api/maps', mapRoutes);
app.use('/api/game-maps', gameMapRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to the backend API',
    environment: config.nodeEnv
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: config.nodeEnv === 'production' ? 'Internal server error' : err.message
  });
});

// Start the server
app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port} in ${config.nodeEnv} mode`);
  console.log(`CORS enabled for: ${config.corsOrigin}`);
}); 