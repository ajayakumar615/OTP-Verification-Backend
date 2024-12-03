const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./Config/db');
const userRoutes = require('./Routes/userRoutes');

//! Load environment variables
dotenv.config();

//! Connect to database
connectDB();

const app = express();
app.use(express.json());

//! Routes
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
