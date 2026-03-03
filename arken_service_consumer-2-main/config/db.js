const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    const dbUrl = process.env.DB_URL;
    console.log("🚀 ~ file: database.js ~ line 3 ~ process.env.DB_URL", dbUrl);

    try {
        await mongoose.connect(dbUrl);
        console.log('MongoDB connected');
    } catch (err) {
        console.error('❌ MongoDB connection error:', err.message);
        console.log('Retrying MongoDB connection in 5 seconds...');
        setTimeout(connectDB, 5000);
    }
};

module.exports = connectDB;