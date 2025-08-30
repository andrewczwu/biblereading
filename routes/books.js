const express = require('express');
const { db } = require('../config/firebase');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const booksSnapshot = await db.collection('books')
      .orderBy('order')
      .get();

    if (booksSnapshot.empty) {
      return res.status(404).json({ 
        success: false, 
        message: 'No books found. Please seed the database first.' 
      });
    }

    const books = booksSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      chaptersWithVerses: doc.data().chapters.map((verses, index) => ({
        chapter: index + 1,
        verses: verses
      }))
    }));

    res.json({
      success: true,
      data: books,
      total: books.length
    });
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

router.get('/:bookId', async (req, res) => {
  try {
    const { bookId } = req.params;
    const bookDoc = await db.collection('books').doc(bookId).get();

    if (!bookDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    const bookData = bookDoc.data();
    res.json({
      success: true,
      data: {
        id: bookDoc.id,
        ...bookData,
        chaptersWithVerses: bookData.chapters.map((verses, index) => ({
          chapter: index + 1,
          verses: verses
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;