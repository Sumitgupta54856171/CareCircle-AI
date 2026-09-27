require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { Server } = require('socket.io');

const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const circleRoutes = require('./src/routes/circleRoutes');
const medicationRoutes = require('./src/routes/medicationRoutes');
const taskRoutes = require('./src/routes/taskRoutes');
const chatRoutes = require('./src/routes/chatRoutes');
const monitoringRoutes = require('./src/routes/monitoringRoutes');
const alertRoutes = require('./src/routes/alertRoutes');

const app = express();
const server = http.createServer(app);

// Connect to MongoDB
connectDB();

// Setup Socket.io for real-time alerts and updates
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  },
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);

  socket.on('join-circle', (circleId) => {
    socket.join(`care-circle:${circleId}`);
    console.log(`[Socket.io] Socket ${socket.id} joined care-circle:${circleId}`);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

// Middlewares
app.use(helmet({ contentSecurityPolicy: false }));
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health route
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'carecircle-express-backend',
    phase: 'Phase 1 MVP Core',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/circles', circleRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/plans', taskRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/monitoring', monitoringRoutes);
app.use('/api/alerts', alertRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: `API route ${req.originalUrl} not found.` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Backend Error]:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error occurred.',
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 CareCircle Express Server running on http://localhost:${PORT}`);
});