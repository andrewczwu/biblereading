const express = require('express');
const cors = require('cors');
require('dotenv').config();

const booksRouter = require('./routes/books');
const readingPlansRouter = require('./routes/readingPlans');
const { seedBibleData } = require('./utils/seedData');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/books', booksRouter);
app.use('/api/reading-plans', readingPlansRouter);

app.get('/', (req, res) => {
  res.json({
    message: 'Bible Reading API',
    version: '1.0.0',
    endpoints: {
      books: {
        'GET /api/books': 'Get all books of the Bible',
        'GET /api/books/:bookId': 'Get a specific book by ID'
      },
      readingPlans: {
        'GET /api/reading-plans': 'Get all reading plans (query: ?active=true&type=whole-bible)',
        'GET /api/reading-plans/:planId': 'Get a specific reading plan',
        'POST /api/reading-plans': 'Create a new reading plan',
        'PUT /api/reading-plans/:planId/progress': 'Update reading plan progress',
        'DELETE /api/reading-plans/:planId': 'Delete a reading plan'
      },
      utility: {
        'POST /api/seed': 'Seed the database with Bible data'
      }
    }
  });
});

app.post('/api/seed', async (req, res) => {
  try {
    await seedBibleData();
    res.json({
      success: true,
      message: 'Bible data seeded successfully'
    });
  } catch (error) {
    console.error('Error seeding data:', error);
    res.status(500).json({
      success: false,
      message: 'Error seeding data',
      error: error.message
    });
  }
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: error.message
  });
});

app.listen(PORT, () => {
  console.log(`Bible Reading API server is running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} for API documentation`);
});

module.exports = app;