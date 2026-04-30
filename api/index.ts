import express from 'express';
import cors from 'cors';
import { connectDB } from '../backend/src/config/db';
import authRoutes from '../backend/src/routes/authRoutes';
import projectRoutes from '../backend/src/routes/projectRoutes';
import taskRoutes from '../backend/src/routes/taskRoutes';
import userRoutes from '../backend/src/routes/userRoutes';

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/api', (req, res) => {
  res.json({ message: 'API is running' });
});

export default app;
