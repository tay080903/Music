const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
// TODO: app.use('/api/users', require('./routes/users'));
// TODO: app.use('/api/posts', require('./routes/posts'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'MusicConnect API is running smoothly' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
