require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const decryptRoute = require('./routes/decryptroute');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/Proofofownership-metadata';
const PORT = process.env.PORT || 5000;

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB Connected Successfully!');
    console.log('📁 Database:', mongoose.connection.db.databaseName);
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error.message);
    process.exit(1);
  }
};

// Connect to database
connectDB();

// Routes
app.use('/api', decryptRoute);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    dbName: mongoose.connection.db?.databaseName || 'Unknown'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
