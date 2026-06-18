// src/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Ye .env file se API keys load karega

// Express app initialize kar rahe hain
const app = express();

// ─── MIDDLEWARES ─────────────────────────────────────────────────────────────
// CORS (Cross-Origin Resource Sharing): Frontend (3000) ko Backend (5000) se baat karne ki permission deta hai
app.use(cors({
    origin: 'http://localhost:3000', // Sirf hamare frontend ko allow karenge (Security!)
    credentials: true
}));

// Express ko JSON data samajhne ke liye power dena
app.use(express.json());

// 🔥 NAYA: Har incoming request aur error ko track karne ke liye Spy Middleware
app.use((req, res, next) => {
    console.log(`➡️ [${req.method}] Hit hua: ${req.url}`);
    next();
});

// ─── ROUTES ──────────────────────────────────────────────────────────────────
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes); // Ab sab requests /api/auth se shuru hongi

// ─── TEST ROUTE ──────────────────────────────────────────────────────────────
// Ye check karne ke liye ki server zinda hai ya nahi
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        status: "success", 
        message: "Mailware Backend Engine is up and running! 🚀" 
    });
});

// ─── SERVER LISNTER ──────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`=================================`);
    console.log(`🚀 Server is running on PORT: ${PORT}`);
    console.log(`=================================`);
});