const express = require('express');
const cors = require('cors');
const authRoutes = require('./auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('tutLabs API is running...');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
