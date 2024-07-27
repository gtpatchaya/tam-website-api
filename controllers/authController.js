const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { username, password } = req.body;
        const userId = await User.create(username, password);
        res.status(201).json({ message: 'User registered successfully', userId });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findByUsername(username);

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isValid = await User.validatePassword(user, password);

        if (!isValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error });
    }
};

exports.checkToken = async (req, res) => {
    try {
        const token = req.headers.authorization;

        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: 'Invalid token' });
            }

            const currentTime = Math.floor(Date.now() / 1000);
            const expiresAt = decoded.exp;
            const remainingTime = expiresAt - currentTime;

            if (remainingTime <= 0) {
                return res.status(401).json({ message: 'Token has expired' });
            }

            res.json({
                message: 'Token is valid',
                remainingTime: remainingTime
            });
        });
    } catch (error) {
        res.status(500).json({ message: 'Error checking token', error });
    }
};