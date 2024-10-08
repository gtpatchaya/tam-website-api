const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const contactRoutes = require('./routes/contactRoutes');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: ['https://tamcorporation.netlify.app', 'http://localhost:3000'],
    methods: '*',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200 // for legacy browser support
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes)

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});