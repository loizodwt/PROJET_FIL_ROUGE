require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const authRoutes = require('./routes/auth.routes');
const filmRoutes = require('./routes/film.routes');
const memberRoutes = require('./routes/member.routes');
const categoryRoutes = require('./routes/category.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/auth', authRoutes);
app.use('/films', filmRoutes);
app.use('/me', memberRoutes);
app.use('/categories', categoryRoutes);

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// 404
app.use((_req, res) => res.status(404).json({ error: 'Route non trouvée' }));

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Erreur serveur' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
  });
}

module.exports = app;
