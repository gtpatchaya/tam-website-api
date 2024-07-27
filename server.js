const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const path = require('path')

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});