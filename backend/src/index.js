const express = require('express');
const cors = require('cors');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const dotenv = require('dotenv');
const path = require('path');
const authRoutes = require('./routes/auth');
const cardRoutes = require('./routes/cards');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Dynamic CORS configuration
const getCorsOrigins = () => {
  if (process.env.CORS_ORIGINS) {
    // Allow explicit CORS origins override
    return process.env.CORS_ORIGINS.split(',').map(origin => origin.trim());
  }
  
  if (process.env.NODE_ENV === 'production') {
    // In production, be more permissive but still secure
    const origins = ['http://localhost:3000', 'http://localhost'];
    
    // Add any custom frontend URL
    if (process.env.FRONTEND_URL) {
      origins.push(process.env.FRONTEND_URL);
    }
    
    return origins;
  }
  
  // In development, allow common dev ports
  return ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173']; // Vite dev server
};

const corsOrigins = getCorsOrigins();
console.log(`🌐 CORS Origins configured:`, corsOrigins);

app.use(cors({
  origin: corsOrigins,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.get('Origin')} - User-Agent: ${req.get('User-Agent')?.substring(0, 50)}`);
  next();
});

// Session configuration with SQLite store
app.use(session({
  store: new SQLiteStore({
    db: 'sessions.db',
    dir: path.join(__dirname, '../data')
  }),
  secret: process.env.SESSION_SECRET || 'your-secret-key-here',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cards', cardRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});